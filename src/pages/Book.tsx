import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import LeadCapture from "@/components/LeadCapture";
import { motion } from "framer-motion";
import { Star, ArrowRight, BookOpen, Calendar } from "lucide-react";
import books from "@/data/books";

const Book = () => (
  <main>
    <Navigation />
    <section className="pt-32 pb-20 section-padding bg-background">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-xs font-medium tracking-[0.3em] uppercase text-primary mb-4">
            Library
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold text-foreground mb-4">
            Books by <span className="text-gradient-gold">Andre Corbin</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Decades of leadership wisdom distilled into actionable frameworks.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {books.map((book, i) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group bg-card border border-border rounded-lg overflow-hidden flex flex-col hover:border-primary/30 transition-colors duration-300"
            >
              <Link
                to={`/book/${book.id}`}
                className="relative bg-secondary/50 flex items-center justify-center py-10 px-8"
              >
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="w-40 rounded-md shadow-lg group-hover:scale-[1.03] transition-transform duration-500"
                />
              </Link>

              <div className="flex flex-col flex-1 p-6">
                <div className="flex items-center gap-3 mb-3 text-muted-foreground text-[11px] tracking-wider uppercase">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {book.year}
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen size={12} />
                    {book.pages}p
                  </span>
                  <span className="flex items-center gap-0.5 ml-auto">
                    <Star size={11} className="fill-primary text-primary" />
                    <span className="text-foreground/70">{book.rating}</span>
                  </span>
                </div>

                <Link to={`/book/${book.id}`}>
                  <h2 className="font-display text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                    {book.title}
                  </h2>
                </Link>
                <p className="text-primary/70 text-xs font-medium mb-3">
                  {book.subtitle}
                </p>

                <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-1 line-clamp-3">
                  {book.description}
                </p>

                <div className="mt-auto space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-semibold text-foreground">
                      ${book.price.toFixed(2)}
                    </span>
                  </div>
                  <Link
                    to={`/book/${book.id}`}
                    className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-primary text-primary-foreground font-medium text-xs tracking-wider uppercase rounded-sm hover:bg-gold-light transition-colors duration-300"
                  >
                    Order Now
                    <ArrowRight size={14} />
                  </Link>
                  <a
                    href={book.amazonUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full px-6 py-3 border border-border text-muted-foreground font-medium text-xs tracking-wider uppercase rounded-sm hover:border-primary hover:text-primary transition-colors duration-300"
                  >
                    View on Amazon
                    <ArrowRight size={14} />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
    <LeadCapture />
    <Footer />
  </main>
);

export default Book;
