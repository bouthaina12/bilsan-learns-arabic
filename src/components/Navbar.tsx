import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Globe } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { scrollToSection } from "@/hooks/useScrollAnimation";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState<"ar" | "de">("ar");
  const navigate = useNavigate();

  const toggleLanguage = () => {
    setLanguage(language === "ar" ? "de" : "ar");
  };

  const handleLogin = () => {
    navigate("/auth");
  };

  const handleNavClick = (sectionId: string) => {
    setIsOpen(false);
    scrollToSection(sectionId);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🌸</span>
            <span className="text-xl md:text-2xl font-bold text-primary font-arabic">
              بيلسان
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => handleNavClick("hero")}
              className="text-foreground hover:text-primary transition-colors font-arabic font-medium"
            >
              الرئيسية
            </button>
            
            
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            
            <Button
              variant="ghost"
              className="text-lg font-arabic px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-primary hover:bg-primary/90"
              onClick={handleLogin}
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
          <div className="md:hidden py-4 border-t border-border/50 animate-fade-in">
            <div className="flex flex-col gap-4">
              <button
                onClick={() => handleNavClick("hero")}
                className="text-foreground hover:text-primary transition-colors font-arabic font-medium py-2 text-right"
              >
                الرئيسية
              </button>
              <Link
                to="/student"
                className="text-foreground hover:text-primary transition-colors font-arabic font-medium py-2"
                onClick={() => setIsOpen(false)}
              >
                الطالب
              </Link>
             
              <div className="flex flex-col gap-2 pt-4 border-t border-border/50">
               
                <Button
                  variant="ghost"
                  className="text-lg font-arabic px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-primary hover:bg-primary/90"
                  onClick={handleLogin}
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
