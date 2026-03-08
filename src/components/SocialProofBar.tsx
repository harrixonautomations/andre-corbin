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
  <section className="py-10 sm:py-16 bg-card border-y border-border overflow-hidden">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center text-[10px] sm:text-xs font-medium tracking-[0.25em] sm:tracking-[0.3em] uppercase text-muted-foreground mb-6 sm:mb-10"
      >
        Trusted by leaders at
      </motion.p>
      <div className="grid grid-cols-3 sm:flex sm:flex-wrap items-center justify-center gap-4 sm:gap-8 md:gap-16">
        {logos.map((name, i) => (
          <motion.div
            key={name}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="text-sm sm:text-lg md:text-xl font-display font-medium text-muted-foreground/50 tracking-wide text-center"
          >
            {name}
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default SocialProofBar;
