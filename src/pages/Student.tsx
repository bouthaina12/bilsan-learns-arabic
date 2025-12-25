import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ContentSection from "@/components/ContentSection";
import FeaturesSection from "@/components/FeaturesSection";
import HowWeLearnSection from "@/components/HowWeLearnSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Student = () => {
  return (
    <div className="min-h-screen bg-background font-arabic">
      <Navbar />
      <main>
        <HeroSection />
        <ContentSection />
        <FeaturesSection />
        <HowWeLearnSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Student;
