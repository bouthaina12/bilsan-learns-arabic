import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { User, Lock, Mail, Phone, ArrowRight, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import bilsan from "@/assets/bilsan.png";

type AuthMode = "login" | "signup";

const Auth = () => {
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    phone: "",
    level: "beginner",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = "اسم المستخدم مطلوب";
    }

    if (!formData.password) {
      newErrors.password = "كلمة المرور مطلوبة";
    } else if (formData.password.length < 6) {
      newErrors.password = "كلمة المرور يجب أن تكون 6 أحرف على الأقل";
    }

    if (authMode === "signup") {
      if (!formData.email.trim()) {
        newErrors.email = "البريد الإلكتروني مطلوب";
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "البريد الإلكتروني غير صحيح";
      }

      if (!formData.phone.trim()) {
        newErrors.phone = "رقم الهاتف مطلوب";
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "كلمة المرور وتأكيدها غير متطابقين";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    const endpoint = authMode === "signup" 
      ? "/api/auth/signup.php"
      : "/api/auth/login.php";

    const payload: any = {
      username: formData.username,
      password: formData.password,
      userType: "student", // Always student
    };

    if (authMode === "signup") {
      payload.email = formData.email;
      payload.phone = formData.phone;
      payload.level = formData.level;
      payload.confirmPassword = formData.confirmPassword;
    }

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload),
        credentials: 'include' // Important for sessions
      });

      const data = await res.json();

      if (!res.ok) {
        // Handle PHP errors
        if (data.error) {
          setErrors({ submit: data.error });
        } else {
          setErrors({ submit: "حدث خطأ ما" });
        }
        return;
      }

      // Success handling
      if (authMode === "signup") {
        alert("تم التسجيل بنجاح! يمكنك الآن تسجيل الدخول");
        setAuthMode("login");
        setFormData({
          username: "",
          password: "",
          email: "",
          phone: "",
          level: "beginner",
          confirmPassword: "",
        });
      } else {
        // Login successful
        
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Redirect to student dashboard
        navigate("/student-dashboard");
      }
    } catch (error) {
      console.error("Error:", error);
      setErrors({ submit: "خطأ في الاتصال بالخادم" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-arabic" dir="rtl">
      {/* رابط العودة للموقع */}
      <div className="fixed top-4 right-4 z-50">
        <Link
          to="/"
          className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
        >
          <span>العودة إلى الموقع</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* الجانب الأيسر - التميمة */}
      <div
        className={`hidden lg:flex w-1/2 flex-col items-center justify-center p-12 transition-colors duration-500 relative overflow-hidden bg-gradient-to-br from-primary to-primary/80`}
      >
        {/* النمط الخلفي */}
        <div className="absolute inset-0 opacity-80">
          {["📚", "🎓", "📖", "🎨", "🎯", "✨", "⭐", "🌟","📖", "🎨", "🎯", "✨", "⭐", "🌟"].map((emoji, i) => (
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

       

        <div className="relative z-10 max-w-sm">
          <img
            src={bilsan}
            alt="تميمة بيلسان"
            className="w-full h-auto drop-shadow-2xl animate-float"
          />
        </div>

       
      </div>

      {/* الجانب الأيمن - النموذج */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* عنوان الطالب */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-primary/10 to-primary/5 rounded-full">
              <span className="text-2xl">🎓</span>
              <h2 className="text-2xl font-bold text-primary">منصة الطالب التعليمية</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              سجل الدخول للوصول إلى جميع الأدوات التعليمية
            </p>
          </div>

          {/* Error message */}
          {errors.submit && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {errors.submit}
            </div>
          )}

          {/* النموذج */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {authMode === "signup" && (
              <>
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
                      className={`pr-10 text-right rounded-full border-border ${errors.email ? 'border-red-500' : ''}`}
                      disabled={isLoading}
                    />
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
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
                      className={`pr-10 text-right rounded-full border-border ${errors.phone ? 'border-red-500' : ''}`}
                      dir="ltr"
                      disabled={isLoading}
                    />
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  </div>
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level" className="text-right block">
                    المستوى التعليمي:
                  </Label>
                  <div className="relative">
                    <select
                      id="level"
                      name="level"
                      value={formData.level}
                      onChange={handleInputChange}
                      className="w-full pr-10 pl-3 text-right rounded-full border-border h-10 px-3 py-2 border bg-background"
                      disabled={isLoading}
                    >
                      <option value="beginner">مبتدئ</option>
                      <option value="medium">متوسط</option>
                      <option value="advanced">متقدم</option>
                    </select>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      📚
                    </span>
                  </div>
                </div>
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
                  placeholder="أدخل اسم المستخدم"
                  className={`pr-10 text-right rounded-full border-border ${errors.username ? 'border-red-500' : ''}`}
                  disabled={isLoading}
                />
                <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              </div>
              {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
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
                  placeholder="أدخل كلمة المرور"
                  className={`pr-10 pl-10 text-right rounded-full border-border ${errors.password ? 'border-red-500' : ''}`}
                  disabled={isLoading}
                />
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
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
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="أعد كتابة كلمة المرور"
                    className={`pr-10 text-right rounded-full border-border ${errors.confirmPassword ? 'border-red-500' : ''}`}
                    disabled={isLoading}
                  />
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>
            )}

            <Button
              type="submit"
              className="w-full rounded-full py-6 text-lg font-medium transition-all duration-300 bg-primary hover:bg-primary/90 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  جاري المعالجة...
                </span>
              ) : authMode === "login" ? "تسجيل الدخول" : "إنشاء حساب جديد"}
            </Button>

            {authMode === "login" && (
              <div className="flex items-center justify-between text-sm">
                <a
                  href="/forgot-password"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  نسيت كلمة المرور؟
                </a>
                <div className="flex items-center gap-2">
                  <Checkbox id="remember" />
                  <label htmlFor="remember" className="text-muted-foreground">
                    تذكرني
                  </label>
                </div>
              </div>
            )}

            <div className="text-center pt-4">
              {authMode === "login" ? (
                <button
                  type="button"
                  onClick={() => setAuthMode("signup")}
                  className="text-sm text-primary hover:underline"
                  disabled={isLoading}
                >
                  ليس لديك حساب؟ سجل الآن
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setAuthMode("login")}
                  className="text-sm text-primary hover:underline"
                  disabled={isLoading}
                >
                  لديك حساب بالفعل؟ سجل الدخول
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