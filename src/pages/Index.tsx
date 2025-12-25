import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ContentSection from "@/components/ContentSection";
import FeaturesSection from "@/components/FeaturesSection";
import HowWeLearnSection from "@/components/HowWeLearnSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => {
  const location = useLocation();

  // Handle hash navigation on page load
  useEffect(() => {
    if (location.hash) {
      const sectionId = location.hash.replace('#', '');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          const navbarHeight = 80;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.scrollY - navbarHeight;
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  }, [location.hash]);

  return (
    <div className="min-h-screen bg-background font-arabic">
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <ContentSection />
        <FeaturesSection />
        <HowWeLearnSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
