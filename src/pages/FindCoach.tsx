import { motion } from "framer-motion";
import { Search, MapPin, Award, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState } from "react";

// Mock data - in production this would come from a database
const certifiedCoaches = [
  {
    id: 1,
    name: "Coach Mike Thompson",
    location: "Austin, TX",
    specialties: ["Velocity Development", "Pitching"],
    since: 2023,
    website: "https://example.com",
  },
  {
    id: 2,
    name: "Coach Sarah Martinez",
    location: "Dallas, TX",
    specialties: ["Hitting", "Youth Development"],
    since: 2024,
    website: "https://example.com",
  },
  {
    id: 3,
    name: "Coach Ryan Chen",
    location: "Houston, TX",
    specialties: ["Catching", "Defense"],
    since: 2023,
    website: "https://example.com",
  },
  {
    id: 4,
    name: "Coach Jake Williams",
    location: "Phoenix, AZ",
    specialties: ["Strength & Conditioning", "Athleticism"],
    since: 2024,
    website: "https://example.com",
  },
];

const FindCoach = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCoaches = certifiedCoaches.filter(
    (coach) =>
      coach.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coach.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coach.specialties.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
              <div className="w-20 h-20 rounded-2xl bg-foreground flex items-center justify-center mx-auto mb-6">
                <Award className="w-10 h-10 text-background" />
              </div>
              <h1 className="text-4xl md:text-6xl font-display text-foreground mb-4">
                FIND A VAULT™ COACH
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Connect with certified VAULT™ coaches who have been trained in the 
                complete framework and methodology.
              </p>
            </motion.div>

            {/* Search */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="relative mb-8"
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search by name, location, or specialty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-14 text-lg"
              />
            </motion.div>

            {/* Coaches List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4 mb-12"
            >
              {filteredCoaches.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No coaches found matching your search.
                </div>
              ) : (
                filteredCoaches.map((coach) => (
                  <div
                    key={coach.id}
                    className="bg-card border border-border rounded-xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-display text-foreground">{coach.name}</h3>
                        <span className="px-2 py-0.5 rounded-full bg-foreground text-background text-xs font-medium">
                          Certified {coach.since}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <MapPin className="w-4 h-4" />
                        <span>{coach.location}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {coach.specialties.map((specialty) => (
                          <span
                            key={specialty}
                            className="px-3 py-1 rounded-full bg-secondary text-sm text-muted-foreground"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                    <Button variant="outline" asChild>
                      <a href={coach.website} target="_blank" rel="noopener noreferrer">
                        Contact
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </a>
                    </Button>
                  </div>
                ))
              )}
            </motion.div>

            {/* Become a Coach CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-card to-secondary border border-border rounded-2xl p-8 text-center"
            >
              <h3 className="text-xl font-display text-foreground mb-2">
                Are You a Coach?
              </h3>
              <p className="text-muted-foreground mb-4">
                Get certified and join our growing network of VAULT™ coaches.
              </p>
              <Link to="/products/certified-coach">
                <Button variant="vault">
                  Get Certified
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

export default FindCoach;
