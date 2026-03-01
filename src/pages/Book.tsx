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
            Each book is a playbook for founders and executives who demand
            excellence.
          </p>
        </motion.div>

        <div className="space-y-16">
          {books.map((book, i) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-10 items-start bg-card border border-border rounded-lg p-8 md:p-10"
            >
              <Link to={`/book/${book.id}`} className="flex justify-center">
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="w-56 md:w-64 rounded-lg glow-gold hover:scale-[1.02] transition-transform duration-300"
                />
              </Link>

              <div className="flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center gap-3 mb-3 text-muted-foreground text-xs tracking-wider uppercase">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={13} />
                      {book.year}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <BookOpen size={13} />
                      {book.pages} pages
                    </span>
                  </div>

                  <Link to={`/book/${book.id}`}>
                    <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-1 hover:text-primary transition-colors">
                      {book.title}
                    </h2>
                  </Link>
                  <p className="text-primary/80 text-sm font-medium mb-4">
                    {book.subtitle}
                  </p>

                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star
                        key={j}
                        size={14}
                        className="fill-primary text-primary"
                      />
                    ))}
                    <span className="text-muted-foreground text-xs ml-1.5">
                      {book.rating} / 5
                    </span>
                  </div>

                  <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                    {book.description}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <span className="text-2xl font-semibold text-foreground">
                    ${book.price.toFixed(2)}
                  </span>
                  <Link
                    to={`/book/${book.id}`}
                    className="inline-flex items-center gap-2 px-7 py-3.5 bg-primary text-primary-foreground font-medium text-sm tracking-wider uppercase rounded-sm hover:bg-gold-light transition-colors duration-300 glow-gold"
                  >
                    Order Now
                    <ArrowRight size={16} />
                  </Link>
                  <a
                    href={book.amazonUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-7 py-3.5 border border-border text-foreground font-medium text-sm tracking-wider uppercase rounded-sm hover:border-primary hover:text-primary transition-colors duration-300"
                  >
                    View on Amazon
                    <ArrowRight size={16} />
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
