import { Button } from "@/components/ui/button";
import { Sparkles, ArrowLeft } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-primary via-pink-soft to-lavender relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 right-10 w-32 h-32 bg-primary-foreground/10 rounded-full blur-2xl" />
        <div className="absolute bottom-10 left-10 w-40 h-40 bg-primary-foreground/10 rounded-full blur-3xl" />
        <Sparkles className="absolute top-1/4 left-1/4 w-8 h-8 text-primary-foreground/30 animate-pulse" />
        <Sparkles className="absolute bottom-1/3 right-1/3 w-6 h-6 text-primary-foreground/20 animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block text-primary-foreground/90 text-sm font-medium mb-4 font-arabic bg-primary-foreground/20 px-4 py-1 rounded-full">
            ابدأ رحلة التعلّم
          </span>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6 font-arabic leading-tight">
            هل أنت مستعد لبدء المغامرة مع بيلسان؟
          </h2>
          
          <p className="text-lg md:text-xl text-primary-foreground/90 mb-10 font-arabic leading-relaxed max-w-2xl mx-auto">
            انضم إلى آلاف الأطفال الذين يتعلّمون العربية بطريقة ممتعة ومشوّقة
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="text-lg font-arabic px-10 py-7 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-card text-foreground hover:bg-card/90"
            >
              <Sparkles className="ml-2 w-5 h-5" />
              ابدأ مجاناً الآن
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg font-arabic px-10 py-7 rounded-full border-2 border-primary-foreground/50 text-primary-foreground hover:bg-primary-foreground/20 transition-all duration-300 bg-transparent"
            >
              تعرّف أكثر
              <ArrowLeft className="mr-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;