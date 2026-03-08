import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Testimonial {
  id: string;
  quote: string;
  name: string;
  title: string;
  company: string;
  display_order: number;
}

const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    supabase.from("testimonials").select("*").order("display_order").then(({ data }) => {
      if (data) setTestimonials(data);
    });
  }, []);

  if (testimonials.length === 0) return null;

  return (
    <section className="section-padding bg-background">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <p className="text-xs font-medium tracking-[0.3em] uppercase text-primary mb-4">Testimonials</p>
          <h2 className="font-display text-3xl md:text-5xl font-semibold text-foreground">
            What Leaders <span className="text-gradient-gold">Say</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="bg-card border border-border rounded-lg p-8 relative"
            >
              <Quote className="w-8 h-8 text-primary/30 mb-4" />
              <p className="text-secondary-foreground text-sm leading-relaxed mb-6">
                "{t.quote}"
              </p>
              <div>
                <p className="text-foreground font-medium text-sm">{t.name}</p>
                <p className="text-muted-foreground text-xs">{t.title}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
