import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import LeadCapture from "@/components/LeadCapture";
import { motion } from "framer-motion";
import { Star, ArrowRight, BookOpen, Calendar } from "lucide-react";
import { useBooks } from "@/hooks/useBooks";
import bookMockup from "@/assets/book-mockup.jpg";

const Book = () => {
  const { data: books, isLoading } = useBooks();

  return (
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
            <p className="text-xs font-medium tracking-[0.3em] uppercase text-primary mb-4">Library</p>
            <h1 className="font-display text-4xl md:text-5xl font-semibold text-foreground mb-4">
              Books by <span className="text-gradient-gold">Andre Corbin</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Decades of leadership wisdom distilled into actionable frameworks.
            </p>
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card border border-border rounded-lg h-[420px] animate-pulse" />
              ))}
            </div>
          ) : !books || books.length === 0 ? (
            <p className="text-muted-foreground text-center py-12">No books available yet. Check back soon!</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {books.map((book, i) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: i * 0.08 }}
                  className="group bg-card border border-border rounded-lg overflow-hidden flex flex-col hover:border-primary/30 transition-colors duration-300"
                >
                  <Link
                    to={`/book/${book.id}`}
                    className="relative bg-secondary/50 flex items-center justify-center py-8 px-6"
                  >
                    <img
                      src={book.cover_image_url || bookMockup}
                      alt={book.title}
                      className="w-32 rounded-md shadow-lg group-hover:scale-[1.03] transition-transform duration-500"
                    />
                  </Link>

                  <div className="flex flex-col flex-1 p-5">
                    <div className="flex items-center gap-2.5 mb-2.5 text-muted-foreground text-[11px] tracking-wider uppercase">
                      <span className="flex items-center gap-1">
                        <Calendar size={11} />
                        {new Date(book.created_at).getFullYear()}
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen size={11} />
                        {book.page_count}p
                      </span>
                      {book.reviewCount > 0 && (
                        <span className="flex items-center gap-0.5 ml-auto">
                          <Star size={11} className="fill-primary text-primary" />
                          <span className="text-foreground/70">{book.avgRating}</span>
                        </span>
                      )}
                    </div>

                    <Link to={`/book/${book.id}`}>
                      <h2 className="font-display text-base font-semibold text-foreground mb-0.5 group-hover:text-primary transition-colors leading-tight">
                        {book.title}
                      </h2>
                    </Link>
                    <p className="text-primary/70 text-xs font-medium mb-2">{book.subtitle}</p>

                    <p className="text-muted-foreground text-xs leading-relaxed mb-4 flex-1 line-clamp-3">
                      {book.description}
                    </p>

                    <div className="mt-auto space-y-2.5">
                      <span className="text-lg font-semibold text-foreground block">${Number(book.price).toFixed(2)}</span>
                      <Link
                        to={`/book/${book.id}`}
                        className="flex items-center justify-center gap-2 w-full px-5 py-2.5 bg-primary text-primary-foreground font-medium text-xs tracking-wider uppercase rounded-sm hover:bg-gold-light transition-colors duration-300"
                      >
                        Order Now
                        <ArrowRight size={13} />
                      </Link>
                      <a
                        href={book.amazon_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full px-5 py-2.5 border border-border text-muted-foreground font-medium text-xs tracking-wider uppercase rounded-sm hover:border-primary hover:text-primary transition-colors duration-300"
                      >
                        View on Amazon
                        <ArrowRight size={13} />
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
      <LeadCapture />
      <Footer />
    </main>
  );
};

export default Book;
