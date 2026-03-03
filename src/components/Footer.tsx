import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="bg-navy border-t border-border">
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        <div>
          <h3 className="font-display text-2xl font-semibold text-foreground mb-4">
            Andre' <span className="text-gradient-gold">Corbin</span>
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
            Executive coaching for founders and leaders who refuse to settle for ordinary results.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-4">Navigate</h4>
          <div className="flex flex-col gap-3">
            {["About", "Coaching", "The Book", "Contact"].map((item) => (
              <Link
                key={item}
                to={`/${item === "The Book" ? "book" : item.toLowerCase()}`}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-4">Connect</h4>
          <div className="flex flex-col gap-3 text-sm text-muted-foreground">
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">LinkedIn</a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Twitter / X</a>
            <a href="mailto:hello@andrecorbin.pro" className="hover:text-primary transition-colors">hello@andrecorbin.pro</a>
          </div>
        </div>
      </div>
      <div className="mt-16 pt-8 border-t border-border text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Andre' Corbin. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
