import contentBooks from "@/assets/content-books.png";
import contentCartoon from "@/assets/content-cartoon.png";
import contentGames from "@/assets/content-games.png";
import contentWorksheets from "@/assets/content-worksheets.png";
import robotMascot from "@/assets/robot-mascot.png";

const contentItems = [
  {
    title: "كتب تعليمية",
    description: "قصص وكتب تفاعلية مصوّرة بمستويات متدرّجة",
    image: contentBooks,
  },
  {
    title: "كرتون تعليمي",
    description: "فيديوهات كرتونية ممتعة لتعلّم اللغة",
    image: contentCartoon,
  },
  {
    title: "ألعاب تعليمية",
    description: "ألعاب تفاعلية لتثبيت المفردات والقواعد",
    image: contentGames,
  },
  {
    title: "أوراق عمل",
    description: "أوراق عمل قابلة للتحميل والطباعة",
    image: contentWorksheets,
  },
];

const arabicLetters = ["أ", "ب", "ت", "ث", "ج", "ح", "خ", "د", "ذ", "ر", "ز", "س", "ش", "ص", "ض", "ط", "ظ", "ع", "غ", "ف", "ق", "ك", "ل", "م", "ن", "هـ", "و", "ي"];

const PhoneFrame = ({ image, title }: { image: string; title: string }) => (
  <div className="relative mx-auto w-[280px] md:w-[320px]">
    {/* Phone Frame */}
    <div className="relative bg-foreground rounded-[2.5rem] p-2 shadow-2xl">
      {/* Screen */}
      <div className="relative bg-background rounded-[2rem] overflow-hidden">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-foreground rounded-b-2xl z-10" />
        {/* Screen Content */}
        <div className="aspect-[9/16] flex items-center justify-center p-4">
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover rounded-xl"
          />
        </div>
      </div>
    </div>
  </div>
);

const ContentSection = () => {
  return (
    <section className="py-20 relative overflow-hidden bg-accent">
      {/* Arabic Letters Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {arabicLetters.map((letter, index) => (
          <span
            key={index}
            className="absolute text-primary-foreground/10 font-arabic font-bold select-none"
            style={{
              fontSize: `${Math.random() * 60 + 40}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              transform: `rotate(${Math.random() * 30 - 15}deg)`,
            }}
          >
            {letter}
          </span>
        ))}
        
        {/* Robot decorations */}
        <img 
          src={robotMascot} 
          alt="" 
          className="absolute top-10 left-10 w-16 h-16 opacity-30 hidden md:block"
        />
        <img 
          src={robotMascot} 
          alt="" 
          className="absolute bottom-20 right-10 w-20 h-20 opacity-30 hidden md:block"
        />
        <img 
          src={robotMascot} 
          alt="" 
          className="absolute top-1/2 left-1/4 w-12 h-12 opacity-20 hidden lg:block"
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6 font-arabic">
            محتوى <span className="text-sunny">متنوّع</span> وغنيّ
          </h2>
          <p className="text-lg md:text-xl text-primary-foreground/80 max-w-3xl mx-auto font-arabic leading-relaxed">
            وحدات من التعلّم الممتع تدمج الكتب، الكرتون، الألعاب، التمارين التفاعلية وأوراق العمل
          </p>
        </div>

        {/* Content Grid with Phone Frames */}
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 max-w-5xl mx-auto">
          {contentItems.map((item, index) => (
            <div key={index} className="text-center">
              <PhoneFrame image={item.image} title={item.title} />
              <h3 className="text-xl md:text-2xl font-bold text-primary-foreground mt-6 mb-2 font-arabic">
                {item.title}
              </h3>
              <p className="text-primary-foreground/80 font-arabic">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ContentSection;
