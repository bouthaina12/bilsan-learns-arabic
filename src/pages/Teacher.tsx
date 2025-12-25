import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import TeacherToolsSection from "@/components/TeacherToolsSection";
import FeaturesSection from "@/components/FeaturesSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Teacher = () => {
  return (
    <div className="min-h-screen bg-background font-arabic">
      <Navbar />
      <main>
        <HeroSection />
        <TeacherToolsSection />
        <FeaturesSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Teacher;
