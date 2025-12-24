import { BookOpen, Play, Gamepad2, PenTool, FileText } from "lucide-react";

const contentTypes = [
  {
    icon: BookOpen,
    title: "كتب تعليمية",
    description: "قصص وكتب تفاعلية مصوّرة بمستويات متدرّجة",
    emoji: "📘",
    color: "from-primary/20 to-pink-light",
    iconBg: "bg-primary",
  },
  {
    icon: Play,
    title: "كرتون تعليمي",
    description: "فيديوهات كرتونية ممتعة لتعلّم اللغة",
    emoji: "🎬",
    color: "from-lavender to-lavender-light",
    iconBg: "bg-accent",
  },
  {
    icon: Gamepad2,
    title: "ألعاب تعليمية",
    description: "ألعاب تفاعلية لتثبيت المفردات والقواعد",
    emoji: "🎮",
    color: "from-mint to-background",
    iconBg: "bg-mint",
  },
  {
    icon: PenTool,
    title: "تمارين تفاعلية",
    description: "تمارين وأنشطة لتطوير مهارات القراءة والكتابة",
    emoji: "✏️",
    color: "from-sunny/50 to-secondary",
    iconBg: "bg-sunny",
  },
  {
    icon: FileText,
    title: "أوراق عمل",
    description: "أوراق عمل قابلة للتحميل والطباعة",
    emoji: "📄",
    color: "from-coral/30 to-pink-light",
    iconBg: "bg-coral",
  },
];

const ContentSection = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-background to-lavender-light relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-0 w-40 h-40 bg-sunny/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-0 w-56 h-56 bg-pink-soft/15 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <span className="inline-block text-primary text-sm font-medium mb-3 font-arabic bg-pink-light/50 px-4 py-1 rounded-full">
            محتوانا التعليمي
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 font-arabic">
            محتوى <span className="text-primary">متنوّع</span> وغنيّ
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto font-arabic leading-relaxed">
            وحدات من التعلّم الممتع تدمج الكتب، الكرتون، الألعاب، التمارين التفاعلية وأوراق العمل
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {contentTypes.map((content, index) => (
            <div
              key={index}
              className="group relative bg-card rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border border-border/30 overflow-hidden"
            >
              {/* Gradient background on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${content.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              <div className="relative z-10">
                {/* Emoji decoration */}
                <span className="text-4xl mb-4 block">{content.emoji}</span>
                
                {/* Icon */}
                <div className={`w-12 h-12 ${content.iconBg} rounded-xl flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                  <content.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                
                <h3 className="text-lg font-bold text-foreground mb-2 font-arabic group-hover:text-foreground transition-colors">
                  {content.title}
                </h3>
                <p className="text-sm text-muted-foreground font-arabic leading-relaxed group-hover:text-foreground/80 transition-colors">
                  {content.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ContentSection;