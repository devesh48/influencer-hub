import { useState, useEffect } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabaseClient";
import BookingModal from "../booking/BookingModal";

export default function SessionBookingCards({ profileId, creatorProfile }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingSession, setBookingSession] = useState(null);

  useEffect(() => {
    if (!profileId) return;

    async function loadSessions() {
      setLoading(true);
      const { data, error } = await supabase
        .from("session_types")
        .select("*")
        .eq("user_id", profileId)
        .eq("is_active", true)
        .order("is_most_popular", { ascending: false });

      if (error) {
        console.error("Failed to load session types:", error);
      } else {
        setSessions(data || []);
      }
      setLoading(false);
    }

    loadSessions();
  }, [profileId]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-3 border-white/10 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (sessions.length === 0) return null;

  return (
    <div className="mt-12">
      <div className="text-center mb-10">
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.05] border border-white/[0.08] text-sm text-white/60 mb-4 backdrop-blur-sm">
          <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          1:1 Sessions
        </span>
        <h2 className="text-3xl md:text-4xl font-bold text-white">
          Book a Personal{" "}
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Session
          </span>
        </h2>
        <p className="mt-3 text-white/40 max-w-md mx-auto">
          Choose a session type below and pick a time that works for you
        </p>
      </div>

      <div className="grid gap-5 max-w-xl mx-auto">
        {sessions.map((session, i) => (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.12, duration: 0.5 }}
            className={`group relative rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-0.5 ${
              session.is_most_popular
                ? "bg-white/[0.06] border border-purple-500/30 ring-1 ring-purple-500/10 hover:bg-white/[0.1] hover:border-purple-500/50"
                : "bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.07] hover:border-white/[0.1]"
            }`}
          >
            {/* Most Popular Badge */}
            {session.is_most_popular && (
              <div className="absolute top-0 right-0">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl shadow-lg shadow-purple-500/20">
                  MOST POPULAR
                </div>
              </div>
            )}

            <div className="p-6">
              {/* Title & Duration */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-white transition">
                    {session.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-1.5 text-sm text-white/40">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {session.duration_minutes} min
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Video Call
                    </span>
                  </div>
                </div>

                {/* Price */}
                <div className="text-right shrink-0">
                  {session.original_price && (
                    <span className="text-sm text-white/30 line-through block">
                      ₹{session.original_price}
                    </span>
                  )}
                  <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    {session.price ? `₹${session.price}` : "Free"}
                  </span>
                </div>
              </div>

              {/* Description */}
              {session.description && (
                <p className="text-sm text-white/40 leading-relaxed mb-5 line-clamp-2">
                  {session.description}
                </p>
              )}

              {/* Book Button */}
              <button
                onClick={() => setBookingSession(session)}
                className={`w-full py-3.5 font-semibold rounded-xl transition-all duration-300 ${
                  session.is_most_popular
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/25 hover:scale-[1.01]"
                    : "bg-white/[0.08] text-white border border-white/[0.1] hover:bg-white/[0.14] hover:border-white/[0.2] hover:scale-[1.01]"
                }`}
              >
                Check Availability & Book
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Booking Modal */}
      {bookingSession && (
        <BookingModal
          session={bookingSession}
          creatorProfile={creatorProfile}
          onClose={() => setBookingSession(null)}
        />
      )}
    </div>
  );
}
