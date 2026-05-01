import { useState, useCallback } from "react";
import { format } from "date-fns";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, User, Mail, MessageSquare, Calendar } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { MeetingScheduler } from "../ui/meeting-scheduler";

function formatTime(date) {
  return format(date, "h:mm a");
}

export default function BookingModal({ session, creatorProfile, onClose }) {
  const [step, setStep] = useState("calendar"); // calendar -> details -> confirmed
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", note: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchBookedSlots = useCallback(
    async (date) => {
      setLoadingSlots(true);
      try {
        const dateStr = date.toISOString().split("T")[0];
        const { data, error: fetchErr } = await supabase
          .from("bookings")
          .select("start_time, end_time")
          .eq("session_type_id", session.id)
          .eq("booking_date", dateStr)
          .in("status", ["confirmed", "pending"]);

        if (fetchErr) {
          console.error("Error fetching bookings:", fetchErr);
          setBookedSlots([]);
        } else {
          setBookedSlots(data || []);
        }
      } catch (err) {
        console.error("Failed to check availability:", err);
        setBookedSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    },
    [session.id]
  );

  const handleDateSelect = useCallback(
    (date) => {
      setSelectedDate(date);
      fetchBookedSlots(date);
    },
    [fetchBookedSlots]
  );

  const handleScheduleSelect = ({ date, slot }) => {
    setSelectedDate(date);
    setSelectedSlot(slot);
    setStep("details");
  };

  async function handleBooking(e) {
    e.preventDefault();
    setError("");

    if (!formData.name.trim() || !formData.email.trim()) {
      setError("Name and email are required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    setSubmitting(true);
    try {
      const dateStr = selectedDate.toISOString().split("T")[0];
      const startTime = selectedSlot.start.toTimeString().slice(0, 8);
      const endTime = selectedSlot.end.toTimeString().slice(0, 8);

      const { error: insertErr } = await supabase.from("bookings").insert({
        session_type_id: session.id,
        creator_id: session.user_id,
        booking_date: dateStr,
        start_time: startTime,
        end_time: endTime,
        client_name: formData.name.trim(),
        client_email: formData.email.trim(),
        client_note: formData.note.trim() || null,
        status: "confirmed",
      });

      if (insertErr) throw insertErr;
      setStep("confirmed");
    } catch (err) {
      console.error("Booking failed:", err);
      setError("Failed to complete booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/10 hover:bg-black/20 text-gray-600 hover:text-gray-900 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <AnimatePresence mode="wait">
          {/* Step: Calendar + Time Selection */}
          {step === "calendar" && (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <MeetingScheduler
                title={session.title}
                description={`${session.duration_minutes} min session with ${creatorProfile?.display_name || "creator"} ${session.price ? `· ₹${session.price}` : "· Free"}`}
                durationMinutes={session.duration_minutes}
                bookedSlots={bookedSlots}
                loadingSlots={loadingSlots}
                onDateSelect={handleDateSelect}
                onSchedule={handleScheduleSelect}
                onCancel={onClose}
                scheduleButtonText="Continue"
                cancelButtonText="Cancel"
              />
            </motion.div>
          )}

          {/* Step: Details Form */}
          {step === "details" && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-5 text-white">
                <h2 className="text-xl font-bold">{session.title}</h2>
                <p className="text-white/80 text-sm mt-1">
                  Complete your booking details
                </p>
              </div>

              <div className="p-6">
                {/* Booking summary card */}
                <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 mb-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">
                      {format(selectedDate, "EEEE, MMMM d, yyyy")}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatTime(selectedSlot.start)} –{" "}
                      {formatTime(selectedSlot.end)} ·{" "}
                      {session.duration_minutes} min
                    </p>
                  </div>
                </div>

                {error && (
                  <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleBooking} className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                      <User className="w-4 h-4 text-gray-400" />
                      Your Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, name: e.target.value }))
                      }
                      placeholder="Enter your full name"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-gray-800"
                      required
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                      <Mail className="w-4 h-4 text-gray-400" />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, email: e.target.value }))
                      }
                      placeholder="you@example.com"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-gray-800"
                      required
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                      <MessageSquare className="w-4 h-4 text-gray-400" />
                      Note{" "}
                      <span className="text-gray-400 font-normal">
                        (optional)
                      </span>
                    </label>
                    <textarea
                      value={formData.note}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, note: e.target.value }))
                      }
                      placeholder="Anything you'd like to discuss..."
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition resize-none text-gray-800"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep("calendar")}
                      className="flex-1 py-3.5 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-[2] py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-purple-200 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Confirming...
                        </span>
                      ) : (
                        `Confirm Booking${session.price ? ` · ₹${session.price}` : ""}`
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {/* Step: Confirmed */}
          {step === "confirmed" && (
            <motion.div
              key="confirmed"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
            >
              <div className="p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-20 h-20 mx-auto mb-5 bg-green-100 rounded-full flex items-center justify-center"
                >
                  <Check className="w-10 h-10 text-green-500" />
                </motion.div>

                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  You're all set!
                </h3>
                <p className="text-gray-500 mb-8">
                  Your session has been booked successfully.
                </p>

                <div className="bg-gray-50 rounded-xl p-5 text-left space-y-4 mb-6 max-w-sm mx-auto">
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-purple-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400">Session with</p>
                      <p className="font-medium text-gray-800">
                        {creatorProfile?.display_name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-purple-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400">Date & Time</p>
                      <p className="font-medium text-gray-800">
                        {format(selectedDate, "EEEE, MMMM d, yyyy")}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatTime(selectedSlot.start)} –{" "}
                        {formatTime(selectedSlot.end)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-purple-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400">
                        Confirmation sent to
                      </p>
                      <p className="font-medium text-gray-800">
                        {formData.email}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="w-full max-w-sm py-3.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition"
                >
                  Done
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
