import { useState, useEffect } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import BookingCalendar from "@/components/BookingCalendar";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Phone, Mail, User, ArrowRight, ArrowLeft, Check, Calendar, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  discount_percent: number;
}

const BookSession = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  // Load plan from URL param if present
  useEffect(() => {
    const planId = searchParams.get("plan");
    if (planId) {
      const fetchPlan = async () => {
        const { data } = await supabase
          .from("consultation_plans")
          .select("*")
          .eq("id", planId)
          .maybeSingle();
        if (data) setSelectedPlan(data as Plan);
      };
      fetchPlan();
    }
  }, [searchParams]);

  if (loading) return null;
  if (!user) return <Navigate to="/auth?redirect=/book-session" replace />;

  const handleCalendarSelect = (date: string, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const { error } = await supabase.from("consultations").insert({
      user_id: user.id,
      name: form.name,
      email: form.email,
      phone: form.phone || null,
      message: form.message || null,
      plan_id: selectedPlan?.id || null,
      slot_date: selectedDate || null,
      slot_time: selectedTime || null,
      preferred_date: selectedDate ? new Date(`${selectedDate}T${selectedTime || "00:00:00"}`).toISOString() : null,
      status: "scheduled",
    });

    if (selectedDate && selectedTime) {
      await supabase
        .from("availability_slots")
        .update({ is_booked: true })
        .eq("slot_date", selectedDate)
        .eq("start_time", selectedTime);
    }

    setSubmitting(false);
    if (error) {
      toast({ title: "Booking failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Session booked!", description: "You'll receive confirmation once André reviews your booking." });
      navigate("/dashboard");
    }
  };

  const formatTime = (t: string) => {
    const [h, m] = t.split(":");
    const hour = parseInt(h);
    return `${hour % 12 || 12}:${m} ${hour >= 12 ? "PM" : "AM"}`;
  };

  const finalPrice = selectedPlan
    ? selectedPlan.discount_percent > 0
      ? selectedPlan.price * (1 - selectedPlan.discount_percent / 100)
      : selectedPlan.price
    : 0;

  const canProceedStep1 = form.name && form.email;
  const canProceedStep2 = selectedDate && selectedTime;

  return (
    <main>
      <Navigation />
      <section className="pt-32 pb-20 section-padding bg-background min-h-screen">
        <div className="max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <p className="text-xs font-medium tracking-[0.3em] uppercase text-primary mb-4">Book a Session</p>
            <h1 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-3">
              Schedule Your <span className="text-gradient-gold">Consultation</span>
            </h1>
            {selectedPlan && (
              <p className="text-muted-foreground text-sm mt-2">
                {selectedPlan.name} · {selectedPlan.duration_minutes}min · ${finalPrice.toFixed(2)}
                {selectedPlan.discount_percent > 0 && (
                  <span className="text-primary ml-1">({selectedPlan.discount_percent}% OFF)</span>
                )}
              </p>
            )}
          </motion.div>

          {/* Progress steps — now 3 steps */}
          <div className="flex items-center justify-center gap-2 mb-10">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                  step >= s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                }`}>
                  {step > s ? <Check size={14} /> : s}
                </div>
                {s < 3 && <div className={`w-8 h-0.5 ${step > s ? "bg-primary" : "bg-border"}`} />}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* Step 1: Client details */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="bg-card border border-border rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4">Your Details</h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Full Name</Label>
                        <div className="relative">
                          <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Your full name" className="pl-10 bg-secondary border-border" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <div className="relative">
                          <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required placeholder="you@example.com" className="pl-10 bg-secondary border-border" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Phone Number (optional)</Label>
                      <div className="relative">
                        <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 (555) 000-0000" className="pl-10 bg-secondary border-border" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>What would you like to discuss?</Label>
                      <Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={3} placeholder="Brief summary of your goals..." className="bg-secondary border-border" />
                    </div>
                  </div>
                  <div className="flex justify-end mt-6">
                    <Button onClick={() => setStep(2)} disabled={!canProceedStep1} className="gap-2">Select Date <ArrowRight size={14} /></Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Calendar */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-lg font-semibold text-foreground mb-4">Choose Date & Time</h2>
                <BookingCalendar onSelect={handleCalendarSelect} selectedDate={selectedDate} selectedTime={selectedTime} />
                <div className="flex justify-between mt-6">
                  <Button variant="outline" onClick={() => setStep(1)} className="gap-2"><ArrowLeft size={14} /> Back</Button>
                  <Button onClick={() => setStep(3)} disabled={!canProceedStep2} className="gap-2">Review <ArrowRight size={14} /></Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Confirmation */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="bg-card border border-border rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-6">Confirm Your Booking</h2>
                  <div className="space-y-4">
                    {selectedPlan && (
                      <div className="flex items-center justify-between pb-4 border-b border-border">
                        <div>
                          <p className="text-foreground font-medium">{selectedPlan.name}</p>
                          <p className="text-muted-foreground text-xs">{selectedPlan.duration_minutes} minutes</p>
                        </div>
                        <p className="text-foreground font-bold">${finalPrice.toFixed(2)}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Name</p>
                        <p className="text-foreground">{form.name}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Email</p>
                        <p className="text-foreground">{form.email}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Date</p>
                        <p className="text-foreground flex items-center gap-1">
                          <Calendar size={13} className="text-primary" />
                          {selectedDate && format(new Date(selectedDate + "T12:00:00"), "MMMM d, yyyy")}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Time</p>
                        <p className="text-foreground flex items-center gap-1">
                          <Clock size={13} className="text-primary" />
                          {selectedTime && formatTime(selectedTime)}
                        </p>
                      </div>
                    </div>
                    {form.message && (
                      <div>
                        <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Message</p>
                        <p className="text-foreground text-sm">{form.message}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between mt-8">
                    <Button variant="outline" onClick={() => setStep(2)} className="gap-2"><ArrowLeft size={14} /> Back</Button>
                    <Button onClick={handleSubmit} disabled={submitting} className="gap-2">
                      <Send size={14} />
                      {submitting ? "Booking..." : "Confirm Booking"}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
      <Footer />
    </main>
  );
};

export default BookSession;
