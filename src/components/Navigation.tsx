import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, LogIn, UserPlus, LayoutDashboard, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/coaching", label: "Coaching" },
  { to: "/book", label: "The Book" },
  { to: "/contact", label: "Contact" },
];

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();
  const [scrolled, setScrolled] = useState(false);
  const { user, signOut } = useAuth();

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Track scroll for shadow
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border transition-shadow duration-300 ${scrolled ? "shadow-lg shadow-background/50" : ""}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
        <div className="flex items-center justify-between h-14 sm:h-16 md:h-20">
          <Link to="/" className="font-display text-lg sm:text-xl md:text-2xl font-semibold tracking-tight text-foreground">
            Andre' <span className="text-gradient-gold">Corbin</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-medium tracking-wide uppercase transition-colors duration-300 ${
                  location.pathname === link.to
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/book-session"
              className="px-5 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-sm tracking-wide uppercase hover:bg-gold-light transition-colors duration-300"
            >
              Book a Session
            </Link>
            {user ? (
              <>
                <Link to="/dashboard">
                  <Button variant="outline" size="sm" className="gap-2">
                    <LayoutDashboard size={14} /> Dashboard
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground" onClick={signOut}>
                  <LogOut size={14} /> Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <LogIn size={14} /> Sign In
                  </Button>
                </Link>
                <Link to="/auth?signup=true">
                  <Button variant="outline" size="sm" className="gap-2">
                    <UserPlus size={14} /> Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile/Tablet Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden text-foreground p-2 -mr-2 touch-manipulation"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile: Sheet from right side */}
      {isMobile && (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetContent side="right" className="w-[280px] bg-background border-border p-0">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <div className="flex flex-col h-full pt-12 pb-8 px-6">
              <div className="flex flex-col gap-1 flex-1">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.to}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      to={link.to}
                      onClick={() => setIsOpen(false)}
                      className={`block px-4 py-3.5 rounded-lg text-base font-medium tracking-wide transition-all duration-200 ${
                        location.pathname === link.to
                          ? "text-primary bg-primary/10"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-3"
              >
                <Link
                  to="/book-session"
                  onClick={() => setIsOpen(false)}
                  className="block w-full px-5 py-3.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg tracking-wide uppercase text-center hover:bg-gold-light transition-colors duration-300"
                >
                  Book a Session
                </Link>
                {user ? (
                  <>
                    <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block">
                      <Button variant="outline" className="w-full gap-2"><LayoutDashboard size={14} /> Dashboard</Button>
                    </Link>
                    <Button variant="ghost" className="w-full gap-2 text-muted-foreground" onClick={() => { signOut(); setIsOpen(false); }}>
                      <LogOut size={14} /> Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/auth" onClick={() => setIsOpen(false)} className="block">
                      <Button variant="ghost" className="w-full gap-2"><LogIn size={14} /> Sign In</Button>
                    </Link>
                    <Link to="/auth?signup=true" onClick={() => setIsOpen(false)} className="block">
                      <Button variant="outline" className="w-full gap-2"><UserPlus size={14} /> Sign Up</Button>
                    </Link>
                  </>
                )}
              </motion.div>
            </div>
          </SheetContent>
        </Sheet>
      )}

      {/* Tablet: dropdown from top */}
      {!isMobile && (
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="lg:hidden bg-background border-b border-border overflow-hidden"
            >
              <div className="px-6 py-5 flex flex-wrap gap-3 items-center justify-center">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsOpen(false)}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium tracking-wide transition-all duration-200 ${
                      location.pathname === link.to
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  to="/book-session"
                  onClick={() => setIsOpen(false)}
                  className="px-5 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg tracking-wide uppercase hover:bg-gold-light transition-colors duration-300"
                >
                  Book a Session
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </nav>
  );
};

export default Navigation;
