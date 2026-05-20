import bilsanImage from "@/assets/bilsan-hero.png";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { scrollToSection } from "@/hooks/useScrollAnimation";

const HeroSection = () => {
  const navigate = useNavigate();

  const handleEnroll = () => {
    navigate("/auth");
  };

  const handleLearnMore = () => {
    scrollToSection("about");
  };

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-pink-light via-background to-lavender-light pt-20">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-20 h-20 bg-sunny/30 rounded-full blur-2xl animate-pulse" />
        <div className="absolute top-1/4 left-10 w-32 h-32 bg-pink-soft/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-24 h-24 bg-lavender/30 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-10 left-1/3 w-16 h-16 bg-mint/30 rounded-full blur-xl" />
        
        {/* Floating stars */}
        <Sparkles className="absolute top-20 left-1/4 w-6 h-6 text-sunny animate-bounce" style={{ animationDelay: "0.5s" }} />
        <Sparkles className="absolute top-1/3 right-1/3 w-5 h-5 text-coral animate-bounce" style={{ animationDelay: "1s" }} />
        <Sparkles className="absolute bottom-1/3 left-20 w-4 h-4 text-pink-soft animate-bounce" style={{ animationDelay: "1.5s" }} />
      </div>

      <div className="container mx-auto px-4 py-8 sm:py-12 relative z-10">
        <div className="flex flex-col-reverse lg:flex-row items-center justify-between gap-6 sm:gap-8 lg:gap-12">
          {/* Content */}
          <div className="text-center lg:text-right flex-1 max-w-2xl animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-card/80 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full mb-4 sm:mb-6 shadow-sm">
              <span className="text-xl sm:text-2xl">🌸</span>
              <span className="text-xs sm:text-sm font-medium text-muted-foreground font-arabic">
                منصة تعليمية للأطفال
              </span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground mb-6 font-arabic leading-tight">
              سلسلة <span className="text-primary">بيلسان</span> التعليمية
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground mb-8 font-arabic leading-relaxed">
              رحلة ممتعة لتعلّم اللغة العربية للأطفال في ألمانيا
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start w-full sm:w-auto">
              <Button 
                size="lg" 
                className="text-base sm:text-lg font-arabic px-6 sm:px-8 py-5 sm:py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-primary hover:bg-primary/90"
                onClick={handleEnroll}
              >
                <Sparkles className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                ابدأ التعلّم الآن
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-base sm:text-lg font-arabic px-6 sm:px-8 py-5 sm:py-6 rounded-full border-2 border-primary/30 hover:bg-primary/10 transition-all duration-300"
                onClick={handleLearnMore}
              >
                تعرّف على المنصة
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 sm:gap-6 mt-8 sm:mt-10">
              {[
                { number: "١٠٠+", label: "قصة تفاعلية" },
                { number: "٥٠+", label: "لعبة تعليمية" },
                { number: "٢٠٠+", label: "ورقة عمل" },
              ].map((stat, index) => (
                <div key={index} className="text-center px-2 sm:px-4">
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-primary font-arabic">
                    {stat.number}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground font-arabic">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Character Image */}
          <div className="relative w-full max-w-xs sm:max-w-sm lg:max-w-md xl:max-w-lg flex-shrink-0 animate-scale-in">
            <div className="relative animate-float">
              <img
                src={bilsanImage}
                alt="بيلسان - شخصية تعليمية للأطفال"
                className="w-full h-auto drop-shadow-2xl relative z-10 object-contain rounded-3xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;