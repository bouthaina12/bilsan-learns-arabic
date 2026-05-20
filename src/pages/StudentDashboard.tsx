import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, 
  Gamepad2, 
  FileText, 
  Trophy,
  Sprout,
  Star,
  TrendingUp,
  Clock,
  Users,
  Award,
  Crown,
  TrendingDown
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { playSound } from "@/hooks/useScrollAnimation";

const StudentDashboard = () => {
  const [studentsRanking, setStudentsRanking] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasFetched = useRef(false); // لمنع التحميل المتكرر

  // Get user data directly from localStorage
  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;

  // Fetch students ranking
  const fetchStudentsRanking = async () => {
        playSound('click');

    if (hasFetched.current) return; // منع التحميل المتكرر
    
    try {
      setIsLoading(true);
      setError(null);
      hasFetched.current = true;
      
      console.log('Fetching ranking...');
      
      const response = await fetch('/api/ranking.php', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      console.log('Response status:', response.status);
      
      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error('Non-JSON response:', text.substring(0, 200));
        throw new Error('الاستجابة ليست بصيغة JSON');
      }
      
      const data = await response.json();
      console.log('Fetched data:', data);
      
      if (data.success) {
        setStudentsRanking(data.students || []);
      } else {
        setError(data.error || 'حدث خطأ في تحميل التصنيف');
        setStudentsRanking([]);
      }
    } catch (error) {
      console.error('Error fetching students ranking:', error.message);
      setError(error.message || 'فشل تحميل بيانات التصنيف');
      setStudentsRanking([]);
      hasFetched.current = false; // السماح بمحاولة أخرى في حالة الخطأ
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch on component mount only once
  useEffect(() => {
    if (!user || user.user_type !== 'student') return;
    
    fetchStudentsRanking();
    
    // Cleanup function
    return () => {
      hasFetched.current = false;
    };
    
  }, []); // Empty dependency array - fetch only once on mount

  // Redirect if no user
  useEffect(() => {
    if (!user) {
      window.location.href = '/login';
    }
  }, [user]);

  const stats = [
    { 
      title: "إجمالي النقاط", 
      value: user?.score || "0", 
      icon: Trophy, 
      color: "bg-amber-100 text-amber-700" 
    },
    { 
      title: "الدروس المكتملة", 
      value: "12", 
      icon: BookOpen, 
      color: "bg-pink-100 text-pink-700" 
    },
    { 
      title: "القصص المقروءة", 
      value: "8", 
      icon: Gamepad2, 
      color: "bg-indigo-100 text-indigo-700" 
    },
    { 
      title: " المسابقات", 
      value: "8",  
      icon: Award, 
      color: "bg-green-100 text-green-700" 
    },
  ];

  const getUserRank = () => {
    if (!user || !studentsRanking.length) return 0;
    
    const userIndex = studentsRanking.findIndex(s => s.id === user.id);
    return userIndex !== -1 ? userIndex + 1 : 0;
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-amber-50 to-pink-50 font-arabic" dir="rtl">
        <DashboardSidebar 
          userType="student" 
          userName={user?.username}
          
          progress={65} 
        />
        
        <main className="flex-1 overflow-auto">
          <header className="h-14 sm:h-16 border-b border-border flex items-center px-4 sm:px-6 bg-card">
            <SidebarTrigger className="ml-4" />
            <h1 className="text-xl sm:text-2xl font-bold text-primary">لوحة التحكم</h1>
          </header>

          <div className="p-4 sm:p-6">
            {/* Welcome Banner */}
            <div className="mb-8 bg-gradient-to-l from-pink-100 to-pink-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-4 sm:p-6 border border-pink-200 dark:border-gray-600">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-4 flex-1">
                  <div className="text-3xl sm:text-4xl flex-shrink-0">👋</div>
                  <div className="flex-1">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-1 sm:mb-2">
                      مرحباً {user?.username}
                    </h2>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                      لديك {user?.score || 0} نقطة - استمر في التعلم لتزيد نقاطك! 🌟
                    </p>
                  </div>
                </div>
                
                {/* User Rank Badge - Show only if we have ranking data */}
                {studentsRanking.length > 0 && (
                  <div className={`px-3 sm:px-4 py-2 rounded-full font-bold text-sm sm:text-base whitespace-nowrap flex-shrink-0 ${
                    getUserRank() === 1 ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white' :
                    getUserRank() <= 3 ? 'bg-gradient-to-r from-blue-400 to-indigo-500 text-white' :
                    'bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700'
                  }`}>
                    {getUserRank() === 1 ? (
                      <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>المركز الأول</span>
                      </div>
                    ) : getUserRank() > 0 ? (
                      <span>المركز {getUserRank()}</span>
                    ) : (
                      <span>ليس في التصنيف</span>
                    )}
                  </div>
                )}
              </div>
            </div>

           

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Students Ranking */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            🏅 المتصدرون هذا الأسبوع
       </CardTitle>
       
                </CardHeader>
                <CardContent>
                   <p className="text-gray-700 dark:text-gray-300 mb-2">
            💪 شارك في التحدي وانضم إلى القائمة!
          </p>
                  {isLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
                      <p className="text-muted-foreground">جاري تحميل التصنيف...</p>
                    </div>
                  ) : error ? (
                    <div className="text-center py-8">
                      <div className="text-red-500 mb-3">
                        <p className="font-medium">حدث خطأ: {error}</p>
                        <p className="text-sm mt-2">تأكد من أن خادم API يعمل</p>
                      </div>
                      <button 
                        onClick={fetchStudentsRanking}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                      >
                        حاول مرة أخرى
                      </button>
                    </div>
                  ) : studentsRanking.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">لا توجد بيانات تصنيف متاحة</p>
                      <button 
                        onClick={fetchStudentsRanking}
                        className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                      >
                        تحديث
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3">
                        {studentsRanking.slice(0, 10).map((student, index) => (
                          <div 
                            key={student.id} 
                            className={`flex items-center gap-4 p-3 rounded-xl transition-all ${
                              student.id === user?.id 
                                ? 'bg-gradient-to-r from-pink-50 to-pink-50 border border-pink-200' 
                                : 'hover:bg-muted/50'
                            }`}
                          >
                            {/* Rank Badge */}
                            <div className={`w-8 h-8 flex-shrink-0 rounded-lg flex items-center justify-center font-bold ${
                              index === 0 ? 'bg-yellow-100 text-yellow-700' :
                              index === 1 ? 'bg-gray-100 text-gray-700' :
                              index === 2 ? 'bg-amber-100 text-amber-700' :
                              'bg-gray-100 text-gray-500'
                            }`}>
                              {index === 0 ? (
                                <Crown className="w-4 h-4" />
                              ) : (
                                index + 1
                              )}
                            </div>

                            {/* Student Info */}
                            <div className="flex-1">
                              <div className="flex justify-between items-center">
                                <span className={`font-medium ${
                                  student.id === user?.id ? 'text-pink-700 font-bold' : 'text-foreground'
                                }`}>
                                  {student.username}
                                </span>
                                <div className="flex items-center gap-2">
                                  <Trophy className="w-4 h-4 text-amber-500" />
                                  <span className="font-bold text-amber-600">{student.score}</span>
                                </div>
                              </div>
                              
                              <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                                <span>{student.level === 'beginner' ? 'مبتدئ' : 
                                       student.level === 'medium' ? 'متوسط' : 'متقدم'}</span>
                                <span>طالب</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* View All Link */}
                      {studentsRanking.length > 10 && (
                        <div className="mt-4 pt-4 border-t">
                          <button className="w-full text-center text-pink-600 hover:text-pink-800 text-sm font-medium">
                            عرض المزيد ({studentsRanking.length - 10}+)
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Achievements */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-600" />
                    الإنجازات
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-6">
                    <div className="relative w-24 h-24 mx-auto mb-3">
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full"></div>
                      <div className="absolute inset-2 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center">
                        <Trophy className="w-12 h-12 text-amber-600" />
                      </div>
                    </div>
                    <p className="text-4xl font-bold text-amber-600">{user?.score || 0}</p>
                    <p className="text-muted-foreground">نقطة مكتسبة</p>
                  </div>

              <div className="grid grid-cols-3 gap-3">
                    {[
                      { icon: "🏆", label: "المتفوق", unlocked: true },
                      { icon: "📖", label: "القارئ", unlocked: true },
                      { icon: "🎮", label: "اللاعب", unlocked: false },
                    ].map((badge, index) => (
                      <div
                        key={index}
                        className={`text-center p-3 rounded-xl ${
                          badge.unlocked ? "bg-sunny/30" : "bg-sunny/30"
                        }`}
                      >
                        <span className="text-2xl">{badge.icon}</span>
                        <p className="text-xs mt-1 text-foreground">{badge.label}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default StudentDashboard;





    