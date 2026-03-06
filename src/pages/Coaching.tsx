import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import LeadCapture from "@/components/LeadCapture";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Clock, Percent } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  discount_percent: number;
  is_published: boolean;
  display_order: number;
}

const Coaching = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      const { data } = await supabase
        .from("consultation_plans")
        .select("*")
        .eq("is_published", true)
        .order("display_order");
      if (data) setPlans(data as Plan[]);
      setLoading(false);
    };
    fetchPlans();
  }, []);

  return (
    <main>
      <Navigation />
      <section className="pt-32 pb-20 section-padding bg-background">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <p className="text-xs font-medium tracking-[0.3em] uppercase text-primary mb-4">Coaching</p>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-6">
              Your Leadership, <span className="text-gradient-gold">Elevated</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-base md:text-lg">
              Every engagement is tailored. Choose the level of partnership that matches where you are—and where you want to go.
            </p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card border border-border rounded-lg p-8 animate-pulse h-80" />
              ))}
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground mb-6">Coaching plans are being prepared. Book a general session below.</p>
              <Link
                to="/book-session"
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-semibold text-sm tracking-wider uppercase rounded-sm hover:bg-gold-light transition-colors"
              >
                Book a Session <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <div className={`grid grid-cols-1 ${plans.length === 1 ? "max-w-md mx-auto" : plans.length === 2 ? "md:grid-cols-2 max-w-4xl mx-auto" : "md:grid-cols-3"} gap-8`}>
              {plans.map((plan, i) => {
                const isMiddle = plans.length >= 3 && i === Math.floor(plans.length / 2);
                const finalPrice = plan.discount_percent > 0
                  ? plan.price * (1 - plan.discount_percent / 100)
                  : plan.price;

                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: i * 0.1 }}
                    className={`rounded-lg p-8 border flex flex-col ${
                      isMiddle
                        ? "bg-card border-primary glow-gold"
                        : "bg-card border-border"
                    }`}
                  >
                    {isMiddle && (
                      <span className="text-xs font-semibold tracking-widest uppercase text-primary mb-3">Most Popular</span>
                    )}

                    <h3 className="font-display text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                    <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>

                    <div className="flex items-baseline gap-2 mb-2">
                      {plan.discount_percent > 0 ? (
                        <>
                          <span className="text-muted-foreground line-through text-lg">${plan.price.toFixed(2)}</span>
                          <span className="text-foreground font-bold text-3xl">${finalPrice.toFixed(2)}</span>
                        </>
                      ) : (
                        <span className="text-foreground font-bold text-3xl">${plan.price.toFixed(2)}</span>
                      )}
                    </div>

                    {plan.discount_percent > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary mb-4 w-fit px-2 py-1 bg-primary/10 rounded-full">
                        <Percent size={10} />{plan.discount_percent}% OFF
                      </span>
                    )}

                    <div className="flex items-center gap-2 text-muted-foreground text-sm mb-6">
                      <Clock size={14} />
                      {plan.duration_minutes} minutes
                    </div>

                    <div className="flex-1" />

                    <Link
                      to={`/book-session?plan=${plan.id}`}
                      className={`flex items-center justify-center gap-2 px-6 py-3.5 font-semibold text-sm tracking-wider uppercase rounded-sm transition-colors duration-300 ${
                        isMiddle
                          ? "bg-primary text-primary-foreground hover:bg-gold-light"
                          : "border border-border text-foreground hover:border-primary hover:text-primary"
                      }`}
                    >
                      Get Started <ArrowRight size={16} />
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>
      <LeadCapture />
      <Footer />
    </main>
  );
};

export default Coaching;
