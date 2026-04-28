import NavBar from "@/components/NavBar";
import HeroSection from "@/components/HeroSection";
import PartnersSection from "@/components/PartnersSection";
import ServicesSection from "@/components/ServicesSection";
import ProjectsSection from "@/components/ProjectsSection";
import Footer from "@/components/Footer";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-black">
      <NavBar />
      <HeroSection />
      <PartnersSection />
      <ServicesSection />
      <ProjectsSection />
      <Footer />
    </div>
  );
}
