import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Plus, Trash2, Ban, Clock, CalendarCheck } from "lucide-react";

interface Slot {
  id: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  is_blocked: boolean;
  is_booked: boolean;
}

const AdminAvailability = () => {
  const { toast } = useToast();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [submitting, setSubmitting] = useState(false);

  const fetchSlots = async () => {
    const { data } = await supabase
      .from("availability_slots")
      .select("*")
      .order("slot_date")
      .order("start_time");
    if (data) setSlots(data as Slot[]);
  };

  useEffect(() => { fetchSlots(); }, []);

  const dateStr = selectedDate ? format(selectedDate, "yyyy-MM-dd") : null;
  const slotsForDate = slots.filter(s => s.slot_date === dateStr);

  const addSlot = async () => {
    if (!dateStr) return;
    setSubmitting(true);
    const { error } = await supabase.from("availability_slots").insert({
      slot_date: dateStr,
      start_time: startTime,
      end_time: endTime,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Failed", description: error.message.includes("unique") ? "Slot already exists" : error.message, variant: "destructive" });
    } else {
      toast({ title: "Slot added" });
      fetchSlots();
    }
  };

  const toggleBlock = async (slot: Slot) => {
    await supabase.from("availability_slots").update({ is_blocked: !slot.is_blocked }).eq("id", slot.id);
    fetchSlots();
    toast({ title: slot.is_blocked ? "Slot unblocked" : "Slot blocked" });
  };

  const deleteSlot = async (id: string) => {
    await supabase.from("availability_slots").delete().eq("id", id);
    fetchSlots();
    toast({ title: "Slot removed" });
  };

  const blockEntireDate = async () => {
    if (!dateStr) return;
    const dateSlots = slotsForDate.filter(s => !s.is_blocked);
    for (const s of dateSlots) {
      await supabase.from("availability_slots").update({ is_blocked: true }).eq("id", s.id);
    }
    fetchSlots();
    toast({ title: "Date blocked" });
  };

  // Highlight dates that have slots
  const datesWithSlots = new Set(slots.map(s => s.slot_date));

  const formatTime = (t: string) => {
    const [h, m] = t.split(":");
    const hour = parseInt(h);
    return `${hour % 12 || 12}:${m} ${hour >= 12 ? "PM" : "AM"}`;
  };

  return (
    <div>
      <h2 className="font-display text-xl font-semibold text-foreground mb-6">Availability Calendar</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar */}
        <div className="bg-card border border-border rounded-lg p-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className={cn("p-3 pointer-events-auto")}
            modifiers={{ hasSlots: (date) => datesWithSlots.has(format(date, "yyyy-MM-dd")) }}
            modifiersClassNames={{ hasSlots: "bg-primary/20 text-primary font-semibold" }}
          />
        </div>

        {/* Slot management */}
        <div className="space-y-4">
          {dateStr && (
            <>
              <div className="bg-card border border-border rounded-lg p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <CalendarCheck size={14} className="text-primary" />
                    {selectedDate && format(selectedDate, "MMMM d, yyyy")}
                  </h3>
                  {slotsForDate.length > 0 && (
                    <Button size="sm" variant="outline" onClick={blockEntireDate} className="text-xs gap-1">
                      <Ban size={12} /> Block Day
                    </Button>
                  )}
                </div>

                {/* Add slot form */}
                <div className="flex items-end gap-2 mb-4">
                  <div className="space-y-1 flex-1">
                    <Label className="text-xs">Start</Label>
                    <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="bg-secondary border-border text-sm" />
                  </div>
                  <div className="space-y-1 flex-1">
                    <Label className="text-xs">End</Label>
                    <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="bg-secondary border-border text-sm" />
                  </div>
                  <Button onClick={addSlot} disabled={submitting} size="sm" className="gap-1">
                    <Plus size={14} /> Add
                  </Button>
                </div>

                {/* Existing slots */}
                {slotsForDate.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-4">No slots for this date.</p>
                ) : (
                  <div className="space-y-2">
                    {slotsForDate.map((slot) => (
                      <motion.div
                        key={slot.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={cn(
                          "flex items-center justify-between px-3 py-2.5 rounded-md border text-sm",
                          slot.is_blocked ? "bg-destructive/10 border-destructive/30" :
                          slot.is_booked ? "bg-blue-500/10 border-blue-500/30" :
                          "bg-secondary border-border"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <Clock size={13} className="text-muted-foreground" />
                          <span className="text-foreground font-medium">{formatTime(slot.start_time)} – {formatTime(slot.end_time)}</span>
                          {slot.is_blocked && <span className="text-[10px] text-destructive uppercase font-semibold">Blocked</span>}
                          {slot.is_booked && <span className="text-[10px] text-blue-400 uppercase font-semibold">Booked</span>}
                        </div>
                        <div className="flex items-center gap-1">
                          {!slot.is_booked && (
                            <Button size="icon" variant="ghost" onClick={() => toggleBlock(slot)} className="h-7 w-7">
                              <Ban size={13} className={slot.is_blocked ? "text-primary" : "text-muted-foreground"} />
                            </Button>
                          )}
                          {!slot.is_booked && (
                            <Button size="icon" variant="ghost" onClick={() => deleteSlot(slot.id)} className="h-7 w-7">
                              <Trash2 size={13} className="text-destructive" />
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAvailability;
