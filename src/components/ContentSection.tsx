import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import contentBooks from "@/assets/content-books.png";
import contentCartoon from "@/assets/content-cartoon.png";
import contentGames from "@/assets/content-games.png";
import contentWorksheets from "@/assets/content-worksheets.png";
import robotMascot from "@/assets/robot-mascot.png";
import { useScrollAnimation, playSound } from "@/hooks/useScrollAnimation";

const contentItems = [
  {
    title: "كتب تعليمية",
    image: contentBooks,
  },
  {
    title: "كرتون تعليمي",
   
    image: contentCartoon,
  },
  {
    title: "ألعاب تعليمية",
    
    image: contentGames,
  },
  {
    title: "أوراق عمل",
    
    image: contentWorksheets,
  },
];

const arabicAlphabet = [
  "أ", "ب", "ت", "ث", "ج", "ح", "خ", "د", "ذ", "ر", "ز", "س", "ش", "ص", "ض", "ط", "ظ", "ع", "غ", "ف", "ق", "ك", "ل", "م", "ن", "هـ", "و", "ي"
];

const PhoneFrame = ({ image, title }: { image: string; title: string }) => (
  <div className="relative mx-auto w-[280px] md:w-[320px] flex-shrink-0">
    {/* Phone Frame - Horizontal */}
    <div className="relative bg-foreground rounded-[2rem] p-2 shadow-2xl">
      {/* Screen */}
      <div className="relative bg-background rounded-[1.75rem] overflow-hidden">
        {/* Notch - Moved to left side for horizontal orientation */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-20 bg-foreground rounded-r-xl z-10" />
        {/* Screen Content - Changed to horizontal aspect ratio */}
        <div className="aspect-[16/9] flex items-center justify-center p-3">
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
      </div>
    </div>
  </div>
);

const ContentSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showArrows, setShowArrows] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });

  useEffect(() => {
    if (isVisible) {
      playSound('chime');
    }
  }, [isVisible]);

  useEffect(() => {
    // Check if scrolling is needed (content overflows)
    const checkOverflow = () => {
      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        setShowArrows(container.scrollWidth > container.clientWidth);
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, []);

  const scroll = (direction: "left" | "right") => {
    playSound('pop');
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = 350; // Adjust based on your card width + gap
      
      if (direction === "right") {
        // Scroll right (shows previous content)
        container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
        // Update index based on scroll position
        const cardWidth = 350; // Approximate card width
        const newIndex = Math.max(0, Math.round(container.scrollLeft / cardWidth) - 1);
        setCurrentIndex(newIndex);
      } else {
        // Scroll left (shows next content)
        container.scrollBy({ left: scrollAmount, behavior: "smooth" });
        // Update index based on scroll position
        const cardWidth = 350; // Approximate card width
        const newIndex = Math.min(
          contentItems.length - 1, 
        );
        setCurrentIndex(newIndex);
      }
    }
  };

  useEffect(() => {
    if (scrollContainerRef.current) {
      const cardWidth = 350; // Match the scroll amount
      scrollContainerRef.current.scrollTo({
        left: currentIndex * cardWidth,
        behavior: "smooth",
      });
    }
  }, [currentIndex]);

  return (
    <section 
      id="content"
      ref={ref as React.RefObject<HTMLElement>}
      className="py-20 relative overflow-hidden bg-accent"
    >
      {/* Arabic Letters Background - More visible */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {arabicAlphabet.map((letter, index) => (
          <span
            key={index}
            className="absolute text-primary-foreground/20 font-arabic font-bold select-none"
            style={{
              fontSize: `${80 + (index % 4) * 20}px`,
              left: `${(index % 7) * 15}%`,
              top: `${Math.floor(index / 7) * 25}%`,
              transform: `rotate(${(index % 5) * 8 - 16}deg)`,
            }}
          >
            {letter}
          </span>
        ))}
        
        {/* Robot decorations */}
        <img 
          src={robotMascot} 
          alt="" 
          className="absolute top-10 left-10 w-16 h-16 opacity-40 hidden md:block"
        />
        <img 
          src={robotMascot} 
          alt="" 
          className="absolute bottom-20 right-10 w-20 h-20 opacity-40 hidden md:block"
        />
        <img 
          src={robotMascot} 
          alt="" 
          className="absolute top-1/2 left-1/4 w-12 h-12 opacity-30 hidden lg:block"
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className={`text-center mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6 font-arabic">
            محتوى <span className=" text-foreground">متنوّع</span> وغنيّ
          </h2>
          <p className="text-lg md:text-xl text-primary-foreground/80 max-w-3xl mx-auto font-arabic leading-relaxed">
            وحدات من التعلّم الممتع تدمج الكتب، الكرتون، الألعاب، التمارين التفاعلية وأوراق العمل
          </p>
        </div>

   

        {/* Horizontal Scrolling Phone Frames */}
        <div 
          ref={scrollContainerRef}
          className="flex gap-8 overflow-x-auto scrollbar-hide pb-4 px-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {contentItems.map((item, index) => (
            <div 
              key={index} 
              className={`text-center flex-shrink-0 transition-all duration-700 cursor-pointer hover:scale-105 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
              onClick={() => {
                playSound('pop');
                setCurrentIndex(index);
              }}
            >
              <PhoneFrame image={item.image} title={item.title} />
              <h3 className="text-xl md:text-2xl font-bold text-primary-foreground mt-6 mb-2 font-arabic">
                {item.title}
              </h3>
             
            </div>
          ))}
        </div>

        {/* Dots indicator */}
        <div className="flex justify-center gap-2 mt-6">
          {contentItems.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                playSound('pop');
                setCurrentIndex(index);
              }}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentIndex 
                  ? 'bg-sunny w-8' 
                  : 'bg-primary-foreground/40 hover:bg-primary-foreground/60'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ContentSection;