import { motion } from "framer-motion";
import { ArrowRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const CTA = () => {
  return (
    <section className="py-24 relative overflow-hidden bg-primary">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `linear-gradient(hsl(var(--primary-foreground)) 1px, transparent 1px), 
                          linear-gradient(90deg, hsl(var(--primary-foreground)) 1px, transparent 1px)`,
        backgroundSize: '40px 40px'
      }} />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-display text-primary-foreground mb-6 leading-[0.9]">
            READY TO UNLOCK
            <span className="block">YOUR POTENTIAL?</span>
          </h2>

          <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto">
            Join the Vault and access data-driven training systems designed to 
            develop elite baseball athletes at every level.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="secondary" 
              size="xl"
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            >
              Join Vault Now
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button 
              variant="outline" 
              size="xl"
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Download className="w-5 h-5" />
              Free Training Guide
            </Button>
          </div>

          <p className="text-sm text-primary-foreground/60 mt-8">
            Start with a free resource • No credit card required
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
