import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TeacherSidebar } from "@/components/dashboard/TeacherSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Gamepad2, 
  FileText, 
  Users,
  PlusCircle,
  TrendingUp,
  Calendar,
  GraduationCap
} from "lucide-react";
import { useEffect } from "react";

const TeacherDashboard = () => {
   // Get user data directly from localStorage
    const userData = localStorage.getItem('user');
    const user = userData ? JSON.parse(userData) : null;
  
    // Redirect if no user
    useEffect(() => {
      if (!user) {
        window.location.href = '/login';
      }
    }, [user]);
    
  const stats = [
    { title: "الطلاب", value: "45", icon: Users, color: "bg-pink-light text-primary" },
    { title: "الدروس", value: "24", icon: GraduationCap, color: "bg-lavender text-accent-foreground" },
    { title: "الألعاب", value: "12", icon: Gamepad2, color: "bg-mint text-foreground" },
    { title: "أوراق العمل", value: "36", icon: FileText, color: "bg-sunny text-foreground" },
  ];

  const quickActions = [
    { title: "إضافة درس جديد", icon: GraduationCap, href: "/teacher-dashboard/add-lesson" },
    { title: "إضافة كتاب", icon: BookOpen, href: "/teacher-dashboard/add-book" },
    { title: "إضافة لعبة", icon: Gamepad2, href: "/teacher-dashboard/add-game" },
    { title: "إضافة ورقة عمل", icon: FileText, href: "/teacher-dashboard/add-worksheet" },
  ];

  const recentStudents = [
    { name: "أحمد محمد", progress: 85, lastActive: "منذ ساعة" },
    { name: "فاطمة علي", progress: 72, lastActive: "منذ ساعتين" },
    { name: "يوسف خالد", progress: 68, lastActive: "منذ 3 ساعات" },
    { name: "مريم أحمد", progress: 91, lastActive: "منذ يوم" },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background font-arabic" dir="rtl">
        <TeacherSidebar userName={user?.username} />
        
        <main className="flex-1 overflow-auto">
          <header className="h-16 border-b border-border flex items-center px-6 bg-card">
            <SidebarTrigger className="ml-4" />
            <h1 className="text-xl font-bold text-foreground">لوحة تحكم المعلم</h1>
          </header>

          <div className="p-6">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-l from-accent/30 via-lavender/20 to-pink-light/30 rounded-2xl p-6 mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-4xl">👨‍🏫</div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-1">
                       مرحباً أستاذ {user?.username}!
                    </h2>
                  
                  </div>
                </div>
                <Button className="gap-2">
                  <PlusCircle className="w-4 h-4" />
                  إضافة محتوى
                </Button>
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
              {/* Quick Actions */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PlusCircle className="w-5 h-5 text-primary" />
                    إضافة سريعة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {quickActions.map((action, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="h-auto py-6 flex-col gap-2 hover:bg-primary/10 hover:border-primary"
                        asChild
                      >
                        <a href={action.href}>
                          <action.icon className="w-8 h-8 text-primary" />
                          <span className="text-sm">{action.title}</span>
                        </a>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Students */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-accent-foreground" />
                    نشاط الطلاب
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentStudents.map((student, index) => (
                      <div key={index} className="flex items-center gap-4 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                        <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                          <span className="text-lg">👧</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-foreground">{student.name}</span>
                            <span className="text-xs text-muted-foreground">{student.lastActive}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary rounded-full"
                                style={{ width: `${student.progress}%` }}
                              />
                            </div>
                            <span className="text-xs text-primary font-bold">{student.progress}%</span>
                          </div>
                        </div>
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

export default TeacherDashboard;
