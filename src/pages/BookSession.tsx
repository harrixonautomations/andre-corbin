import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Calendar, Send, Phone, Mail, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const BookSession = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    preferred_date: "",
    message: "",
  });

  if (loading) return null;
  if (!user) return <Navigate to="/auth?redirect=/book-session" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const { error } = await supabase.from("consultations").insert({
      user_id: user.id,
      name: form.name,
      email: form.email,
      phone: form.phone || null,
      preferred_date: form.preferred_date ? new Date(form.preferred_date).toISOString() : null,
      message: form.message || null,
    });

    setSubmitting(false);
    if (error) {
      toast({ title: "Booking failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Session requested!", description: "Andre' will review your request and get back to you soon." });
      navigate("/dashboard");
    }
  };

  const updateField = (field: string, value: string) => setForm({ ...form, [field]: value });

  return (
    <main>
      <Navigation />
      <section className="pt-32 pb-20 section-padding bg-background min-h-screen">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <p className="text-xs font-medium tracking-[0.3em] uppercase text-primary mb-4">Book a Session</p>
            <h1 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-3">
              Schedule Your <span className="text-gradient-gold">Consultation</span>
            </h1>
            <p className="text-muted-foreground text-sm max-w-lg mx-auto">
              Fill in your details below and Andre' will review your request. You'll receive a confirmation once your session is scheduled.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-lg p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input id="name" value={form.name} onChange={(e) => updateField("name", e.target.value)} required placeholder="Your full name" className="pl-10 bg-secondary border-border" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input id="email" type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} required placeholder="you@example.com" className="pl-10 bg-secondary border-border" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input id="phone" type="tel" value={form.phone} onChange={(e) => updateField("phone", e.target.value)} placeholder="+1 (555) 000-0000" className="pl-10 bg-secondary border-border" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Preferred Date</Label>
                  <div className="relative">
                    <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input id="date" type="date" value={form.preferred_date} onChange={(e) => updateField("preferred_date", e.target.value)} className="pl-10 bg-secondary border-border" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">What would you like to discuss?</Label>
                <Textarea
                  id="message"
                  value={form.message}
                  onChange={(e) => updateField("message", e.target.value)}
                  rows={4}
                  placeholder="Brief summary of what you'd like to consult about..."
                  className="bg-secondary border-border"
                />
              </div>

              <Button type="submit" disabled={submitting} className="w-full gap-2">
                <Send size={16} />
                {submitting ? "Submitting..." : "Request Session"}
              </Button>
            </form>
          </motion.div>
        </div>
      </section>
      <Footer />
    </main>
  );
};

export default BookSession;
