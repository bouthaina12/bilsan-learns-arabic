import { Heart, Mail, Phone, MapPin } from "lucide-react";
import { scrollToSection } from "@/hooks/useScrollAnimation";
import { Link, useNavigate } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();

  const handleScrollLink = (sectionId: string) => {
    // If on homepage, scroll directly
    if (window.location.pathname === '/') {
      scrollToSection(sectionId);
    } else {
      // Navigate to home then scroll
      navigate('/');
      setTimeout(() => {
        scrollToSection(sectionId);
      }, 100);
    }
  };

  const links = {
    main: [
      { label: "الصفحة الرئيسية", sectionId: "hero" },
      { label: "عن بيلسان", sectionId: "about" },
      { label: "المحتوى التعليمي", sectionId: "content" },
      { label: "كيف نتعلم", sectionId: "how-we-learn" },
    ],
    resources: [
      { label: "الكتب التعليمية", sectionId: "content" },
      { label: "الألعاب", sectionId: "content" },
      { label: "أوراق العمل", sectionId: "content" },
      { label: "الفيديوهات", sectionId: "features" },
    ],
  };

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <h3 className="text-2xl font-bold text-primary font-arabic mb-4">
              سلسلة بيلسان
            </h3>
            <p className="text-muted-foreground font-arabic leading-relaxed mb-6">
              منصة تعليمية ممتعة للأطفال العرب في ألمانيا وأوروبا، نساعد أطفالكم على تعلّم اللغة العربية بطريقة تفاعلية وجذّابة.
            </p>
            <div className="flex gap-3">
              {["facebook", "instagram", "youtube", "twitter"].map((social) => (
                <a
                  key={social}
                  href={`#${social}`}
                  className="w-10 h-10 bg-muted rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors duration-300"
                  aria-label={social}
                >
                  <span className="sr-only">{social}</span>
                  <div className="w-4 h-4 bg-current rounded-sm opacity-70" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-lg font-bold text-foreground font-arabic mb-4">
              روابط سريعة
            </h4>
            <ul className="space-y-3">
              {links.main.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => handleScrollLink(link.sectionId)}
                    className="text-muted-foreground hover:text-primary transition-colors font-arabic text-right"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
              <li>
                <Link
                  to="/auth"
                  className="text-muted-foreground hover:text-primary transition-colors font-arabic"
                >
                  تسجيل الدخول
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold text-foreground font-arabic mb-4">
              المحتوى
            </h4>
            <ul className="space-y-3">
              {links.resources.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => handleScrollLink(link.sectionId)}
                    className="text-muted-foreground hover:text-primary transition-colors font-arabic text-right"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-bold text-foreground font-arabic mb-4">
              تواصل معنا
            </h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                <a
                  href="mailto:info@bilsan.de"
                  className="text-muted-foreground hover:text-primary transition-colors font-arabic"
                >
                  info@bilsan.de
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-muted-foreground font-arabic" dir="ltr">
                  +49 123 456 789
                </span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground font-arabic">
                  ألمانيا
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-muted-foreground font-arabic text-sm">
              جميع الحقوق محفوظة © {currentYear} سلسلة بيلسان التعليمية
            </p>
            <p className="text-muted-foreground font-arabic text-sm flex items-center gap-1">
              صُنع بـ <Heart className="w-4 h-4 text-primary fill-primary" /> للأطفال العرب
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;