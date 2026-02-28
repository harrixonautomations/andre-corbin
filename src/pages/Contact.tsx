import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { ArrowRight, Mail, MapPin } from "lucide-react";

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <main>
      <Navigation />
      <section className="pt-32 pb-20 section-padding bg-background">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <p className="text-xs font-medium tracking-[0.3em] uppercase text-primary mb-4">Contact</p>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-6">
              Let's <span className="text-gradient-gold">Talk</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Ready to elevate your leadership? Reach out to book a session or ask a question.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="md:col-span-3"
            >
              {submitted ? (
                <div className="bg-card border border-border rounded-lg p-12 text-center">
                  <p className="text-primary font-display text-2xl font-bold mb-2">Message Sent</p>
                  <p className="text-muted-foreground">Thank you — Andre will be in touch shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <input
                      type="text"
                      required
                      maxLength={100}
                      placeholder="First Name"
                      className="w-full px-5 py-3.5 bg-card border border-border rounded-sm text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary transition-colors"
                    />
                    <input
                      type="text"
                      required
                      maxLength={100}
                      placeholder="Last Name"
                      className="w-full px-5 py-3.5 bg-card border border-border rounded-sm text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <input
                    type="email"
                    required
                    maxLength={255}
                    placeholder="Email"
                    className="w-full px-5 py-3.5 bg-card border border-border rounded-sm text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                  <textarea
                    required
                    maxLength={1000}
                    rows={5}
                    placeholder="Tell Andre a bit about yourself and what you're looking for..."
                    className="w-full px-5 py-3.5 bg-card border border-border rounded-sm text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary transition-colors resize-none"
                  />
                  <button
                    type="submit"
                    className="px-8 py-4 bg-primary text-primary-foreground font-semibold text-sm tracking-wider uppercase rounded-sm hover:bg-gold-light transition-colors duration-300 flex items-center gap-2"
                  >
                    Send Message <ArrowRight size={16} />
                  </button>
                </form>
              )}
            </motion.div>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="md:col-span-2 space-y-8"
            >
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Mail size={18} className="text-primary" />
                  <h3 className="font-semibold text-foreground text-sm">Email</h3>
                </div>
                <a href="mailto:hello@andrecorbin.pro" className="text-muted-foreground text-sm hover:text-primary transition-colors">
                  hello@andrecorbin.pro
                </a>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <MapPin size={18} className="text-primary" />
                  <h3 className="font-semibold text-foreground text-sm">Location</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  New York City & Virtual — coaching clients worldwide.
                </p>
              </div>
              <div className="bg-card border border-border rounded-lg p-6">
                <p className="text-xs font-medium tracking-[0.2em] uppercase text-primary mb-2">Booking</p>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Prefer to book directly? A Calendly scheduling widget will be embedded here once connected.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
};

export default Contact;
