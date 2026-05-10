// VAULT OS — /path route.
// Standalone Your Path screen for athletes/parents/coaches/orgs. Driven entirely
// by useAthleteState + the Pathway Engine.

import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import YourPathCard from "@/components/pathway/YourPathCard";
import { useAthleteState } from "@/hooks/useAthleteState";
import { stageLabel } from "@/lib/pathway/engine";

export default function YourPath() {
  const state = useAthleteState();

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Your Path | VAULT</title>
        <meta name="description" content="Your personalized VAULT development path — what's next, what to train, and how to get seen." />
        <link rel="canonical" href="/path" />
      </Helmet>
      <Navbar />
      <main className="container mx-auto px-4 py-10 max-w-3xl">
        <header className="mb-8">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Vault OS</p>
          <h1 className="text-3xl md:text-4xl font-bold mt-1">Your Path</h1>
          <p className="text-muted-foreground mt-2">
            One personalized roadmap — assess, train, get seen, scale. Updates as you progress.
          </p>
          {!state.loading && (
            <p className="text-xs text-muted-foreground mt-2">Current stage: {stageLabel(state.stage)}</p>
          )}
        </header>
        <YourPathCard />
      </main>
      <Footer />
    </div>
  );
}
