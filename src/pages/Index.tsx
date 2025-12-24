import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ContentSection from "@/components/ContentSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background font-arabic">
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <ContentSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;