import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

const About = () => (
  <main>
    <Navigation />
    <section className="pt-32 pb-20 section-padding bg-background">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <p className="text-xs font-medium tracking-[0.3em] uppercase text-primary mb-4">About</p>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-8">
            The Coach Behind <br />
            <span className="text-gradient-gold">the Transformation</span>
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="space-y-6 text-muted-foreground leading-relaxed text-base md:text-lg"
        >
          <p>
            Andre Corbin is an executive coach who has spent over a decade working with 
            founders, C-suite executives, and high-growth teams across industries ranging 
            from technology and finance to healthcare and media.
          </p>
          <p>
            His approach is grounded in a simple belief: <span className="text-foreground font-medium">the biggest bottleneck 
            in any company is the leader's own mindset.</span> By unlocking clarity, resolving 
            internal friction, and building unshakable conviction, Andre helps his clients 
            make decisions faster, inspire their teams more deeply, and achieve results 
            that compound over years—not quarters.
          </p>
          <p>
            Before coaching, Andre built and led teams at scaling startups and Fortune 500 
            companies. He brings a rare blend of strategic thinking and emotional intelligence 
            that makes him equally effective in a boardroom or a one-on-one session.
          </p>

          <div className="pt-8 grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { stat: "200+", label: "Leaders Coached" },
              { stat: "15+", label: "Years Experience" },
              { stat: "$2B+", label: "Client Revenue Impacted" },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <p className="font-display text-4xl font-bold text-primary mb-2">{item.stat}</p>
                <p className="text-muted-foreground text-sm">{item.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
    <Footer />
  </main>
);

export default About;
