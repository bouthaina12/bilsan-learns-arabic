import { useEffect } from "react";
import step1Image from "@/assets/step-1-reading.png";
import step2Image from "@/assets/step-2-games.png";
import step3Image from "@/assets/step-3-trophy.png";
import robotMascot from "@/assets/robot-mascot.png";
import { useScrollAnimation, playSound } from "@/hooks/useScrollAnimation";

const steps = [
  {
    number: 1,
    title: "كتب وروايات ممتعة",
    description: "يتم اختيارها لتناسب جميع الأذواق تُقرأ بطريقة درامية من ممثلين محترفين بلغة عربية فصحى سليمة.",
    image: step1Image,
  },
  {
    number: 2,
    title: "وحدات من التعلّم الممتع",
    description: "تدمج الكتب، والكرتون والألعاب، والتمارين التفاعلية وأوراق العمل",
    image: step2Image,
  },
  {
    number: 3,
    title: "التعليم بالتلعيب",
    description: "ندمج العناصر التي تجعل اللعب ممتعًا للبشر مع العملية التعليمية.",
    image: step3Image,
  },
];

const arabicLetters = ["ا", "ب", "ت", "ث", "ج", "ح"];

const HowWeLearnSection = () => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });

  useEffect(() => {
    if (isVisible) {
      playSound('whoosh');
    }
  }, [isVisible]);

  return (
    <section 
      id="how-we-learn"
      ref={ref as React.RefObject<HTMLElement>}
      className="py-20 bg-gradient-to-b from-lavender-light to-background relative overflow-hidden"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Robot decorations */}
        <img 
          src={robotMascot} 
          alt="" 
          className="absolute top-10 left-5 w-14 h-14 opacity-20 hidden md:block"
        />
        <img 
          src={robotMascot} 
          alt="" 
          className="absolute bottom-32 right-8 w-16 h-16 opacity-25 hidden md:block"
        />
        <img 
          src={robotMascot} 
          alt="" 
          className="absolute top-1/3 right-1/4 w-12 h-12 opacity-15 hidden lg:block"
        />
        
        {/* Arabic letters */}
        {arabicLetters.map((letter, index) => (
          <span
            key={index}
            className="absolute text-primary/10 font-arabic font-bold select-none hidden md:block"
            style={{
              fontSize: `${50 + Math.random() * 30}px`,
              left: `${5 + index * 18}%`,
              top: `${10 + (index % 3) * 35}%`,
              transform: `rotate(${Math.random() * 20 - 10}deg)`,
            }}
          >
            {letter}
          </span>
        ))}
        
        {/* Decorative shapes */}
        <div className="absolute top-20 left-1/4 w-32 h-32 bg-sunny/10 rounded-full blur-2xl" />
        <div className="absolute bottom-20 right-1/4 w-40 h-40 bg-pink-soft/10 rounded-full blur-2xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-block mb-4">
            <span className="text-sunny text-3xl">✦</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 font-arabic">
            كيف نجعل <span className="text-primary border-b-4 border-primary">التعلّم ممتعًا</span>
          </h2>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <div 
              key={step.number} 
              className={`relative text-center group transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              {/* Step Number Badge */}
              <div className="absolute top-0 right-1/2 translate-x-1/2 md:right-4 md:translate-x-0 -translate-y-4 z-20">
                <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg border-4 border-background">
                  {step.number}
                </div>
              </div>

              {/* Image Container */}
              <div className="relative mb-6 pt-8">
                <div className="relative mx-auto w-48 h-48 md:w-56 md:h-56 flex items-center justify-center">
                  <img 
                    src={step.image} 
                    alt={step.title}
                    className="w-full h-full object-contain drop-shadow-xl group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>

              {/* Content */}
              <h3 className="text-xl md:text-2xl font-bold text-foreground mb-3 font-arabic">
                {step.title}
              </h3>
              <p className="text-muted-foreground font-arabic leading-relaxed max-w-sm mx-auto">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowWeLearnSection;
