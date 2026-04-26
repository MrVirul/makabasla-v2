import NavBar from "@/components/NavBar";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import Footer from "@/components/Footer";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-black">
      <NavBar />
      <HeroSection />
      <ServicesSection />
      <Footer />
    </div>
  );
}
