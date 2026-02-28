import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import LeadCapture from "@/components/LeadCapture";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";

const packages = [
  {
    name: "Catalyst",
    description: "For founders navigating a critical inflection point.",
    features: ["4 deep-dive sessions (90 min each)", "Personalized action plan", "Email support between sessions", "Leadership assessment"],
    highlight: false,
  },
  {
    name: "Accelerator",
    description: "For executives ready to transform their leadership operating system.",
    features: ["12 sessions over 3 months", "360° leadership assessment", "On-demand coaching via voice/text", "Custom frameworks & tools", "Team dynamics analysis"],
    highlight: true,
  },
  {
    name: "Inner Circle",
    description: "For CEOs and founders who want an ongoing strategic partner.",
    features: ["Unlimited sessions", "Real-time advisory access", "Board & investor prep", "Team & culture consulting", "Quarterly offsites"],
    highlight: false,
  },
];

const Coaching = () => (
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {packages.map((pkg, i) => (
            <motion.div
              key={pkg.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className={`rounded-lg p-8 border flex flex-col ${
                pkg.highlight
                  ? "bg-card border-primary glow-gold"
                  : "bg-card border-border"
              }`}
            >
              {pkg.highlight && (
                <span className="text-xs font-semibold tracking-widest uppercase text-primary mb-3">Most Popular</span>
              )}
              <h3 className="font-display text-2xl font-bold text-foreground mb-2">{pkg.name}</h3>
              <p className="text-muted-foreground text-sm mb-6">{pkg.description}</p>
              <ul className="space-y-3 mb-8 flex-1">
                {pkg.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-secondary-foreground">
                    <Check size={16} className="text-primary mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/contact"
                className={`flex items-center justify-center gap-2 px-6 py-3.5 font-semibold text-sm tracking-wider uppercase rounded-sm transition-colors duration-300 ${
                  pkg.highlight
                    ? "bg-primary text-primary-foreground hover:bg-gold-light"
                    : "border border-border text-foreground hover:border-primary hover:text-primary"
                }`}
              >
                Get Started <ArrowRight size={16} />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
    <LeadCapture />
    <Footer />
  </main>
);

export default Coaching;
