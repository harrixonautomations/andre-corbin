import { useState } from "react";
import { useParams, Link, useNavigate, Navigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useBook } from "@/hooks/useBooks";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { ArrowLeft, ShieldCheck, Lock, CheckCircle2, CreditCard } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VisaIcon, MastercardIcon, AmexIcon, DiscoverIcon, UnionPayIcon, PaypalIcon } from "@/components/PaymentIcons";
import { useToast } from "@/hooks/use-toast";
import bookMockup from "@/assets/book-mockup.jpg";

type PaymentMethod = "card" | "paypal";

const Checkout = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: book, isLoading } = useBook(bookId);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", address: "", city: "", state: "", zip: "", country: "" });

  if (isLoading) return <main><Navigation /><section className="pt-24 sm:pt-32 pb-20 section-padding bg-background min-h-screen"><div className="max-w-5xl mx-auto"><div className="h-96 animate-pulse bg-card rounded-lg" /></div></section><Footer /></main>;

  if (!book) return (
    <main><Navigation /><section className="pt-24 sm:pt-32 pb-20 section-padding bg-background min-h-screen"><div className="max-w-4xl mx-auto text-center"><h1 className="font-display text-2xl sm:text-3xl font-semibold text-foreground mb-4">Book not found</h1><Link to="/book" className="text-primary hover:underline">← Back to all books</Link></div></section><Footer /></main>
  );

  if (!user) return <Navigate to={`/auth?redirect=/checkout/${bookId}`} replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { error } = await supabase.from("orders").insert({
      user_id: user.id,
      book_id: book.id,
      first_name: form.firstName,
      last_name: form.lastName,
      email: form.email,
      address: form.address,
      city: form.city,
      state: form.state,
      zip: form.zip,
      country: form.country,
      payment_method: paymentMethod,
      total: book.price,
      status: "pending",
    });

    setIsSubmitting(false);
    if (error) {
      toast({ title: "Order failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Order placed!", description: "You can track your order from your dashboard." });
      navigate("/dashboard");
    }
  };

  const updateField = (field: string, value: string) => setForm({ ...form, [field]: value });

  return (
    <main>
      <Navigation />
      <section className="pt-24 sm:pt-32 pb-16 sm:pb-20 section-padding bg-background min-h-screen">
        <div className="max-w-5xl mx-auto">
          <button onClick={() => navigate(`/book/${book.id}`)} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-6 sm:mb-10 transition-colors">
            <ArrowLeft size={16} />Back to book
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px] gap-8 sm:gap-12">
            <motion.form onSubmit={handleSubmit} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-8 sm:space-y-10">
              <div>
                <h2 className="font-display text-xl sm:text-2xl font-semibold text-foreground mb-4 sm:mb-6 flex items-center gap-2"><ShieldCheck size={20} className="text-primary" />Shipping Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2"><Label htmlFor="firstName">First Name</Label><Input id="firstName" value={form.firstName} onChange={(e) => updateField("firstName", e.target.value)} required className="bg-card border-border" /></div>
                  <div className="space-y-2"><Label htmlFor="lastName">Last Name</Label><Input id="lastName" value={form.lastName} onChange={(e) => updateField("lastName", e.target.value)} required className="bg-card border-border" /></div>
                  <div className="space-y-2 sm:col-span-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} required className="bg-card border-border" /></div>
                  <div className="space-y-2 sm:col-span-2"><Label htmlFor="address">Mailing Address</Label><Input id="address" value={form.address} onChange={(e) => updateField("address", e.target.value)} required className="bg-card border-border" /></div>
                  <div className="space-y-2"><Label htmlFor="city">City</Label><Input id="city" value={form.city} onChange={(e) => updateField("city", e.target.value)} required className="bg-card border-border" /></div>
                  <div className="space-y-2"><Label htmlFor="state">State / Province</Label><Input id="state" value={form.state} onChange={(e) => updateField("state", e.target.value)} required className="bg-card border-border" /></div>
                  <div className="space-y-2"><Label htmlFor="zip">ZIP / Postal Code</Label><Input id="zip" value={form.zip} onChange={(e) => updateField("zip", e.target.value)} required className="bg-card border-border" /></div>
                  <div className="space-y-2"><Label htmlFor="country">Country</Label><Input id="country" value={form.country} onChange={(e) => updateField("country", e.target.value)} required className="bg-card border-border" /></div>
                </div>
              </div>

              <div>
                <h2 className="font-display text-xl sm:text-2xl font-semibold text-foreground mb-4 sm:mb-6 flex items-center gap-2"><CreditCard size={20} className="text-primary" />Payment Method</h2>
                <div className="grid grid-cols-2 gap-3 mb-4 sm:mb-6">
                  <button type="button" onClick={() => setPaymentMethod("card")} className={`flex items-center justify-center gap-1.5 sm:gap-2 py-3 sm:py-4 rounded-lg border-2 transition-all duration-200 ${paymentMethod === "card" ? "border-primary bg-primary/5" : "border-border bg-card hover:border-muted-foreground"}`}>
                    <CreditCard size={16} className={paymentMethod === "card" ? "text-primary" : "text-muted-foreground"} />
                    <span className={`text-xs sm:text-sm font-medium ${paymentMethod === "card" ? "text-foreground" : "text-muted-foreground"}`}>Card</span>
                  </button>
                  <button type="button" onClick={() => setPaymentMethod("paypal")} className={`flex items-center justify-center gap-1.5 sm:gap-2 py-3 sm:py-4 rounded-lg border-2 transition-all duration-200 ${paymentMethod === "paypal" ? "border-primary bg-primary/5" : "border-border bg-card hover:border-muted-foreground"}`}>
                    <PaypalIcon /><span className={`text-xs sm:text-sm font-medium ${paymentMethod === "paypal" ? "text-foreground" : "text-muted-foreground"}`}>PayPal</span>
                  </button>
                </div>
                {paymentMethod === "card" && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-3 sm:space-y-4">
                    <div className="flex items-center gap-2 mb-2 flex-wrap"><span className="text-xs text-muted-foreground mr-1">We accept</span><VisaIcon /><MastercardIcon /><AmexIcon /><DiscoverIcon /><UnionPayIcon /></div>
                    <div className="space-y-2"><Label htmlFor="cardNumber">Card Number</Label><Input id="cardNumber" placeholder="4242 4242 4242 4242" required={paymentMethod === "card"} className="bg-card border-border" /></div>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-2"><Label htmlFor="expiry">Expiry</Label><Input id="expiry" placeholder="MM / YY" required={paymentMethod === "card"} className="bg-card border-border" /></div>
                      <div className="space-y-2"><Label htmlFor="cvc">CVC</Label><Input id="cvc" placeholder="123" required={paymentMethod === "card"} className="bg-card border-border" /></div>
                    </div>
                  </motion.div>
                )}
                {paymentMethod === "paypal" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card border border-border rounded-lg p-5 sm:p-6 text-center">
                    <PaypalIcon /><p className="text-muted-foreground text-xs sm:text-sm mt-3">You will be redirected to PayPal to complete your purchase securely.</p>
                  </motion.div>
                )}
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 bg-primary text-primary-foreground font-medium text-sm tracking-wider uppercase rounded-sm hover:bg-gold-light transition-colors duration-300 glow-gold disabled:opacity-60">
                <Lock size={16} />{isSubmitting ? "Processing..." : `Pay $${Number(book.price).toFixed(2)}`}
              </button>
              <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground"><ShieldCheck size={14} />Secure, encrypted payment.</p>
            </motion.form>

            {/* Order Summary - sticky on desktop, top on mobile via order */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }} className="lg:sticky lg:top-28 order-first lg:order-last">
              <div className="bg-card border border-border rounded-lg p-5 sm:p-6">
                <h3 className="font-display text-base sm:text-lg font-semibold text-foreground mb-4 sm:mb-6">Order Summary</h3>
                <div className="flex gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <img src={book.cover_image_url || bookMockup} alt={book.title} className="w-16 sm:w-20 rounded" />
                  <div className="min-w-0"><p className="text-foreground font-medium text-sm truncate">{book.title}</p><p className="text-muted-foreground text-xs mt-1 line-clamp-1">{book.subtitle}</p></div>
                </div>
                <div className="border-t border-border pt-4 space-y-3">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span className="text-foreground">${Number(book.price).toFixed(2)}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Shipping</span><span className="text-primary font-medium">Free</span></div>
                  <div className="border-t border-border pt-3 flex justify-between"><span className="text-foreground font-semibold">Total</span><span className="text-foreground font-semibold text-lg">${Number(book.price).toFixed(2)}</span></div>
                </div>
                <div className="mt-4 sm:mt-6 flex items-start gap-2 text-xs text-muted-foreground"><CheckCircle2 size={14} className="text-primary mt-0.5 shrink-0" /><span>Free worldwide shipping. Delivered within 5–10 business days.</span></div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
};

export default Checkout;
