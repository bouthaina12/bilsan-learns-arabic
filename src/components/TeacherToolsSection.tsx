import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import teacherCalendar from "@/assets/teacher-calendar.png";
import teacherReports from "@/assets/teacher-reports.png";
import robotMascot from "@/assets/robot-mascot.png";
import { useScrollAnimation, playSound } from "@/hooks/useScrollAnimation";

const teacherTools = [
  {
    title: "متابعة قراءة الصفوف",
    description: "متابعة تقدّم الصفوف بسهولة.",
    image: teacherCalendar,
  },
  {
    title: "تقارير لرؤية شاملة",
    description: "تعرض تقارير التفعيل والتقدّم على مستوى المدرسة والمرحلة",
    image: teacherReports,
  },
  {
    title: "إدارة الطلاب",
    description: "أضف وأدر طلابك بسهولة مع تتبع التقدم الفردي.",
    image: teacherCalendar,
  },
  {
    title: "المكتبة الرقمية",
    description: "وصول كامل لجميع الموارد التعليمية.",
    image: teacherReports,
  },
];

const TeacherToolsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });

  useEffect(() => {
    if (isVisible) {
      playSound('whoosh');
    }
  }, [isVisible]);

  const scroll = (direction: "left" | "right") => {
    playSound('pop');
    if (direction === "left") {
      setCurrentIndex((prev) => Math.max(0, prev - 1));
    } else {
      setCurrentIndex((prev) => Math.min(teacherTools.length - 2, prev + 1));
    }
  };

  useEffect(() => {
    if (scrollContainerRef.current) {
      const cardWidth = 520;
      scrollContainerRef.current.scrollTo({
        left: currentIndex * cardWidth,
        behavior: "smooth",
      });
    }
  }, [currentIndex]);

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className="py-20 bg-gradient-to-b from-mint/30 to-mint/50 relative overflow-hidden"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src={robotMascot}
          alt=""
          className="absolute top-10 left-10 w-16 h-16 opacity-20 hidden md:block"
        />
        <img
          src={robotMascot}
          alt=""
          className="absolute bottom-20 right-20 w-20 h-20 opacity-25 hidden md:block"
        />
        {["أ", "ب", "ت", "ث", "ج", "ح"].map((letter, i) => (
          <span
            key={i}
            className="absolute text-accent/10 font-arabic font-bold select-none hidden lg:block"
            style={{
              fontSize: `${60 + i * 10}px`,
              left: `${5 + i * 15}%`,
              top: `${15 + (i % 2) * 50}%`,
              transform: `rotate(${i * 5 - 10}deg)`,
            }}
          >
            {letter}
          </span>
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header with navigation arrows */}
        <div
          className={`flex items-center justify-between mb-12 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="flex gap-3">
            <Button
              onClick={() => scroll("right")}
              variant="default"
              size="icon"
              className="w-12 h-12 rounded-full bg-coral hover:bg-coral/90 text-primary-foreground"
              disabled={currentIndex === 0}
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
            <Button
              onClick={() => scroll("left")}
              variant="default"
              size="icon"
              className="w-12 h-12 rounded-full bg-coral hover:bg-coral/90 text-primary-foreground"
              disabled={currentIndex >= teacherTools.length - 2}
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
          </div>

          <div className="text-right">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground font-arabic">
              أدوات <span className="text-sunny">المعلّم</span>
            </h2>
            <p className="text-muted-foreground mt-2 font-arabic max-w-xl">
              توفّر لك كمعلم الموارد والمعلومات والأدوات لتوفّر وقتك ومجهودك
              وتساعدك على التركيز على مساعدة طلابك في النجاح.
            </p>
          </div>
        </div>

        {/* Tools Carousel */}
        <div
          ref={scrollContainerRef}
          className="flex gap-8 overflow-x-auto scrollbar-hide pb-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {teacherTools.map((tool, index) => (
            <div
              key={index}
              className={`flex-shrink-0 w-[480px] transition-all duration-700 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              {/* Card */}
              <div className="bg-card rounded-3xl p-6 shadow-lg border border-border/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <h3 className="text-xl font-bold text-foreground mb-2 font-arabic text-right">
                  {tool.title}
                </h3>
                <p className="text-muted-foreground font-arabic text-right mb-6">
                  {tool.description}
                </p>

                {/* Laptop Frame */}
                <div className="relative">
                  <div className="bg-foreground rounded-t-xl pt-2 px-2">
                    <div className="bg-card rounded-t-lg overflow-hidden">
                      <img
                        src={tool.image}
                        alt={tool.title}
                        className="w-full h-auto"
                      />
                    </div>
                  </div>
                  <div className="bg-foreground h-4 rounded-b-lg mx-8" />
                  <div className="bg-muted h-2 rounded-b-xl mx-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeacherToolsSection;
