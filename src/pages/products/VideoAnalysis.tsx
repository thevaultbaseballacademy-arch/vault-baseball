import { motion } from "framer-motion";
import { Video, Check, ArrowRight, Loader2, Clock, FileVideo, MessageSquare, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useProductCheckout } from "@/hooks/useProductCheckout";
import { formatPrice, PRODUCT_PRICES } from "@/lib/productPricing";

const VideoAnalysis = () => {
  const { checkout, loading } = useProductCheckout();
  const product = PRODUCT_PRICES.video_analysis_5pack;

  const process = [
    { icon: FileVideo, title: "Upload", description: "Submit your video through our portal. Works with any format from any device." },
    { icon: Clock, title: "48-Hour Analysis", description: "Our coaches review your mechanics and identify the highest-impact fixes." },
    { icon: MessageSquare, title: "Video Response", description: "Receive a detailed video breakdown with specific drills and action items." },
    { icon: Repeat, title: "Repeat", description: "Use all 5 analyses whenever you need feedback. No expiration." },
  ];

  const whatYouGet = [
    "5 professional video analyses (use anytime)",
    "Detailed video response for each submission",
    "3 specific VAULT fixes per analysis",
    "Drill recommendations for each fix",
    "Priority in queue (48-hour turnaround)",
    "Re-check videos to track progress",
    "Works for hitting, pitching, or fielding",
    "No expiration on your 5-pack",
  ];

  const exampleFixes = [
    { area: "Pitching", fixes: ["Hip lead timing", "Arm path efficiency", "Stride direction"] },
    { area: "Hitting", fixes: ["Bat path optimization", "Hip rotation sequencing", "Load mechanics"] },
    { area: "Fielding", fixes: ["First step quickness", "Glove positioning", "Transfer speed"] },
  ];

  const pricing = [
    { name: "Single Analysis", price: "$39", perUnit: "$39/video", highlight: false },
    { name: "5-Pack", price: "$149", perUnit: "$29.80/video", highlight: true, savings: "Save $46" },
    { name: "10-Pack", price: "$249", perUnit: "$24.90/video", highlight: false, savings: "Save $141" },
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
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 text-cyan-600 text-sm font-medium border border-cyan-500/20">
                <Video className="w-4 h-4" />
                Perfect Add-On for Members
              </span>
            </motion.div>

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center mb-12"
            >
              <div className="w-20 h-20 rounded-2xl bg-cyan-500/10 flex items-center justify-center mx-auto mb-6">
                <Video className="w-10 h-10 text-cyan-500" />
              </div>
              <h1 className="text-4xl md:text-6xl font-display text-foreground mb-4">
                VIDEO ANALYSIS 5-PACK
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Get professional eyes on your mechanics. Submit any video, receive detailed feedback 
                with specific VAULT fixes within 48 hours.
              </p>
            </motion.div>

            {/* Process */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
            >
              {process.map((step, i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-4 text-center relative">
                  {i < process.length - 1 && (
                    <div className="hidden md:block absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 text-muted-foreground">
                      →
                    </div>
                  )}
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center mx-auto mb-3">
                    <step.icon className="w-5 h-5 text-cyan-500" />
                  </div>
                  <h3 className="font-medium text-foreground text-sm mb-1">{step.title}</h3>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </motion.div>

            {/* Example Fixes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="mb-12"
            >
              <h3 className="text-2xl font-display text-foreground mb-6 text-center">Example VAULT Fixes</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {exampleFixes.map((category, i) => (
                  <div key={i} className="bg-card border border-border rounded-xl p-5">
                    <h4 className="font-display text-foreground mb-3">{category.area}</h4>
                    <ul className="space-y-2">
                      {category.fixes.map((fix, j) => (
                        <li key={j} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Check className="w-4 h-4 text-cyan-500" />
                          {fix}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Pricing Options */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-12"
            >
              <h3 className="text-2xl font-display text-foreground mb-6 text-center">Choose Your Pack</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {pricing.map((option, i) => (
                  <div 
                    key={i} 
                    className={`rounded-xl p-6 text-center ${
                      option.highlight 
                        ? 'bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border-2 border-cyan-500/40' 
                        : 'bg-card border border-border'
                    }`}
                  >
                    {option.highlight && (
                      <span className="inline-block px-3 py-1 bg-cyan-500 text-white text-xs font-medium rounded-full mb-3">
                        Most Popular
                      </span>
                    )}
                    <h4 className="font-display text-foreground text-lg mb-2">{option.name}</h4>
                    <div className="text-3xl font-display text-foreground mb-1">{option.price}</div>
                    <p className="text-sm text-muted-foreground mb-3">{option.perUnit}</p>
                    {option.savings && (
                      <p className="text-sm text-cyan-500 font-medium">{option.savings}</p>
                    )}
                    {option.highlight && (
                      <Button
                        variant="vault"
                        className="w-full mt-4"
                        onClick={() => checkout('video_analysis_5pack')}
                        disabled={loading === 'video_analysis_5pack'}
                      >
                        {loading === 'video_analysis_5pack' ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : null}
                        Get 5-Pack
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-center text-sm text-muted-foreground mt-4">
                Currently offering the 5-Pack. Contact us for single or 10-pack options.
              </p>
            </motion.div>

            {/* What's Included */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-card border border-border rounded-2xl p-6 mb-12"
            >
              <h3 className="text-xl font-display text-foreground mb-6 text-center">What You Get</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {whatYouGet.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-cyan-500 flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-cyan-500/5 to-cyan-600/10 border border-cyan-500/20 rounded-2xl p-8 text-center"
            >
              <h3 className="text-2xl font-display text-foreground mb-4">Ready for Expert Feedback?</h3>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                Stop guessing what's wrong with your mechanics. Get specific, actionable fixes 
                from VAULT coaches who've helped thousands of athletes.
              </p>
              <Button
                variant="vault"
                size="xl"
                onClick={() => checkout('video_analysis_5pack')}
                disabled={loading === 'video_analysis_5pack'}
              >
                {loading === 'video_analysis_5pack' ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : null}
                Get Your 5-Pack — {formatPrice(product.price)}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
};

export default VideoAnalysis;