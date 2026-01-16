import { motion } from "framer-motion";
import { Award, Check, ArrowRight, Loader2, BadgeCheck, Users, BookOpen, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useProductCheckout } from "@/hooks/useProductCheckout";
import { formatPrice, PRODUCT_PRICES } from "@/lib/productPricing";

const VaultVerifiedCoach = () => {
  const { checkout, loading } = useProductCheckout();
  const product = PRODUCT_PRICES.vault_verified_coach;

  const benefits = [
    { icon: BadgeCheck, title: "Official Badge", description: "Display the VAULT Verified Coach badge on your website, social media, and marketing materials" },
    { icon: Globe, title: "Directory Listing", description: "Featured listing in our coach directory with direct booking links to your services" },
    { icon: BookOpen, title: "Drill Library", description: "Access to 200+ VAULT drills and programs to use with your athletes" },
    { icon: Users, title: "Community", description: "Private network of certified coaches for collaboration and referrals" },
  ];

  const certification = [
    "Complete VAULT methodology training (online, self-paced)",
    "5 core modules covering velocity, longevity, accuracy, unity, and transfer",
    "Assessment quiz for each module (80% passing score required)",
    "Final practical assessment with video submission",
    "Official VAULT Verified Coach certificate",
  ];

  const included = [
    "Official VAULT Verified Coach digital badge",
    "Featured listing in coach directory with booking link",
    "200+ drill library with video demonstrations",
    "Marketing materials (logos, templates, social graphics)",
    "Quarterly continuing education webinars",
    "Private Slack community with other certified coaches",
    "Client referral network access",
    "Annual recertification included",
    "Priority support from VAULT team",
    "Use of VAULT brand in your marketing",
  ];

  const requirements = [
    "Minimum 2 years coaching experience",
    "Complete all training modules",
    "Pass module assessments (80% minimum)",
    "Submit practical video assessment",
    "Agree to VAULT coaching standards",
  ];

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-32 pb-24">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center mb-6"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-600 text-sm font-medium border border-emerald-500/20">
                <Award className="w-4 h-4" />
                B2B Revenue Stream
              </span>
            </motion.div>

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center mb-12"
            >
              <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
                <BadgeCheck className="w-10 h-10 text-emerald-500" />
              </div>
              <h1 className="text-4xl md:text-6xl font-display text-foreground mb-4">
                VAULT VERIFIED COACH
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Become an officially certified VAULT coach. Get the training, credentials, and marketing 
                support to grow your coaching business with proven methodology.
              </p>
            </motion.div>

            {/* Benefits Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
            >
              {benefits.map((benefit, i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-4 text-center">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                    <benefit.icon className="w-5 h-5 text-emerald-500" />
                  </div>
                  <h3 className="font-medium text-foreground text-sm mb-1">{benefit.title}</h3>
                  <p className="text-xs text-muted-foreground">{benefit.description}</p>
                </div>
              ))}
            </motion.div>

            {/* Pricing Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-gradient-to-br from-emerald-500/5 to-emerald-600/10 border border-emerald-500/20 rounded-2xl p-8 mb-12"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <p className="text-sm text-emerald-600 font-medium mb-2">Annual Certification</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-display text-foreground">{formatPrice(product.price)}</span>
                    <span className="text-muted-foreground">/year</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Includes all training, materials, and annual renewal
                  </p>
                </div>
                <Button
                  variant="vault"
                  size="xl"
                  onClick={() => checkout('vault_verified_coach')}
                  disabled={loading === 'vault_verified_coach'}
                  className="whitespace-nowrap"
                >
                  {loading === 'vault_verified_coach' ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : null}
                  Get Certified
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </motion.div>

            {/* Two Column: Certification + Included */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid md:grid-cols-2 gap-8 mb-12"
            >
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="text-xl font-display text-foreground mb-6">Certification Process</h3>
                <ol className="space-y-3">
                  {certification.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-muted-foreground text-sm">{item}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="text-xl font-display text-foreground mb-6">What's Included</h3>
                <ul className="space-y-2">
                  {included.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Requirements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-card border border-border rounded-2xl p-6 mb-12"
            >
              <h3 className="text-xl font-display text-foreground mb-4 text-center">Requirements</h3>
              <div className="flex flex-wrap justify-center gap-3">
                {requirements.map((req, i) => (
                  <span key={i} className="px-4 py-2 bg-secondary rounded-full text-sm text-muted-foreground">
                    {req}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* ROI Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-8 text-center"
            >
              <h3 className="text-2xl font-display text-foreground mb-4">The ROI Math</h3>
              <p className="text-muted-foreground mb-6">
                Just 2-3 new clients from your directory listing and referral network 
                pays for the entire certification. Most coaches report 5-10 new clients in their first year.
              </p>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-3xl font-display text-emerald-500">$499</div>
                  <p className="text-xs text-muted-foreground">Investment</p>
                </div>
                <div>
                  <div className="text-3xl font-display text-emerald-500">5-10</div>
                  <p className="text-xs text-muted-foreground">Avg. New Clients/Year</p>
                </div>
                <div>
                  <div className="text-3xl font-display text-emerald-500">10x+</div>
                  <p className="text-xs text-muted-foreground">Typical ROI</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
};

export default VaultVerifiedCoach;