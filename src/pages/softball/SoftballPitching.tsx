import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft, ArrowRight, Target, BookOpen } from "lucide-react";
import { softballDrillLibrary } from "@/lib/softball/drills";

const pitchArsenal = [
  { name: "Fastball", spin: "Backspin", grip: "4-seam across laces", speed: "55-70 mph", difficulty: "Beginner" },
  { name: "Change-Up", spin: "Reduced spin", grip: "Circle or palm grip", speed: "45-58 mph", difficulty: "Intermediate" },
  { name: "Drop Ball", spin: "Topspin", grip: "Fingers on top at release", speed: "50-65 mph", difficulty: "Intermediate" },
  { name: "Rise Ball", spin: "Backspin (steep)", grip: "Fingers under at release", speed: "55-68 mph", difficulty: "Advanced" },
  { name: "Curveball", spin: "Lateral spin", grip: "Side snap at release", speed: "48-60 mph", difficulty: "Advanced" },
  { name: "Screwball", spin: "Reverse lateral", grip: "Pronation at release", speed: "50-62 mph", difficulty: "Advanced" },
];

const SoftballPitching = () => {
  const navigate = useNavigate();
  const pitchingDrills = softballDrillLibrary.filter(d => d.category === "pitching");

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <Button variant="ghost" className="mb-6" onClick={() => navigate("/softball")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Softball
          </Button>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <p className="text-xs font-display tracking-[0.3em] text-muted-foreground mb-2">VAULT SOFTBALL</p>
            <h1 className="text-3xl md:text-4xl font-display tracking-tight text-foreground">
              WINDMILL PITCHING
            </h1>
            <p className="text-muted-foreground mt-2 text-sm max-w-xl">
              Master windmill mechanics, build a complete pitch arsenal, and develop elite command.
            </p>
          </motion.div>

          <Tabs defaultValue="arsenal" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="arsenal" className="font-display text-xs tracking-wider">PITCH ARSENAL</TabsTrigger>
              <TabsTrigger value="drills" className="font-display text-xs tracking-wider">DRILLS</TabsTrigger>
              <TabsTrigger value="course" className="font-display text-xs tracking-wider">COURSE</TabsTrigger>
            </TabsList>

            <TabsContent value="arsenal" className="mt-6">
              <div className="grid md:grid-cols-2 gap-4">
                {pitchArsenal.map((pitch, i) => (
                  <motion.div key={pitch.name} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                    <Card className="border-border">
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-display text-foreground">{pitch.name}</h3>
                          <Badge variant="outline" className="text-[10px] font-display">{pitch.difficulty}</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                          <div><span className="text-foreground/70">Spin:</span> {pitch.spin}</div>
                          <div><span className="text-foreground/70">Speed:</span> {pitch.speed}</div>
                          <div className="col-span-2"><span className="text-foreground/70">Grip:</span> {pitch.grip}</div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="drills" className="mt-6">
              <div className="space-y-3">
                {pitchingDrills.map((drill, i) => (
                  <motion.div key={drill.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                    <Card className="border-border">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-display text-sm text-foreground">{drill.name}</h4>
                              <Badge variant="secondary" className="text-[10px]">{drill.difficulty}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">{drill.description}</p>
                            <div className="flex gap-2 mt-2 text-[10px] text-muted-foreground">
                              <span>⏱ {drill.duration}</span>
                              <span>👤 {drill.ageRange}</span>
                              <Badge variant="outline" className="text-[10px]">{drill.subcategory}</Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="course" className="mt-6">
              <Card className="border-border cursor-pointer hover:border-foreground/20 transition-colors" onClick={() => navigate("/course/fastpitch-pitching-system")}>
                <CardContent className="p-6 text-center">
                  <BookOpen className="w-10 h-10 text-primary mx-auto mb-3" />
                  <h3 className="font-display text-lg text-foreground mb-2">FASTPITCH PITCHING SYSTEM</h3>
                  <p className="text-sm text-muted-foreground mb-4">10-week structured course covering windmill mechanics, pitch arsenal, velocity, and arm health.</p>
                  <Button className="font-display tracking-wider text-xs">
                    VIEW COURSE <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default SoftballPitching;
