import { useEffect } from "react";
import robotMascot from "@/assets/robot-mascot.png";
import { useScrollAnimation, playSound } from "@/hooks/useScrollAnimation";

const FeaturesSection = () => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });

  useEffect(() => {
    if (isVisible) {
      playSound('chime');
    }
  }, [isVisible]);

  return (
    <section 
      id="features"
      ref={ref as React.RefObject<HTMLElement>}
      className="py-20 bg-gradient-to-b from-background to-lavender-light relative overflow-hidden"
    >
      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <img 
          src={robotMascot} 
          alt="" 
          className="absolute top-20 right-10 w-16 h-16 opacity-30 hidden md:block"
        />
        <div className="absolute top-1/4 left-0 w-40 h-40 bg-sunny/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-56 h-56 bg-pink-soft/15 rounded-full blur-3xl" />
        
        {/* Floating Arabic letters */}
        {["أ", "ب", "ت", "ث"].map((letter, i) => (
          <span
            key={i}
            className="absolute text-primary/10 font-arabic font-bold text-6xl hidden lg:block"
            style={{
              left: `${15 + i * 25}%`,
              top: `${20 + (i % 2) * 60}%`,
            }}
          >
            {letter}
          </span>
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className={`text-center mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <span className="inline-block text-primary text-sm font-medium mb-3 font-arabic bg-pink-light/50 px-4 py-1 rounded-full">
            شاهد كيف نعمل
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 font-arabic">
            استكشف <span className="text-primary">المزايا</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-arabic leading-relaxed">
            تعرّف على طريقتنا الفريدة في تعليم اللغة العربية للأطفال
          </p>
        </div>

        {/* Video Frame */}
        <div className={`max-w-4xl mx-auto transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="relative bg-card rounded-3xl shadow-xl overflow-hidden border border-border/30">
            {/* Browser-like header */}
            <div className="bg-muted px-4 py-3 flex items-center gap-2 border-b border-border/30">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-coral" />
                <div className="w-3 h-3 rounded-full bg-sunny" />
                <div className="w-3 h-3 rounded-full bg-mint" />
              </div>
              <div className="flex-1 mx-4">
                <div className="bg-background rounded-lg px-4 py-1.5 text-sm text-muted-foreground font-arabic text-center">
                  بيلسان - تعلّم العربية
                </div>
              </div>
            </div>
            
            {/* Video Container */}
            <div className="aspect-video relative bg-foreground/5">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/qjzczpOfITg?si=2iyk-mIBQIdUeuIA"         
                title="بيلسان - تعلم العربية"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
