import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Globe } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState<"ar" | "de">("ar");

  const toggleLanguage = () => {
    setLanguage(language === "ar" ? "de" : "ar");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2">
            <span className="text-2xl">🌸</span>
            <span className="text-xl md:text-2xl font-bold text-primary font-arabic">
              بيلسان
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#"
              className="text-foreground hover:text-primary transition-colors font-arabic font-medium"
            >
              الرئيسية
            </a>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleLanguage}
              className="font-arabic gap-2 rounded-full"
            >
              <Globe className="w-4 h-4" />
              {language === "ar" ? "DE" : "عربي"}
            </Button>
            <Button
              variant="ghost"
              className="font-arabic hover:bg-primary/10"
            >
              تسجيل الدخول
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border/50">
            <div className="flex flex-col gap-4">
              <a
                href="#"
                className="text-foreground hover:text-primary transition-colors font-arabic font-medium py-2"
                onClick={() => setIsOpen(false)}
              >
                الرئيسية
              </a>
              <div className="flex flex-col gap-2 pt-4 border-t border-border/50">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleLanguage}
                  className="font-arabic gap-2 justify-center"
                >
                  <Globe className="w-4 h-4" />
                  {language === "ar" ? "Deutsch" : "عربي"}
                </Button>
                <Button
                  variant="ghost"
                  className="font-arabic justify-start"
                >
                  تسجيل الدخول
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
