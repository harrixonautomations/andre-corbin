import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import bookMockup from "@/assets/book-mockup.jpg";

const BookPreview = () => (
  <section className="section-padding bg-background">
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 md:gap-20 items-center">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="flex justify-center"
        >
          <img
            src={bookMockup}
            alt="The Book by Andre Corbin"
            className="w-48 sm:w-64 md:w-72 lg:w-80 rounded-lg glow-gold"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="text-center md:text-left"
        >
          <p className="text-xs font-medium tracking-[0.3em] uppercase text-primary mb-3 sm:mb-4">New Release</p>
          <h2 className="font-display text-2xl sm:text-3xl md:text-5xl font-semibold text-foreground mb-4 sm:mb-6">
            The Book
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-6 sm:mb-8 text-sm sm:text-base">
            A no-nonsense guide for founders and executives who want to master the mindset, 
            habits, and strategies that separate good leaders from transformative ones. 
            Drawn from years of coaching the world's most ambitious builders.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center md:justify-start">
            <Link
              to="/book"
              className="px-6 sm:px-8 py-3.5 sm:py-4 bg-primary text-primary-foreground font-medium text-sm tracking-wider uppercase rounded-sm hover:bg-gold-light transition-colors duration-300 text-center"
            >
              Learn More
            </Link>
            <a
              href="#"
              className="px-6 sm:px-8 py-3.5 sm:py-4 border border-border text-foreground font-medium text-sm tracking-wider uppercase rounded-sm hover:border-primary hover:text-primary transition-colors duration-300 text-center"
            >
              Buy on Amazon
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

export default BookPreview;
