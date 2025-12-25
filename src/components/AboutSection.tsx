import { BookOpen, Heart, Globe, Sparkles } from "lucide-react";
import { useEffect } from "react";
import { useScrollAnimation, playSound } from "@/hooks/useScrollAnimation";

const features = [
  {
    icon: BookOpen,
    title: "تعلّم منظّم وممتع",
    description: "منهج تعليمي مصمّم خصيصًا للأطفال العرب في ألمانيا، يجمع بين المتعة والتعلّم",
    color: "bg-pink-light text-primary",
  },
  {
    icon: Globe,
    title: "للأطفال في الخارج",
    description: "نفهم تحديات تعلّم العربية بعيدًا عن الوطن، ونوفّر الحلول المناسبة",
    color: "bg-lavender text-accent-foreground",
  },
  {
    icon: Heart,
    title: "اللعب والقصص",
    description: "نعتمد على الألعاب التفاعلية والقصص المشوّقة لترسيخ اللغة بطريقة طبيعية",
    color: "bg-secondary text-secondary-foreground",
  },
  {
    icon: Sparkles,
    title: "محتوى مرئي جذّاب",
    description: "رسومات ملوّنة وشخصيات محبوبة تجعل التعلّم مغامرة يومية",
    color: "bg-mint text-foreground",
  },
];

const AboutSection = () => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });

  useEffect(() => {
    if (isVisible) {
      playSound('whoosh');
    }
  }, [isVisible]);

  return (
    <section 
      id="about" 
      ref={ref as React.RefObject<HTMLElement>}
      className="py-20 bg-card relative overflow-hidden"
    >
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-64 h-64 bg-pink-light/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-lavender/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <span className="inline-block text-primary text-sm font-medium mb-3 font-arabic bg-pink-light/50 px-4 py-1 rounded-full">
            عن منصتنا
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 font-arabic">
            لماذا <span className="text-primary">بيلسان</span>؟
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto font-arabic leading-relaxed">
            منصة بيلسان التعليمية تقدّم تجربة فريدة لتعلّم اللغة العربية، 
            مصمّمة بحب للأطفال العرب المقيمين في ألمانيا وأوروبا
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`group bg-background rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-500 hover:-translate-y-1 border border-border/50 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3 font-arabic">
                {feature.title}
              </h3>
              <p className="text-muted-foreground font-arabic leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;