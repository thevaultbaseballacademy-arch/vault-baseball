import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import VaultPillars from "@/components/VaultPillars";
import Courses from "@/components/Courses";
import Testimonials from "@/components/Testimonials";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <VaultPillars />
      <Courses />
      <Testimonials />
      <Pricing />
      <Footer />
    </main>
  );
};

export default Index;
