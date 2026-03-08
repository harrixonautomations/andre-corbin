import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const Footer = () => {
  const [linkedin, setLinkedin] = useState("https://linkedin.com");
  const [twitter, setTwitter] = useState("https://twitter.com");
  const [email, setEmail] = useState("hello@andrecorbin.pro");

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", ["social_linkedin", "social_twitter", "social_email"]);
      if (data) {
        data.forEach((row) => {
          if (row.key === "social_linkedin") setLinkedin(row.value);
          if (row.key === "social_twitter") setTwitter(row.value);
          if (row.key === "social_email") setEmail(row.value);
        });
      }
    };
    load();
  }, []);

  return (
    <footer className="bg-navy border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-10 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-12">
          <div className="text-center sm:text-left">
            <h3 className="font-display text-xl sm:text-2xl font-semibold text-foreground mb-3 sm:mb-4">
              Andre' <span className="text-gradient-gold">Corbin</span>
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto sm:mx-0">
              Executive coaching for founders and leaders who refuse to settle for ordinary results.
            </p>
          </div>
          <div className="text-center sm:text-left">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-3 sm:mb-4">Navigate</h4>
            <div className="flex flex-wrap justify-center sm:justify-start sm:flex-col gap-3">
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
          <div className="text-center sm:text-left sm:col-span-2 md:col-span-1">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-3 sm:mb-4">Connect</h4>
            <div className="flex items-center justify-center sm:justify-start gap-5">
              <a href={linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors duration-300 p-1" aria-label="LinkedIn">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                  <rect x="2" y="9" width="4" height="12"/>
                  <circle cx="4" cy="4" r="2"/>
                </svg>
              </a>
              <a href={twitter} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors duration-300 p-1" aria-label="X / Twitter">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href={`mailto:${email}`} className="text-muted-foreground hover:text-primary transition-colors duration-300 p-1" aria-label="Email">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
        <div className="mt-10 sm:mt-16 pt-6 sm:pt-8 border-t border-border text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Andre' Corbin. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
