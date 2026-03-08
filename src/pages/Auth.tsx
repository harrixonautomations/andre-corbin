import { useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { LogIn, UserPlus, Mail, Lock, User, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ALLOWED_DOMAINS = [
  "gmail.com", "googlemail.com",
  "outlook.com", "hotmail.com", "live.com", "msn.com",
  "yahoo.com", "yahoo.co.uk", "yahoo.ca", "yahoo.com.au",
  "icloud.com", "me.com", "mac.com",
  "aol.com",
  "protonmail.com", "proton.me", "pm.me",
  "zoho.com",
  "mail.com",
  "gmx.com", "gmx.net",
  "yandex.com", "yandex.ru",
  "tutanota.com", "tuta.io",
  "fastmail.com",
  "hey.com",
];

const validateEmailDomain = (email: string): { valid: boolean; message?: string } => {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return { valid: false, message: "Please enter a valid email address." };
  if (ALLOWED_DOMAINS.includes(domain)) return { valid: true };
  return { valid: false, message: `"${domain}" is not a recognized email provider. Please use a valid provider like Gmail, Outlook, Yahoo, iCloud, or ProtonMail.` };
};

const Auth = () => {
  const { user, loading, signIn, signUp } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const defaultRedirect = searchParams.get("redirect") || "/dashboard";
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  if (loading) return null;
  const isAdminEmail = user?.email === "harrixonautomations@gmail.com";
  const redirectTo = isAdminEmail ? "/admin" : defaultRedirect;
  if (user) return <Navigate to={redirectTo} replace />;

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (emailError) setEmailError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSignUp) {
      const domainCheck = validateEmailDomain(email);
      if (!domainCheck.valid) {
        setEmailError(domainCheck.message || "Invalid email provider.");
        toast({ title: "Invalid email provider", description: domainCheck.message, variant: "destructive" });
        return;
      }
    }

    setSubmitting(true);
    if (isSignUp) {
      const { error } = await signUp(email, password, fullName);
      if (error) {
        toast({ title: "Sign up failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Check your email", description: "We sent you a confirmation link to verify your account." });
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        toast({ title: "Sign in failed", description: error.message, variant: "destructive" });
      }
    }
    setSubmitting(false);
  };

  return (
    <main>
      <Navigation />
      <section className="pt-32 pb-20 section-padding bg-background min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-card border border-border rounded-lg p-8">
            <h1 className="font-display text-2xl font-semibold text-foreground mb-1 text-center">
              {isSignUp ? "Create Account" : "Sign In"}
            </h1>
            <p className="text-muted-foreground text-sm text-center mb-8">
              {isSignUp ? "Join Andre' Corbin's community" : "Welcome back to Andre' Corbin"}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" required className="pl-10 bg-secondary border-border" />
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="pl-10 bg-secondary border-border" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="pl-10 pr-10 bg-secondary border-border"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <Button type="submit" disabled={submitting} className="w-full gap-2">
                {isSignUp ? <UserPlus size={16} /> : <LogIn size={16} />}
                {submitting ? "Please wait..." : isSignUp ? "Sign Up" : "Sign In"}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <button onClick={() => setIsSignUp(!isSignUp)} className="text-primary hover:underline font-medium">
                {isSignUp ? "Sign In" : "Sign Up"}
              </button>
            </p>
          </div>
        </motion.div>
      </section>
      <Footer />
    </main>
  );
};

export default Auth;
