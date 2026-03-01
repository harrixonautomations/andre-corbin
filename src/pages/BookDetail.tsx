import { useParams, Link, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Star, ArrowRight, ArrowLeft, BookOpen, Calendar, ShoppingCart } from "lucide-react";
import books from "@/data/books";

const BookDetail = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const book = books.find((b) => b.id === bookId);

  if (!book) {
    return (
      <main>
        <Navigation />
        <section className="pt-32 pb-20 section-padding bg-background min-h-screen">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-display text-3xl font-semibold text-foreground mb-4">
              Book not found
            </h1>
            <Link to="/book" className="text-primary hover:underline">
              ← Back to all books
            </Link>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  return (
    <main>
      <Navigation />
      <section className="pt-32 pb-20 section-padding bg-background">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate("/book")}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-10 transition-colors"
          >
            <ArrowLeft size={16} />
            All Books
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="flex justify-center sticky top-28"
            >
              <img
                src={book.coverImage}
                alt={book.title}
                className="w-72 md:w-96 rounded-lg glow-gold"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
            >
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

              <h1 className="font-display text-4xl md:text-5xl font-semibold text-foreground mb-2">
                {book.title}
              </h1>
              <p className="text-primary/80 font-medium mb-5">
                {book.subtitle}
              </p>

              <div className="flex items-center gap-1 mb-6">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star
                    key={j}
                    size={16}
                    className="fill-primary text-primary"
                  />
                ))}
                <span className="text-muted-foreground text-sm ml-2">
                  {book.rating} / 5
                </span>
              </div>

              <p className="text-muted-foreground leading-relaxed mb-8 text-base">
                {book.description}
              </p>

              <div className="border-t border-border pt-8">
                <span className="text-3xl font-semibold text-foreground block mb-6">
                  ${book.price.toFixed(2)}
                </span>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to={`/checkout/${book.id}`}
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-medium text-sm tracking-wider uppercase rounded-sm hover:bg-gold-light transition-colors duration-300 glow-gold"
                  >
                    <ShoppingCart size={18} />
                    Order Now — ${book.price.toFixed(2)}
                  </Link>
                  <a
                    href={book.amazonUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-border text-foreground font-medium text-sm tracking-wider uppercase rounded-sm hover:border-primary hover:text-primary transition-colors duration-300"
                  >
                    Buy on Amazon
                    <ArrowRight size={16} />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
};

export default BookDetail;
