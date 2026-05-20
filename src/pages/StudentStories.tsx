import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, BookOpen, Star, Filter, Grid3x3, List, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { playSound } from "@/hooks/useScrollAnimation";

interface Story {
  id: number;
  title: string;
  description: string;
  pdf_path: string;
  cover_image: string;
  category: string;
  difficulty_level: 'easy' | 'medium' | 'hard';
  pages_count: number;
  created_at: string;
}

const StudentStories = () => {
  const navigate = useNavigate();
  
  const [user, setUser] = useState(() => {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (e) {
      console.error("Error parsing user data", e);
      return null;
    }
  });

  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
    } else {
      fetchStories();
    }
  }, [user, navigate]);

  const fetchStories = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/stories.php');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        data = { success: false, data: [] };
      }
      
      if (data.success && Array.isArray(data.data)) {
        setStories(data.data);
        const uniqueCategories = Array.from(
          new Set(data.data.map((story: Story) => story.category))
        ) as string[];
        setCategories(['all', ...uniqueCategories]);
      } else {
        setStories([]);
      }
    } catch (error) {
      console.error("Network error:", error);
      setStories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewStory = (storyId: number) => {
    try { playSound('click'); } catch(e) {}
    navigate(`/student-dashboard/stories/${storyId}`);
  };

  const getLevelLabel = (level: string) => {
    const labels: Record<string, string> = { 'easy': 'سهل', 'medium': 'متوسط', 'hard': 'صعب' };
    return labels[level] || level;
  };

  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      'easy': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'medium': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'hard': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    };
    return colors[level] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'حيوانات': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'مغامرات': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'علمية': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
      'خيالية': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
      'تعليمية': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300'
    };
    return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  };

  const filteredStories = stories.filter(story => {
    if (!story) return false;
    const title = story.title?.toLowerCase() || '';
    const description = story.description?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();

    const matchesSearch = title.includes(search) || description.includes(search);
    const matchesCategory = selectedCategory === "all" || story.category === selectedCategory;
    const matchesLevel = selectedLevel === "all" || story.difficulty_level === selectedLevel;
    
    return matchesSearch && matchesCategory && matchesLevel;
  });

  if (!user) return null;

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full overflow-hidden bg-gradient-to-br from-amber-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 font-arabic" dir="rtl">
        
        {/* استدعاء الـ Sidebar بنفس طريقة صفحة الـ Dashboard الأصلية */}
        <DashboardSidebar 
          userType="student" 
          userName={user?.username || 'طالب'}
          progress={65} 
        />
        
        {/* الـ Inset المسؤول عن ضبط المساحة والـ Scroll المحاذي للـ Sidebar */}
        <SidebarInset className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-transparent">
          
          {/* الهيدر العلوي المحتوي على زر القائمة المتجاوب */}
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md px-6 shadow-sm border-b dark:border-gray-700">
            <SidebarTrigger className="ml-2 sm:hidden text-gray-700 dark:text-gray-300" />
            <div className="flex items-center justify-between w-full">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">مكتبة القصص</h1>
            </div>
          </header>

          {/* محتوى الصفحة الأساسي */}
          <main className="p-6 max-w-[1600px] w-full mx-auto">
            {/* العنوان الترحيبي */}
            <div className="mb-8 bg-gradient-to-l from-pink-100 to-pink-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6 border border-pink-200 dark:border-gray-600">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-md">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-2">
                    مرحباً {user?.username} في عالم القصص!
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    اكتشف قصصاً ممتعة تنمي خيالك وتعلمك دروساً قيمة
                  </p>
                </div>
              </div>
            </div>

            {/* البحث والفلترة */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
                <div className="flex-1 w-full">
                  <div className="relative max-w-xl">
                    <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                    <Input
                      type="text"
                      placeholder="ابحث عن قصة بالاسم أو الوصف..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pr-12 rounded-full border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white h-12 text-base focus-visible:ring-pink-400"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto justify-start lg:justify-end">
                  <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
                    <button
                      type="button"
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-white dark:bg-gray-600 shadow" : "hover:bg-white/50 dark:hover:bg-gray-600/50"}`}
                    >
                      <Grid3x3 className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-white dark:bg-gray-600 shadow" : "hover:bg-white/50 dark:hover:bg-gray-600/50"}`}
                    >
                      <List className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="border rounded-xl px-4 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-pink-300"
                    >
                      <option value="all">جميع الفئات</option>
                      {categories.filter(cat => cat !== 'all').map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-gray-500" />
                    <select
                      value={selectedLevel}
                      onChange={(e) => setSelectedLevel(e.target.value)}
                      className="border rounded-xl px-4 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-pink-300"
                    >
                      <option value="all">جميع المستويات</option>
                      <option value="easy">سهل</option>
                      <option value="medium">متوسط</option>
                      <option value="hard">صعب</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* حالة التحميل وعرض البيانات */}
            {loading ? (
              <div className="text-center py-16">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-pink-400 border-t-transparent"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400 text-base">جاري تحميل القصص الممتعة...</p>
              </div>
            ) : filteredStories.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-700 dark:text-white mb-2">لا توجد قصص</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-4">
                  {searchTerm ? "لم نعثر على قصص تطابق بحثك. حاول تغيير كلمات البحث." : "لم يتم العثور على قصص حالياً."}
                </p>
                <Button 
                  onClick={() => { setSearchTerm(""); setSelectedCategory("all"); setSelectedLevel("all"); }}
                  className="bg-gradient-to-r from-pink-400 to-orange-400 text-white rounded-xl"
                >
                  عرض جميع القصص
                </Button>
              </div>
            ) : (
              <>
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredStories.map((story) => (
                      <Card 
                        key={story.id} 
                        className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group bg-white dark:bg-gray-800"
                        onClick={() => handleViewStory(story.id)}
                      >
                        <div className="relative h-48 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-gray-700 dark:to-gray-600 overflow-hidden">
                          {story.cover_image ? (
                            <img
                              src={`/src/assets/${story.cover_image}`}
                              alt={story.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x300/FFE4C4/FFA500?text=Cover+Image'; }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <BookOpen className="w-12 h-12 text-amber-300 dark:text-amber-600" />
                            </div>
                          )}
                          <div className="absolute top-3 left-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-800 dark:text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
                            {story.pages_count} صفحة
                          </div>
                        </div>

                        <CardContent className="p-5">
                          <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-2 line-clamp-1">
                            {story.title}
                          </h3>
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getCategoryColor(story.category)}`}>
                              {story.category}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getLevelColor(story.difficulty_level)}`}>
                              {getLevelLabel(story.difficulty_level)}
                            </span>
                          </div>
                          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2 h-10">
                            {story.description}
                          </p>
                          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-0.5 text-amber-400">
                              {[...Array(5)].map((_, i) => <Star key={i} className={`w-3.5 h-3.5 ${i < 4 ? 'fill-current' : 'opacity-30'}`} />)}
                            </div>
                            <Button size="sm" className="bg-primary hover:bg-primary/90 text-white rounded-lg px-3">
                              اقرأ الآن
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredStories.map((story) => (
                      <Card 
                        key={story.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden hover:shadow-md transition-all cursor-pointer bg-white dark:bg-gray-800 group"
                        onClick={() => handleViewStory(story.id)}
                      >
                        <CardContent className="p-5">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                            <div className="w-24 h-32 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-gray-700 dark:to-gray-600 rounded-xl overflow-hidden flex-shrink-0">
                              {story.cover_image ? (
                                <img
                                  src={`/src/assets/${story.cover_image}`}
                                  alt={story.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/200x300/FFE4C4/FFA500?text=Cover'; }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <BookOpen className="w-12 h-12 text-amber-300 dark:text-amber-600" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0 w-full">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                <h3 className="font-bold text-xl text-gray-800 dark:text-white line-clamp-1">
                                  {story.title}
                                </h3>
                                <div className="flex gap-1.5">
                                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getCategoryColor(story.category)}`}>
                                    {story.category}
                                  </span>
                                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getLevelColor(story.difficulty_level)}`}>
                                    {getLevelLabel(story.difficulty_level)}
                                  </span>
                                </div>
                              </div>
                              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                                {story.description}
                              </p>
                              <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                                <span className="text-xs text-gray-500">{story.pages_count} صفحة</span>
                                <Button size="sm" className="bg-primary text-white rounded-lg">اقرأ القصة</Button>
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

            {/* بطاقات الإحصائيات الأسفل */}
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800/60 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center text-blue-500">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-800 dark:text-white">{stories.length} قصة</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">متاحة بالقائمة</p>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800/60 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/50 rounded-xl flex items-center justify-center text-amber-500">
                  <Star className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-800 dark:text-white">المفضلة</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">جاهزة للقراءة</p>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800/60 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-xl flex items-center justify-center text-purple-500">
                  <span className="text-lg">🎯</span>
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-800 dark:text-white">تحدي اليوم</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">اقرأ قصة كاملة</p>
                </div>
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default StudentStories;