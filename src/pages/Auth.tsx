import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { User, Lock, Mail, Phone, ArrowRight, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import loginMascot from "@/assets/login-mascot.png";

type UserType = "teacher" | "student";
type AuthMode = "login" | "signup";

const Auth = () => {
  const [userType, setUserType] = useState<UserType>("student");
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    fullName: "",
    phone: "",
    school: "",
    grade: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Navigate to appropriate dashboard based on user type
    if (userType === "teacher") {
      navigate("/teacher-dashboard");
    } else {
      navigate("/student-dashboard");
    }
  };

  const isTeacher = userType === "teacher";

  return (
    <div className="min-h-screen flex font-arabic" dir="rtl">
      {/* Back to website link */}
      <div className="fixed top-4 left-4 z-50">
        <Link
          to="/"
          className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
        >
          <ArrowRight className="w-4 h-4 rotate-180" />
          <span>Back To Website</span>
        </Link>
      </div>
      <div className="fixed top-4 right-4 z-50">
        <Link
          to="/"
          className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
        >
          <span>عودة إلى الموقع</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Left Side - Mascot */}
      <div
        className={`hidden lg:flex w-1/2 flex-col items-center justify-center p-12 transition-colors duration-500 relative overflow-hidden ${
          isTeacher
            ? "bg-gradient-to-br from-accent to-accent/80"
            : "bg-gradient-to-br from-primary to-primary/80"
        }`}
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          {["📚", "✏️", "🎓", "📖", "🎨", "🎯"].map((emoji, i) => (
            <span
              key={i}
              className="absolute text-4xl"
              style={{
                left: `${10 + (i % 3) * 30}%`,
                top: `${10 + Math.floor(i / 3) * 40}%`,
                transform: `rotate(${i * 15}deg)`,
              }}
            >
              {emoji}
            </span>
          ))}
        </div>

        <h1 className="text-4xl font-bold text-primary-foreground mb-8 text-center relative z-10">
          Let's get started !
        </h1>

        <div className="relative z-10 max-w-sm">
          <img
            src={loginMascot}
            alt="Bilsan Mascot"
            className="w-full h-auto drop-shadow-2xl animate-float"
          />
        </div>

        <p className="text-primary-foreground/80 mt-8 text-center relative z-10">
          Download Bilsan on your phone or tablet
        </p>
        <div className="flex gap-4 mt-4 relative z-10">
          <Button
            variant="outline"
            className="bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20"
          >
            🍎 Apple Store
          </Button>
          <Button
            variant="outline"
            className="bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20"
          >
            ▶️ Play Store
          </Button>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* User Type Tabs */}
          <div className="flex mb-8 border-b-2 border-border">
            <button
              onClick={() => setUserType("teacher")}
              className={`flex-1 py-3 text-lg font-medium transition-all relative ${
                isTeacher
                  ? "text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Teacher
              {isTeacher && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-accent rounded-t-full" />
              )}
            </button>
            <button
              onClick={() => setUserType("student")}
              className={`flex-1 py-3 text-lg font-medium transition-all relative ${
                !isTeacher
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Student
              {!isTeacher && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />
              )}
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {authMode === "signup" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-right block">
                    الاسم الكامل:
                  </Label>
                  <div className="relative">
                    <Input
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="أدخل اسمك الكامل"
                      className="pr-10 text-right rounded-full border-border"
                    />
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-right block">
                    البريد الإلكتروني:
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="أدخل بريدك الإلكتروني"
                      className="pr-10 text-right rounded-full border-border"
                    />
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-right block">
                    رقم الهاتف:
                  </Label>
                  <div className="relative">
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="أدخل رقم هاتفك"
                      className="pr-10 text-right rounded-full border-border"
                      dir="ltr"
                    />
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  </div>
                </div>

                {isTeacher && (
                  <div className="space-y-2">
                    <Label htmlFor="school" className="text-right block">
                      اسم المدرسة:
                    </Label>
                    <div className="relative">
                      <Input
                        id="school"
                        name="school"
                        value={formData.school}
                        onChange={handleInputChange}
                        placeholder="أدخل اسم المدرسة"
                        className="pr-10 text-right rounded-full border-border"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        🏫
                      </span>
                    </div>
                  </div>
                )}

                {!isTeacher && (
                  <div className="space-y-2">
                    <Label htmlFor="grade" className="text-right block">
                      الصف الدراسي:
                    </Label>
                    <div className="relative">
                      <Input
                        id="grade"
                        name="grade"
                        value={formData.grade}
                        onChange={handleInputChange}
                        placeholder="أدخل صفك الدراسي"
                        className="pr-10 text-right rounded-full border-border"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        📚
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="username" className="text-right block">
                اسم المستخدم:
              </Label>
              <div className="relative">
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Type your username"
                  className="pr-10 text-right rounded-full border-border"
                />
                <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-right block">
                كلمة المرور:
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Type your password"
                  className="pr-10 pl-10 text-right rounded-full border-border"
                />
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {authMode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-right block">
                  تأكيد كلمة المرور:
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="أعد كتابة كلمة المرور"
                    className="pr-10 text-right rounded-full border-border"
                  />
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                </div>
              </div>
            )}

            <Button
              type="submit"
              className={`w-full rounded-full py-6 text-lg font-medium transition-all duration-300 ${
                isTeacher
                  ? "bg-accent hover:bg-accent/90 text-accent-foreground"
                  : "bg-primary hover:bg-primary/90"
              }`}
            >
              {authMode === "login" ? "Login - دخول" : "Sign Up - تسجيل"}
            </Button>

            {authMode === "login" && (
              <div className="flex items-center justify-between text-sm">
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Forgot login credentials
                </a>
                <div className="flex items-center gap-2">
                  <Checkbox id="remember" />
                  <label htmlFor="remember" className="text-muted-foreground">
                    Remember Me
                  </label>
                </div>
              </div>
            )}

            <div className="text-center pt-4">
              {authMode === "login" ? (
                <button
                  type="button"
                  onClick={() => setAuthMode("signup")}
                  className={`text-sm ${
                    isTeacher ? "text-accent" : "text-primary"
                  } hover:underline`}
                >
                  Don't have an account? - ليس لديك حساب؟
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setAuthMode("login")}
                  className={`text-sm ${
                    isTeacher ? "text-accent" : "text-primary"
                  } hover:underline`}
                >
                  Already have an account? - لديك حساب بالفعل؟
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;
