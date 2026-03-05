import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import LeadCapture from "@/components/LeadCapture";
import { motion } from "framer-motion";
import { Star, ArrowRight, BookOpen } from "lucide-react";
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
              Books by <span className="text-gradient-gold">Andre' Corbin</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Decades of leadership wisdom distilled into actionable frameworks.
            </p>
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-card border border-border rounded-md h-[320px] animate-pulse" />
              ))}
            </div>
          ) : !books || books.length === 0 ? (
            <p className="text-muted-foreground text-center py-12">No books available yet. Check back soon!</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {books.map((book, i) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="group bg-card border border-border rounded-md overflow-hidden flex flex-col hover:border-primary/40 transition-all duration-300 hover:shadow-md relative"
                >
                  {/* Discount badge */}
                  {book.isDiscounted && (
                    <div className="absolute top-2 right-2 z-10 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-sm tracking-wider">
                      {book.discount_percent}% OFF
                    </div>
                  )}

                  <Link
                    to={`/book/${book.id}`}
                    className="relative bg-secondary/40 flex items-center justify-center py-5 px-4"
                  >
                    <img
                      src={book.cover_image_url || bookMockup}
                      alt={book.title}
                      className="w-20 h-28 object-cover rounded shadow-md group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>

                  <div className="flex flex-col flex-1 p-3.5">
                    <div className="flex items-center gap-2 mb-1.5 text-muted-foreground text-[10px] tracking-wider uppercase">
                      <span className="flex items-center gap-0.5">
                        <BookOpen size={10} />
                        {book.page_count}p
                      </span>
                      {book.reviewCount > 0 && (
                        <span className="flex items-center gap-0.5 ml-auto">
                          <Star size={10} className="fill-primary text-primary" />
                          <span className="text-foreground/70">{book.avgRating}</span>
                        </span>
                      )}
                    </div>

                    <Link to={`/book/${book.id}`}>
                      <h2 className="font-display text-sm font-semibold text-foreground mb-0.5 group-hover:text-primary transition-colors leading-tight line-clamp-2">
                        {book.title}
                      </h2>
                    </Link>
                    <p className="text-primary/70 text-[11px] font-medium mb-1.5 line-clamp-1">{book.subtitle}</p>

                    <p className="text-muted-foreground text-[11px] leading-relaxed mb-3 flex-1 line-clamp-2">
                      {book.description}
                    </p>

                    <div className="mt-auto space-y-1.5">
                      <div className="flex items-baseline gap-2">
                        {book.isDiscounted ? (
                          <>
                            <span className="text-muted-foreground line-through text-xs">${Number(book.price).toFixed(2)}</span>
                            <span className="text-base font-semibold text-foreground">${book.effectivePrice.toFixed(2)}</span>
                          </>
                        ) : (
                          <span className="text-base font-semibold text-foreground">${Number(book.price).toFixed(2)}</span>
                        )}
                      </div>
                      <Link
                        to={`/book/${book.id}`}
                        className="flex items-center justify-center gap-1.5 w-full px-3 py-2 bg-primary text-primary-foreground font-medium text-[10px] tracking-wider uppercase rounded-sm hover:bg-gold-light transition-colors duration-300"
                      >
                        Order Now
                        <ArrowRight size={11} />
                      </Link>
                      <a
                        href={book.amazon_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 w-full px-3 py-1.5 border border-border text-muted-foreground font-medium text-[10px] tracking-wider uppercase rounded-sm hover:border-primary hover:text-primary transition-colors duration-300"
                      >
                        Amazon
                        <ArrowRight size={10} />
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
