import { motion } from "framer-motion";
import { XCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PaymentCanceled = () => {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-32 pb-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-xl mx-auto text-center"
          >
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-muted-foreground" />
            </div>
            <h1 className="text-4xl md:text-5xl font-display text-foreground mb-4">
              PAYMENT CANCELED
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Your payment was not completed. No charges have been made to your account. 
              Ready to try again?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/#pricing">
                <Button variant="vault" size="lg">
                  View Pricing
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/">
                <Button variant="outline" size="lg">
                  Return Home
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
      <Footer />
    </main>
  );
};

export default PaymentCanceled;
