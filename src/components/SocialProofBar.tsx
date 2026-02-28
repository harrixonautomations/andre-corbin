import { motion } from "framer-motion";

const logos = [
  "Fortune 500 Co.",
  "TechCorp",
  "Venture Labs",
  "ScaleUp Inc.",
  "Global Dynamics",
  "Apex Partners",
];

const SocialProofBar = () => (
  <section className="py-16 bg-card border-y border-border">
    <div className="max-w-7xl mx-auto px-6 md:px-12">
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center text-xs font-medium tracking-[0.3em] uppercase text-muted-foreground mb-10"
      >
        Trusted by leaders at
      </motion.p>
      <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
        {logos.map((name, i) => (
          <motion.div
            key={name}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="text-lg md:text-xl font-display font-semibold text-muted-foreground/50 tracking-wide"
          >
            {name}
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default SocialProofBar;
