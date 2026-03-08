import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Book {
  id: string;
  title: string;
}

const LeadCapture = () => {
  const [email, setEmail] = useState("");
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchBooks = async () => {
      const { data } = await supabase.from("books").select("id, title").order("title");
      if (data && data.length > 0) {
        setBooks(data);
        setSelectedBook(data[0].id);
      }
    };
    fetchBooks();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);

    const { error } = await supabase.from("sample_requests" as any).insert({
      email: email.trim(),
      book_id: selectedBook || null,
    } as any);

    if (error) {
      toast({ title: "Something went wrong", description: "Please try again.", variant: "destructive" });
    } else {
      setSubmitted(true);
    }
    setSubmitting(false);
  };

  return (
    <section className="section-padding bg-card border-y border-border">
      <div className="max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
        >
          <p className="text-xs font-medium tracking-[0.3em] uppercase text-primary mb-3 sm:mb-4">Free Chapter</p>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground mb-3 sm:mb-4">
            Get a Free Chapter
          </h2>
          <p className="text-muted-foreground mb-6 sm:mb-8 max-w-md mx-auto text-sm sm:text-base px-2">
            Enter your email to receive the first chapter of the book—and exclusive leadership insights every week.
          </p>

          {submitted ? (
            <motion.p
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-primary font-medium text-base sm:text-lg"
            >
              ✓ Check your inbox — the chapter is on its way.
            </motion.p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-md mx-auto px-2 sm:px-0">
              {books.length > 1 && (
                <select
                  value={selectedBook}
                  onChange={(e) => setSelectedBook(e.target.value)}
                  className="px-4 sm:px-5 py-3 sm:py-3.5 bg-background border border-border rounded-sm text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
                >
                  {books.map(b => (
                    <option key={b.id} value={b.id}>{b.title}</option>
                  ))}
                </select>
              )}
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  required
                  maxLength={255}
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-4 sm:px-5 py-3 sm:py-3.5 bg-background border border-border rounded-sm text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary transition-colors"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 sm:px-6 py-3 sm:py-3.5 bg-primary text-primary-foreground font-medium text-sm tracking-wider uppercase rounded-sm hover:bg-gold-light transition-colors duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? "Sending..." : "Send"} <ArrowRight size={16} />
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default LeadCapture;
