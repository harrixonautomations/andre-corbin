import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import LeadCapture from "@/components/LeadCapture";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import bookMockup from "@/assets/book-mockup.jpg";

const reviews = [
  { text: "A masterclass in modern leadership. Required reading for any founder.", author: "Fast Company" },
  { text: "Andre distills decades of wisdom into actionable frameworks that actually work.", author: "Forbes" },
  { text: "The leadership book I wish I had when I started my company.", author: "TechCrunch" },
];

const Book = () => (
  <main>
    <Navigation />
    <section className="pt-32 pb-20 section-padding bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-20">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="flex justify-center"
          >
            <img
              src={bookMockup}
              alt="The Book by Andre Corbin"
              className="w-72 md:w-96 rounded-lg glow-gold"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            <p className="text-xs font-medium tracking-[0.3em] uppercase text-primary mb-4">The Book</p>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
              Lead with <span className="text-gradient-gold">Conviction</span>
            </h1>
            <div className="flex items-center gap-1 mb-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={18} className="fill-primary text-primary" />
              ))}
              <span className="text-muted-foreground text-sm ml-2">4.9 / 5</span>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-8">
              This book is a distillation of everything Andre has learned coaching hundreds of 
              founders and executives. It's not theory—it's a battle-tested playbook for leaders 
              who want to build extraordinary companies without sacrificing their health, 
              relationships, or integrity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#"
                className="px-8 py-4 bg-primary text-primary-foreground font-semibold text-sm tracking-wider uppercase rounded-sm hover:bg-gold-light transition-colors duration-300 text-center glow-gold"
              >
                Buy Now — $24.99
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 border border-border text-foreground font-semibold text-sm tracking-wider uppercase rounded-sm hover:border-primary hover:text-primary transition-colors duration-300 text-center"
              >
                Buy on Amazon
              </a>
            </div>
          </motion.div>
        </div>

        {/* Reviews */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-10 text-center">
            Press & <span className="text-gradient-gold">Reviews</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map((r, i) => (
              <div key={i} className="bg-card border border-border rounded-lg p-8">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} size={14} className="fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-secondary-foreground text-sm leading-relaxed mb-4">"{r.text}"</p>
                <p className="text-primary text-xs font-semibold tracking-wider uppercase">— {r.author}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
    <LeadCapture />
    <Footer />
  </main>
);

export default Book;
