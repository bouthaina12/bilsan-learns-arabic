import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Mail, Eye, EyeOff, ArrowRight, Shield } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import bilsan from "@/assets/bilsan.png";

const ForgetPassword = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = "البريد الإلكتروني مطلوب";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "البريد الإلكتروني غير صحيح";
    }
    
    // Validate new password
    if (!formData.newPassword) {
      newErrors.newPassword = "كلمة المرور الجديدة مطلوبة";
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = "كلمة المرور يجب أن تكون 6 أحرف على الأقل";
    }
    
    // Validate confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "تأكيد كلمة المرور مطلوب";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "كلمة المرور وتأكيدها غير متطابقين";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/forgot-password.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          new_password: formData.newPassword
        })
      });

      const result = await response.json();

      if (result.success) {
        setIsSubmitted(true);
        // Show success message
        setTimeout(() => {
          navigate("/auth");
        }, 3000);
      } else {
        setErrors({ submit: result.error || "حدث خطأ في تغيير كلمة المرور" });
      }
    } catch (error) {
      console.error('Error:', error);
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
      <div className="hidden lg:flex w-1/2 flex-col items-center justify-center p-12 relative overflow-hidden bg-gradient-to-br from-primary to-primary/80">
        {/* النمط الخلفي */}
        <div className="absolute inset-0 opacity-10">
          {["🔒", "🔑", "📧", "✅", "🔐", "🎯"].map((emoji, i) => (
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

        <div className="mt-8 text-center text-primary-foreground/90 relative z-10 max-w-lg">
          <h2 className="text-3xl font-bold mb-4">🔐 استعادة كلمة المرور</h2>
          <p className="text-lg">
            أدخل بريدك الإلكتروني وكلمة المرور الجديدة
          </p>
        </div>
      </div>

      {/* الجانب الأيمن - النموذج */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* عنوان الصفحة */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-primary/10 to-primary/5 rounded-full mb-4">
              <Shield className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold text-primary">استعادة كلمة المرور</h2>
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-300">
              {isSubmitted 
                ? "✅ تم تغيير كلمة المرور بنجاح! سيتم تحويلك إلى صفحة تسجيل الدخول..."
                : "أدخل بريدك الإلكتروني وكلمة المرور الجديدة لتغيير كلمة المرور"
              }
            </div>
          </div>

          {/* Success message */}
          {isSubmitted ? (
            <div className="text-center space-y-6">
              <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-green-800 dark:text-green-300 mb-2">
                  تم تغيير كلمة المرور بنجاح!
                </h3>
                <p className="text-green-700 dark:text-green-400">
                  تم تغيير كلمة المرور الخاصة بحسابك بنجاح.
                  <br />
                  يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة.
                </p>
              </div>
              
              <div className="pt-4">
                <Button
                  onClick={() => navigate("/")}
                  className="w-full rounded-full py-6 text-lg font-medium transition-all duration-300 bg-primary hover:bg-primary/90"
                >
                  <ArrowRight className="w-5 h-5 ml-2" />
                  الذهاب لتسجيل الدخول
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Error message */}
              {errors.submit && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                  {errors.submit}
                </div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-right block">
                    البريد الإلكتروني المسجل:
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="أدخل بريدك الإلكتروني المسجل"
                      className={`pr-10 text-right rounded-full border-border ${errors.email ? 'border-red-500' : ''}`}
                      disabled={isLoading}
                      required
                    />
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                {/* New Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-right block">
                    كلمة المرور الجديدة:
                  </Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type={showPassword ? "text" : "password"}
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      placeholder="أدخل كلمة المرور الجديدة"
                      className={`pr-10 pl-10 text-right rounded-full border-border ${errors.newPassword ? 'border-red-500' : ''}`}
                      disabled={isLoading}
                      required
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
                  {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword}</p>}
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-right block">
                    تأكيد كلمة المرور الجديدة:
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="أعد كتابة كلمة المرور الجديدة"
                      className={`pr-10 pl-10 text-right rounded-full border-border ${errors.confirmPassword ? 'border-red-500' : ''}`}
                      disabled={isLoading}
                      required
                    />
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                </div>

               

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full rounded-full py-6 text-lg font-medium transition-all duration-300 bg-primary hover:bg-primary/90"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      جاري تغيير كلمة المرور...
                    </span>
                  ) : (
                    <>
                      <Shield className="w-5 h-5 ml-2" />
                      تغيير كلمة المرور
                    </>
                  )}
                </Button>

                {/* Back to auth Link */}
                <div className="text-center pt-4">
                  <Link
                    to="/auth"
                    className="text-sm text-primary hover:underline flex items-center justify-center gap-1"
                  >
                    <ArrowRight className="w-4 h-4" />
                    العودة لتسجيل الدخول
                  </Link>
                </div>
              </form>

              {/* Security Tips */}
             
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgetPassword;