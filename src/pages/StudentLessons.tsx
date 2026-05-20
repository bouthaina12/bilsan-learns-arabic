import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Play, BookOpen, Clock, User as UserIcon, ChevronLeft, Eye, Grid3x3 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { playSound } from "@/hooks/useScrollAnimation";

interface Lesson {
  id: number;
  name: string;
  youtube_url: string;
  description: string;
  level: string;
  video_id: string;
}

const StudentLessons = () => {
  const navigate = useNavigate();
  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    if (!user) {
      window.location.href = '/login';
    }
  }, [user]);

  useEffect(() => {
        playSound('click');
    
    fetchLessons();
  }, []);
const fetchLessons = async () => {
  setLoading(true);
  try {
    const response = await fetch('/api/lessons.php');
    
    // First, get the response as text to see what we're getting
    const responseText = await response.text();
    console.log("Raw response:", responseText);
    
    // Try to parse as JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Failed to parse JSON. Response was:", responseText);
      // Create a fallback response
      data = {
        success: false,
        error: "Invalid server response",
        lessons: [],
        total: 0
      };
    }
    
    if (data.success) {
      const lessonsWithIds = data.lessons.map((lesson: Lesson) => ({
        ...lesson,
        video_id: extractYouTubeId(lesson.youtube_url)
      }));
      setLessons(lessonsWithIds);
    } else {
      console.error("Error fetching lessons:", data.error || data.message);
      // Still set empty array to avoid breaking UI
      setLessons([]);
    }
  } catch (error) {
    console.error("Network error:", error);
    setLessons([]);
  } finally {
    setLoading(false);
  }
};

  const extractYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : '';
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const getLevelLabel = (level: string) => {
    const labels: Record<string, string> = {
      'beginner': 'مبتدئ',
      'medium': 'متوسط',
      'advanced': 'متقدم'
    };
    return labels[level] || level;
  };

  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      'beginner': 'bg-green-100 text-green-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'advanced': 'bg-red-100 text-red-800'
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  };

  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch = lesson.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lesson.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = selectedLevel === "all" || lesson.level === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  const handleViewLesson = (lessonId: number) => {
    navigate(`/student-dashboard/lessons/${lessonId}`);
  };

  if (!user) {
    return null;
  }

 return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-amber-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 font-arabic" dir="rtl">
        
        {/* Rendered normally, allowing SidebarProvider to control its transition states */}
        <DashboardSidebar 
          userType="student" 
          userName={user?.username}
          progress={65} 
        />
        
        {/* Changed layout wrapper to use flex-1 just like your dashboard */}
        <div className="flex-1 overflow-auto min-h-screen">
          <header className="bg-white shadow-sm border-b sticky top-0 z-30">
            <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-4">
              
              {/* Added the missing trigger button here with correct rtl spacing */}
              <SidebarTrigger className="mr-2 ml-4" />
              
              <h1 className="text-lg sm:text-2xl font-bold text-primary"> القصص الرقمية </h1>
            </div>
          </header>

          <main className="p-4 sm:p-6">
            
            {/* العنوان الترحيبي */}
            <div className="mb-8 bg-gradient-to-l from-pink-100 to-pink-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-4 sm:p-6 border border-pink-200 dark:border-gray-600">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-pink-400 to-pink-400 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-1 sm:mb-2">
                       مرحباً  في مكتبة القصص الرقمية
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                    اكتشف قصص الرقمية ممتعة تنمي خيالك          
                  </p>
                </div>
              </div>
            </div>

            {/* Search and Controls */}
            <div className="bg-card rounded-xl p-3 sm:p-4 mb-6 border">
              <div className="flex flex-col gap-4">
                <div className="w-full">
                  <div className="relative w-full">
                    <Search className="focus:ring-pink-300 absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <Input
                      type="text"
                      placeholder="ابحث عن دروس..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pr-10 rounded-full border-border text-sm sm:text-base"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                  {/* View Mode Toggle */}
                  <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded transition-all ${viewMode === "grid" ? "bg-white shadow" : ""}`}
                      title="عرض الشبكة"
                    >
                      <Grid3x3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded transition-all ${viewMode === "list" ? "bg-white shadow" : ""}`}
                      title="عرض القائمة"
                    >
                      <BookOpen className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Level Filter */}
                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="border rounded-xl px-3 sm:px-4 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent"
                  >
                    <option value="all">جميع المستويات</option>
                    <option value="beginner">مبتدئ</option>
                    <option value="medium">متوسط</option>
                    <option value="advanced">متقدم</option>
                  </select>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">جاري تحميل الدروس...</p>
              </div>
            ) : filteredLessons.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-2">لا توجد دروس</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? "لم يتم العثور على دروس تطابق بحثك" : "لم يتم العثور على دروس حالياً"}
                </p>
              </div>
            ) : (
              <>
                {/* Grid View */}
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                    {filteredLessons.map((lesson) => (
                      <Card 
                        key={lesson.id} 
                        className="border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden group cursor-pointer"
                        onClick={() => handleViewLesson(lesson.id)}
                      >
                        <div className="relative aspect-video bg-gray-900">
                          {lesson.video_id ? (
                            <img
                              src={`https://img.youtube.com/vi/${lesson.video_id}/mqdefault.jpg`}
                              alt={lesson.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10">
                              <Play className="w-6 h-6 sm:w-8 sm:h-8 text-primary/50" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/90 rounded-full flex items-center justify-center">
                              <Play className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                            </div>
                          </div>
                          <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            <Play className="w-3 h-3 inline ml-1" />
                            مشاهدة
                          </div>
                        </div>
                        <CardContent className="p-2 sm:p-3">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-xs sm:text-sm text-foreground mb-1 line-clamp-2 h-8 sm:h-10">
                                {lesson.name}
                              </h3>
                              <div className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${getLevelColor(lesson.level)}`}>
                                {getLevelLabel(lesson.level)}
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2 sm:mb-3 line-clamp-2 h-8">
                            {lesson.description}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  /* List View */
                  <div className="space-y-3">
                    {filteredLessons.map((lesson) => (
                      <Card 
                        key={lesson.id}
                        className="border-border/50 hover:bg-muted/30 transition-colors cursor-pointer"
                        onClick={() => handleViewLesson(lesson.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="w-32 h-20 bg-gray-900 rounded-lg overflow-hidden flex-shrink-0">
                              {lesson.video_id ? (
                                <img
                                  src={`https://img.youtube.com/vi/${lesson.video_id}/mqdefault.jpg`}
                                  alt={lesson.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-800">
                                  <Play className="w-6 h-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h3 className="font-bold text-foreground line-clamp-1">
                                  {lesson.name}
                                </h3>
                                <div className={`px-2 py-0.5 rounded text-xs ${getLevelColor(lesson.level)}`}>
                                  {getLevelLabel(lesson.level)}
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                {lesson.description}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>انقر لمشاهدة كاملة</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Stats and Help */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-gradient-to-l from-blue-50 to-transparent rounded-xl border">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">💡</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-foreground mb-1">نصائح للمشاهدة</h3>
                    <p className="text-muted-foreground text-sm">
                      اضغط على أي درس لمشاهدته بشكل كامل مع تفاصيل إضافية
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );

  
};

export default StudentLessons;