import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Check } from "lucide-react";
import { format, isBefore, startOfDay } from "date-fns";

interface Slot {
  id: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  is_blocked: boolean;
  is_booked: boolean;
}

interface BookingCalendarProps {
  onSelect: (date: string, time: string) => void;
  selectedDate?: string;
  selectedTime?: string;
}

const BookingCalendar = ({ onSelect, selectedDate, selectedTime }: BookingCalendarProps) => {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [calendarDate, setCalendarDate] = useState<Date | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSlots = async () => {
      const { data } = await supabase
        .from("availability_slots")
        .select("*")
        .gte("slot_date", new Date().toISOString().split("T")[0])
        .order("slot_date")
        .order("start_time");
      if (data) setSlots(data as Slot[]);
      setLoading(false);
    };
    fetchSlots();
  }, []);

  const availableDates = new Set(
    slots.filter(s => !s.is_blocked && !s.is_booked).map(s => s.slot_date)
  );

  const selectedDateStr = calendarDate ? format(calendarDate, "yyyy-MM-dd") : null;
  const timeSlotsForDate = slots.filter(
    s => s.slot_date === selectedDateStr && !s.is_blocked && !s.is_booked
  );

  const isDateAvailable = (date: Date) => {
    if (isBefore(date, startOfDay(new Date()))) return false;
    return availableDates.has(format(date, "yyyy-MM-dd"));
  };

  const handleDateSelect = (date: Date | undefined) => {
    setCalendarDate(date);
  };

  const handleTimeSelect = (time: string) => {
    if (selectedDateStr) {
      onSelect(selectedDateStr, time);
    }
  };

  const formatTime = (time: string) => {
    const [h, m] = time.split(":");
    const hour = parseInt(h);
    const ampm = hour >= 12 ? "PM" : "AM";
    const h12 = hour % 12 || 12;
    return `${h12}:${m} ${ampm}`;
  };

  if (loading) {
    return <div className="h-[300px] bg-card border border-border rounded-lg animate-pulse" />;
  }

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-lg p-4">
        <Calendar
          mode="single"
          selected={calendarDate}
          onSelect={handleDateSelect}
          disabled={(date) => !isDateAvailable(date)}
          className={cn("p-3 pointer-events-auto")}
          classNames={{
            months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
            month: "space-y-4 w-full",
            caption: "flex justify-center pt-1 relative items-center",
            caption_label: "text-sm font-semibold text-foreground",
            nav: "space-x-1 flex items-center",
            nav_button: "h-8 w-8 bg-secondary border border-border rounded-md p-0 hover:bg-primary hover:text-primary-foreground transition-colors inline-flex items-center justify-center",
            nav_button_previous: "absolute left-1",
            nav_button_next: "absolute right-1",
            table: "w-full border-collapse",
            head_row: "flex",
            head_cell: "text-muted-foreground rounded-md w-full font-medium text-[0.75rem] py-2",
            row: "flex w-full mt-1",
            cell: "h-10 w-full text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
            day: "h-10 w-full p-0 font-normal rounded-md transition-all hover:bg-primary/20 aria-selected:opacity-100 inline-flex items-center justify-center",
            day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground font-semibold",
            day_today: "bg-accent/50 text-accent-foreground font-semibold",
            day_outside: "text-muted-foreground opacity-30",
            day_disabled: "text-muted-foreground opacity-20 cursor-not-allowed hover:bg-transparent",
            day_range_middle: "aria-selected:bg-accent",
            day_hidden: "invisible",
          }}
        />
      </div>

      <AnimatePresence mode="wait">
        {selectedDateStr && (
          <motion.div
            key={selectedDateStr}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            <p className="text-sm font-medium text-foreground">
              Available times for {calendarDate && format(calendarDate, "MMMM d, yyyy")}
            </p>
            {timeSlotsForDate.length === 0 ? (
              <p className="text-muted-foreground text-sm">No available slots for this date.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {timeSlotsForDate.map((slot) => {
                  const isSelected = selectedDate === selectedDateStr && selectedTime === slot.start_time;
                  return (
                    <button
                      key={slot.id}
                      onClick={() => handleTimeSelect(slot.start_time)}
                      className={cn(
                        "flex items-center justify-center gap-2 px-3 py-3 rounded-md border text-sm font-medium transition-all",
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-secondary border-border text-foreground hover:border-primary hover:text-primary"
                      )}
                    >
                      {isSelected ? <Check size={14} /> : <Clock size={14} className="text-muted-foreground" />}
                      {formatTime(slot.start_time)}
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BookingCalendar;
