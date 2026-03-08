import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => (
  <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden">
    {/* Background */}
    <div className="absolute inset-0">
      <img src={heroBg} alt="" className="w-full h-full object-cover" loading="eager" />
      <div className="absolute inset-0 bg-background/70" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
    </div>

    {/* Content */}
    <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-12 text-center pt-16 sm:pt-20">
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-xs sm:text-sm md:text-base font-medium tracking-[0.2em] sm:tracking-[0.3em] uppercase text-primary mb-4 sm:mb-6"
      >
        Executive Coaching
      </motion.p>
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.15 }}
        className="font-display text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-semibold leading-[1.1] text-foreground mb-5 sm:mb-8"
      >
        Lead with
        <br />
        <span className="text-gradient-gold">Conviction</span>
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed px-2"
      >
        Helping founders and executives unlock the clarity, confidence, and strategy they need to scale—without burning out.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.45 }}
        className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0"
      >
        <Link
          to="/contact"
          className="px-6 sm:px-8 py-3.5 sm:py-4 bg-primary text-primary-foreground font-medium text-sm tracking-wider uppercase rounded-sm hover:bg-gold-light transition-colors duration-300 glow-gold text-center"
        >
          Book a Session
        </Link>
        <Link
          to="/book"
          className="px-6 sm:px-8 py-3.5 sm:py-4 border border-border text-foreground font-medium text-sm tracking-wider uppercase rounded-sm hover:border-primary hover:text-primary transition-colors duration-300 text-center"
        >
          Discover the Book
        </Link>
      </motion.div>
    </div>

    {/* Scroll indicator - hidden on very small screens */}
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.2 }}
      className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 hidden sm:block"
    >
      <div className="w-px h-12 sm:h-16 bg-gradient-to-b from-primary/60 to-transparent" />
    </motion.div>
  </section>
);

export default HeroSection;
