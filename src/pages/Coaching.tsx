import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import LeadCapture from "@/components/LeadCapture";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Clock, Percent, Star, Users, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  discount_percent: number;
  is_published: boolean;
  is_popular: boolean;
  display_order: number;
}

const planIcons = [Users, Star, Zap];
const planFeatures: Record<number, string[]> = {
  0: ["1-on-1 session", "Personalized feedback", "Action plan summary", "Email follow-up"],
  1: ["Everything in basic", "Priority scheduling", "Session recording", "30-day support access", "Resource library"],
  2: ["Everything in standard", "Unlimited messaging", "Monthly check-ins", "Custom strategy deck", "VIP scheduling", "Direct phone access"],
};

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

      {/* Hero */}
      <section className="pt-32 pb-12 section-padding bg-background relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, hsl(var(--primary)) 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }} />
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center"
          >
            <p className="text-xs font-medium tracking-[0.3em] uppercase text-primary mb-4">
              Executive Coaching
            </p>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-[1.1]">
              Your Leadership,{" "}
              <span className="text-gradient-gold">Elevated</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
              Every engagement is tailored. Choose the level of partnership that
              matches where you are—and where you want to go.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Plans */}
      <section className="pb-24 section-padding bg-background">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-8 animate-pulse h-[500px]" />
              ))}
            </div>
          ) : plans.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 bg-card border border-border rounded-xl"
            >
              <Star className="mx-auto mb-4 text-primary" size={32} />
              <p className="text-muted-foreground mb-6 text-lg">
                Coaching plans are being prepared.
              </p>
              <Link
                to="/book-session"
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-semibold text-sm tracking-wider uppercase rounded-sm hover:bg-gold-light transition-colors"
              >
                Book a Session <ArrowRight size={16} />
              </Link>
            </motion.div>
          ) : (
            <div
              className={`grid grid-cols-1 ${
                plans.length === 1
                  ? "max-w-sm mx-auto"
                  : plans.length === 2
                  ? "sm:grid-cols-2 max-w-3xl mx-auto"
                  : plans.length <= 3
                  ? "sm:grid-cols-2 lg:grid-cols-3"
                  : plans.length === 4
                  ? "sm:grid-cols-2 lg:grid-cols-4"
                  : "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
              } gap-4 lg:gap-5 items-stretch`}
            >
              {plans.map((plan, i) => {
                const isPopular = plan.is_popular;
                const finalPrice =
                  plan.discount_percent > 0
                    ? plan.price * (1 - plan.discount_percent / 100)
                    : plan.price;
                const Icon = planIcons[i % planIcons.length];
                const features = planFeatures[i] || planFeatures[0];

                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: i * 0.15 }}
                    className={`relative rounded-xl flex flex-col overflow-hidden transition-all duration-300 group ${
                      isMiddle
                        ? "bg-card border-2 border-primary glow-gold"
                        : "bg-card border border-border hover:border-primary/40"
                    }`}
                  >
                    {/* Popular badge */}
                    {isMiddle && (
                      <div className="bg-primary text-primary-foreground text-[10px] font-bold tracking-[0.2em] uppercase text-center py-2">
                        Most Popular
                      </div>
                    )}

                    <div className="p-5 flex flex-col flex-1">
                      {/* Icon + Title */}
                      <div className="flex items-center gap-3 mb-4">
                        <div
                          className={`p-2.5 rounded-lg ${
                            isMiddle
                              ? "bg-primary/15 text-primary"
                              : "bg-secondary text-muted-foreground group-hover:text-primary"
                          } transition-colors`}
                        >
                          <Icon size={20} />
                        </div>
                        <h3 className="font-display text-base font-bold text-foreground leading-tight">
                          {plan.name}
                        </h3>
                      </div>

                      <p className="text-muted-foreground text-xs leading-relaxed mb-4 line-clamp-3">
                        {plan.description}
                      </p>

                      {/* Price block */}
                      <div className="mb-4">
                        <div className="flex items-baseline gap-1.5">
                          {plan.discount_percent > 0 ? (
                            <>
                              <span className="text-muted-foreground line-through text-xs">
                                ${plan.price.toFixed(0)}
                              </span>
                              <span className="text-foreground font-bold text-2xl tracking-tight">
                                ${finalPrice.toFixed(0)}
                              </span>
                            </>
                          ) : (
                            <span className="text-foreground font-bold text-2xl tracking-tight">
                              ${plan.price.toFixed(0)}
                            </span>
                          )}
                          <span className="text-muted-foreground text-sm">
                            / session
                          </span>
                        </div>

                        {plan.discount_percent > 0 && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase text-primary mt-2 px-2.5 py-1 bg-primary/10 rounded-full">
                            <Percent size={10} />
                            Save {plan.discount_percent}%
                          </span>
                        )}
                      </div>

                      {/* Duration */}
                      <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-4 pb-4 border-b border-border">
                        <Clock size={12} className="text-primary/70" />
                        {plan.duration_minutes} min session
                      </div>

                      {/* Features */}
                      <ul className="space-y-2 mb-6 flex-1">
                        {features.map((feat, fi) => (
                          <li
                            key={fi}
                            className="flex items-start gap-2 text-xs"
                          >
                            <Check
                              size={12}
                              className={`mt-0.5 shrink-0 ${
                                isMiddle
                                  ? "text-primary"
                                  : "text-muted-foreground"
                              }`}
                            />
                            <span className="text-foreground/80">{feat}</span>
                          </li>
                        ))}
                      </ul>

                      {/* CTA */}
                      <Link
                        to={`/book-session?plan=${plan.id}`}
                        className={`flex items-center justify-center gap-2 px-4 py-3 font-semibold text-xs tracking-wider uppercase rounded-lg transition-all duration-300 ${
                          isMiddle
                            ? "bg-primary text-primary-foreground hover:bg-gold-light hover:shadow-lg hover:shadow-primary/20"
                            : "border border-border text-foreground hover:border-primary hover:text-primary hover:bg-primary/5"
                        }`}
                      >
                        Get Started <ArrowRight size={14} />
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Bottom trust text */}
          {plans.length > 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-center text-muted-foreground text-xs mt-10 tracking-wide"
            >
              All plans include a confidential, judgment-free environment ·
              Cancel or reschedule up to 24 hours before your session
            </motion.p>
          )}
        </div>
      </section>

      <LeadCapture />
      <Footer />
    </main>
  );
};

export default Coaching;
