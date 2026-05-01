import * as React from "react";
import { useState, useMemo } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isBefore,
  startOfDay,
} from "date-fns";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";

// Helper to format time for display
const formatTime = (date) =>
  date ? format(date, "h:mm a") : "Select time";

// Generate time slots for a given date and duration
function generateTimeSlots(date, durationMinutes, startHour = 9, endHour = 18) {
  const slots = [];
  const dayStart = new Date(date);
  dayStart.setHours(startHour, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(endHour, 0, 0, 0);

  let current = new Date(dayStart);
  while (current.getTime() + durationMinutes * 60000 <= dayEnd.getTime()) {
    slots.push({
      start: new Date(current),
      end: new Date(current.getTime() + durationMinutes * 60000),
    });
    current = new Date(current.getTime() + durationMinutes * 60000);
  }
  return slots;
}

// Main component
export const MeetingScheduler = ({
  title = "Schedule a session",
  description = "Pick a date and time that works for you.",
  scheduleButtonText = "Confirm Booking",
  cancelButtonText = "Cancel",
  durationMinutes = 30,
  bookedSlots = [],
  loadingSlots = false,
  onDateSelect,
  onSchedule,
  onCancel,
}) => {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const today = startOfDay(new Date());

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 }),
  });

  const handleDateClick = (day) => {
    if (isBefore(day, today)) return;
    // Skip Sundays
    if (day.getDay() === 0) return;
    setSelectedDate(day);
    setSelectedSlot(null);
    setNow(+new Date()); // refresh timestamp for filtering past slots
    if (onDateSelect) onDateSelect(day);
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => {
    const prev = subMonths(currentMonth, 1);
    if (!isBefore(endOfMonth(prev), today)) {
      setCurrentMonth(prev);
    }
  };

  // Snapshot current time; updated from handleDateClick to filter past slots
  const [now, setNow] = useState(() => +new Date());

  const availableSlots = useMemo(() => {
    const timeSlots = selectedDate
      ? generateTimeSlots(selectedDate, durationMinutes)
      : [];
    return timeSlots.filter((slot) => {
      if (slot.start.getTime() < now) return false;
      const slotStartStr = slot.start.toTimeString().slice(0, 5);
      return !bookedSlots.some(
        (b) => b.start_time?.slice(0, 5) === slotStartStr
      );
    });
  }, [selectedDate, durationMinutes, bookedSlots, now]);

  const handleSchedule = () => {
    if (selectedDate && selectedSlot) {
      onSchedule({ date: selectedDate, slot: selectedSlot });
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto overflow-hidden shadow-lg border-none bg-white/95 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <CardHeader className="flex flex-row items-start gap-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
          <div className="p-3 rounded-full bg-white/15">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <CardTitle className="text-xl font-semibold text-white">
              {title}
            </CardTitle>
            <CardDescription className="text-white/80">
              {description}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          {/* Left Side: Calendar */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={prevMonth}
                aria-label="Previous month"
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <AnimatePresence mode="wait">
                <motion.h3
                  key={format(currentMonth, "MMMM yyyy")}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="text-base font-semibold text-gray-800 text-center"
                >
                  {format(currentMonth, "MMMM yyyy")}
                </motion.h3>
              </AnimatePresence>
              <Button
                variant="ghost"
                size="icon"
                onClick={nextMonth}
                aria-label="Next month"
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            <div className="grid grid-cols-7 text-center text-xs font-medium text-gray-400 mb-1">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                (day) => (
                  <div key={day} className="py-2">
                    {day}
                  </div>
                )
              )}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {days.map((day) => {
                const isSelected =
                  selectedDate && isSameDay(day, selectedDate);
                const isPast = isBefore(day, today);
                const isSunday = day.getDay() === 0;
                const isDisabled = isPast || isSunday;
                const isToday = isSameDay(day, today);
                const isCurrentMonth = isSameMonth(day, currentMonth);

                return (
                  <motion.button
                    key={day.toString()}
                    onClick={() => !isDisabled && handleDateClick(day)}
                    whileHover={!isDisabled ? { scale: 1.08 } : {}}
                    whileTap={!isDisabled ? { scale: 0.95 } : {}}
                    disabled={isDisabled}
                    className={cn(
                      "relative h-10 w-10 rounded-full flex items-center justify-center text-sm transition-colors duration-200 mx-auto",
                      !isCurrentMonth && "text-gray-300",
                      isCurrentMonth && !isDisabled && "text-gray-700",
                      isDisabled && "text-gray-300 cursor-not-allowed",
                      isToday &&
                        !isSelected &&
                        "text-purple-600 font-bold ring-1 ring-purple-200",
                      isSelected &&
                        "bg-purple-600 text-white font-semibold shadow-md shadow-purple-200",
                      !isSelected &&
                        !isDisabled &&
                        "hover:bg-purple-50 hover:text-purple-700"
                    )}
                  >
                    {format(day, "d")}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Right Side: Time Slots */}
          <div className="flex flex-col">
            {!selectedDate ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center mb-4">
                  <Clock className="w-8 h-8 text-purple-400" />
                </div>
                <p className="text-gray-500 font-medium">Select a date</p>
                <p className="text-sm text-gray-400 mt-1">
                  Pick a date on the calendar to see available times
                </p>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-800">
                    {format(selectedDate, "EEEE, MMMM d, yyyy")}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {durationMinutes} min · 9:00 AM – 6:00 PM
                  </p>
                </div>

                {loadingSlots ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-8 h-8 border-3 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
                    <p className="mt-3 text-sm text-gray-400">
                      Checking availability...
                    </p>
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                      <Clock className="w-7 h-7 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">
                      No slots available
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      Try picking a different date
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2 max-h-[280px] overflow-y-auto pr-1">
                    {availableSlots.map((slot) => {
                      const isActive =
                        selectedSlot?.start.getTime() ===
                        slot.start.getTime();
                      return (
                        <motion.button
                          key={slot.start.toISOString()}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setSelectedSlot(slot)}
                          className={cn(
                            "py-2.5 px-2 rounded-lg text-sm font-medium transition-all",
                            isActive
                              ? "bg-purple-600 text-white shadow-md shadow-purple-200"
                              : "bg-gray-50 text-gray-700 hover:bg-purple-50 hover:text-purple-700 border border-gray-100"
                          )}
                        >
                          {formatTime(slot.start)}
                        </motion.button>
                      );
                    })}
                  </div>
                )}

                {/* Selected summary */}
                {selectedSlot && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-auto pt-4 border-t border-gray-100"
                  >
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                      <Clock className="w-4 h-4 text-purple-500" />
                      <span>
                        {format(selectedDate, "MMM d")} ·{" "}
                        {formatTime(selectedSlot.start)} –{" "}
                        {formatTime(selectedSlot.end)}
                      </span>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={onCancel}
                        className="flex-1 border-gray-200 text-gray-600 hover:bg-gray-50"
                      >
                        {cancelButtonText}
                      </Button>
                      <Button
                        onClick={handleSchedule}
                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        {scheduleButtonText}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </motion.div>
    </Card>
  );
};
