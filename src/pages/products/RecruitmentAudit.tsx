import { motion } from "framer-motion";
import { GraduationCap, Check, ArrowRight, Loader2, Target, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useProductCheckout } from "@/hooks/useProductCheckout";
import { formatPrice, PRODUCT_PRICES } from "@/lib/productPricing";

const RecruitmentAudit = () => {
  const { checkout, loading } = useProductCheckout();
  const product = PRODUCT_PRICES.recruitment_audit;

  const includes = [
    "Complete metrics review and assessment",
    "Target school identification (10-15 schools)",
    "Recruiting timeline roadmap",
    "Video evaluation for recruiting purposes",
    "Email templates for coach outreach",
    "Social media profile optimization guide",
    "Follow-up Q&A session (30 min)",
  ];

  const process = [
    {
      step: "1",
      title: "Submit Your Info",
      description: "Complete the intake form with your stats, video, and target schools",
    },
    {
      step: "2",
      title: "Expert Review",
      description: "Our recruiting specialists analyze your profile and identify opportunities",
    },
    {
      step: "3",
      title: "Get Your Roadmap",
      description: "Receive your personalized recruiting strategy within 5 business days",
    },
  ];

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-32 pb-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <div className="w-20 h-20 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-6">
                <GraduationCap className="w-10 h-10 text-green-500" />
              </div>
              <h1 className="text-4xl md:text-6xl font-display text-foreground mb-4">
                VAULT RECRUITMENT AUDIT
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Get a clear recruiting roadmap with target schools, timeline, 
                and strategy guidance from experienced recruiting specialists.
              </p>
            </motion.div>

            {/* Pricing Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-card to-secondary border border-border rounded-2xl p-8 mb-12"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <p className="text-sm text-green-600 font-medium mb-2">One-Time Investment</p>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-5xl font-display text-foreground">{formatPrice(product.price)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Complete recruiting roadmap delivered in 5 business days
                  </p>
                </div>
                <Button
                  variant="vault"
                  size="xl"
                  onClick={() => checkout('recruitment_audit')}
                  disabled={loading === 'recruitment_audit'}
                >
                  {loading === 'recruitment_audit' ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : (
                    <FileText className="w-5 h-5 mr-2" />
                  )}
                  Get My Audit
                </Button>
              </div>
            </motion.div>

            {/* Process */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid md:grid-cols-3 gap-6 mb-12"
            >
              {process.map((step, i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-6 text-center">
                  <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                    <span className="text-lg font-display text-green-500">{step.step}</span>
                  </div>
                  <h3 className="font-display text-lg text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </motion.div>

            {/* What's Included */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card border border-border rounded-2xl p-8 mb-12"
            >
              <h3 className="text-2xl font-display text-foreground mb-6 flex items-center gap-3">
                <Target className="w-6 h-6 text-green-500" />
                What's Included
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {includes.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Note for Elite Members */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-secondary/50 rounded-2xl p-8 text-center"
            >
              <h3 className="text-xl font-display text-foreground mb-2">
                Elite Members: This is Included
              </h3>
              <p className="text-muted-foreground mb-4">
                The Recruitment Audit is included as part of the VAULT™ Elite Membership 
                along with 1-on-1 coaching and unlimited video analysis.
              </p>
              <Link to="/#pricing">
                <Button variant="outline">
                  View Elite Membership
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
};

export default RecruitmentAudit;
