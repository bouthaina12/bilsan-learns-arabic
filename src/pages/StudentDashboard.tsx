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
  Clock
} from "lucide-react";

const StudentDashboard = () => {
  const stats = [
    { title: "الدروس المكتملة", value: "12", icon: BookOpen, color: "bg-pink-light text-primary" },
    { title: "الألعاب", value: "8", icon: Gamepad2, color: "bg-lavender text-accent-foreground" },
    { title: "أوراق العمل", value: "15", icon: FileText, color: "bg-mint text-foreground" },
    { title: "المسابقات", value: "3", icon: Trophy, color: "bg-sunny text-foreground" },
  ];

  const recentLessons = [
    { title: "حرف الألف", progress: 100, stars: 3 },
    { title: "حرف الباء", progress: 75, stars: 2 },
    { title: "حرف التاء", progress: 50, stars: 1 },
    { title: "حرف الثاء", progress: 25, stars: 0 },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background font-arabic" dir="rtl">
        <DashboardSidebar 
          userType="student" 
          userName="أحمد" 
          seeds={250} 
          progress={65} 
        />
        
        <main className="flex-1 overflow-auto">
          <header className="h-16 border-b border-border flex items-center px-6 bg-card">
            <SidebarTrigger className="ml-4" />
            <h1 className="text-xl font-bold text-foreground">لوحة التحكم</h1>
          </header>

          <div className="p-6">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-l from-primary/20 via-lavender/30 to-mint/20 rounded-2xl p-6 mb-8">
              <div className="flex items-center gap-4">
                <div className="text-4xl">👋</div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-1">
                    مرحباً أحمد!
                  </h2>
                  <p className="text-muted-foreground">
                    استمر في التعلم واحصل على المزيد من البذور 🌱
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {stats.map((stat, index) => (
                <Card key={index} className="border-border/50 hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                        <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                      </div>
                      <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                        <stat.icon className="w-6 h-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Recent Lessons */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    الدروس الأخيرة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentLessons.map((lesson, index) => (
                      <div key={index} className="flex items-center gap-4 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                        <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                          <span className="text-lg">📚</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium text-foreground">{lesson.title}</span>
                            <div className="flex gap-0.5">
                              {[1, 2, 3].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= lesson.stars
                                      ? "text-sunny fill-sunny"
                                      : "text-muted-foreground/30"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <Progress value={lesson.progress} className="h-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Seeds & Achievements */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sprout className="w-5 h-5 text-green-600" />
                    البذور والإنجازات
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-6">
                    <div className="w-24 h-24 mx-auto bg-gradient-to-br from-mint to-green-300 rounded-full flex items-center justify-center mb-3">
                      <Sprout className="w-12 h-12 text-green-700" />
                    </div>
                    <p className="text-4xl font-bold text-green-600">250</p>
                    <p className="text-muted-foreground">بذرة مجموعة</p>
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
                          badge.unlocked ? "bg-sunny/30" : "bg-muted/30 opacity-50"
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
