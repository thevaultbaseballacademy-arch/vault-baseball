import { motion } from "framer-motion";
import { TrendingUp, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const results = [
  { initials: "J.T.", age: "16 · RHP", before: "74 MPH", after: "82 MPH", gain: "+8 MPH", metric: "Pitch Velocity", weeks: 10 },
  { initials: "M.R.", age: "15 · OF", before: "72 MPH", after: "79 MPH", gain: "+7 MPH", metric: "Exit Velocity", weeks: 8 },
  { initials: "C.A.", age: "14 · SS/RHP", before: "66 MPH", after: "72 MPH", gain: "+6 MPH", metric: "Pitch Velocity", weeks: 12 },
  { initials: "D.P.", age: "17 · C", before: "2.15s", after: "1.98s", gain: "-0.17s", metric: "Pop Time", weeks: 8 },
  { initials: "A.W.", age: "13 · RHP", before: "58 MPH", after: "64 MPH", gain: "+6 MPH", metric: "Pitch Velocity", weeks: 12 },
  { initials: "K.B.", age: "16 · 1B/OF", before: "78 MPH", after: "87 MPH", gain: "+9 MPH", metric: "Exit Velocity", weeks: 10 },
];

const AthleteResults = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="max-w-5xl mx-auto"
        >
          <div className="text-center mb-12 md:mb-16">
            <span className="text-[11px] font-display tracking-[0.3em] text-muted-foreground mb-4 block">ATHLETE DEVELOPMENT RESULTS</span>
            <h2 className="text-3xl md:text-5xl font-display text-foreground mb-3">MEASURABLE GAINS. REAL ATHLETES.</h2>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              These results come from athletes following structured Vault programming. Names abbreviated for privacy.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {results.map((r, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="border border-border bg-card p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-display text-foreground">{r.initials}</p>
                    <p className="text-[11px] text-muted-foreground">{r.age}</p>
                  </div>
                  <div className="flex items-center gap-1 px-3 py-1 bg-foreground text-primary-foreground">
                    <TrendingUp className="w-3 h-3" />
                    <span className="text-sm font-display">{r.gain}</span>
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[10px] font-display tracking-wider text-muted-foreground">{r.metric}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-muted-foreground">{r.before}</span>
                      <ArrowRight className="w-3 h-3 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">{r.after}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-display tracking-wider text-muted-foreground">{r.weeks} WEEKS</span>
                </div>
              </motion.div>
            ))}
          </div>

          <p className="text-center text-[10px] text-muted-foreground mt-6 italic">
            Results represent individual athlete progress. Names abbreviated for privacy. School names fictionalized.
          </p>

          <div className="text-center mt-8">
            <Button
              variant="vault"
              size="lg"
              className="font-display tracking-wide"
              onClick={() => navigate("/evaluate")}
            >
              START YOUR ATHLETE'S EVALUATION
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AthleteResults;
