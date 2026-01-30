import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, BookOpen, Star, Filter, Bookmark, Eye, Grid3x3, List, User as UserIcon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
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
  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;

  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    if (!user) {
      window.location.href = '/login';
    }
  }, [user]);

  useEffect(() => {
        playSound('click');
    
    fetchStories();
  }, []);

  const fetchStories = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/stories.php');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const responseText = await response.text();
      console.log("Raw response:", responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse JSON:", parseError);
        data = {
          success: false,
          error: "Invalid server response",
          data: [],
          total: 0
        };
      }
      
      if (data.success) {
        setStories(data.data);
        
        // استخراج الفئات الفريدة
        const uniqueCategories = Array.from(
          new Set(data.data.map((story: Story) => story.category))
        ) as string[];
        setCategories(['all', ...uniqueCategories]);
      } else {
        console.error("Error fetching stories:", data.error || data.message);
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
    navigate(`/student-dashboard/stories/${storyId}`);
  };

  const getLevelLabel = (level: string) => {
    const labels: Record<string, string> = {
      'easy': 'سهل',
      'medium': 'متوسط',
      'hard': 'صعب'
    };
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
    const matchesSearch = story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         story.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || story.category === selectedCategory;
    const matchesLevel = selectedLevel === "all" || story.difficulty_level === selectedLevel;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  if (!user) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full bg-gradient-to-br from-amber-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 font-arabic" dir="rtl">
        <div className="fixed right-0 top-0 h-screen z-40 w-64">
          <DashboardSidebar 
            userType="student" 
            userName={user?.username}
            progress={65} 
          />
        </div>
        
        <div className="mr-64 min-h-screen">
          <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
            <div className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                
                <h1 className="text-2xl font-bold text-primary dark:text-white">مكتبة القصص</h1>
              </div>
              <div className="flex items-center gap-4">
                
              </div>
            </div>
          </header>

          <main className="p-6">
            {/* العنوان الترحيبي */}
            <div className="mb-8 bg-gradient-to-l from-pink-100 to-pink-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6 border border-pink-200 dark:border-gray-600">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-pink-400 rounded-2xl flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                    مرحباً  في عالم القصص!
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
                {/* شريط البحث */}
                <div className="flex-1 w-full">
                  <div className="relative max-w-xl">
                    <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                    <Input
                      type="text"
                      placeholder="ابحث عن قصة بالاسم أو الوصف..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pr-12 rounded-full border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white h-12 text-base"
                    />
                  </div>
                </div>

                {/* عناصر التحكم */}
                <div className="flex flex-wrap items-center gap-4">
                  {/* تبديل طريقة العرض */}
                  <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-white dark:bg-gray-600 shadow" : "hover:bg-white/50 dark:hover:bg-gray-600/50"}`}
                    >
                      <Grid3x3 className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-white dark:bg-gray-600 shadow" : "hover:bg-white/50 dark:hover:bg-gray-600/50"}`}
                    >
                      <List className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    </button>
                  </div>

                  {/* فلترة حسب الفئة */}
                  <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="border rounded-xl px-4 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent"
                    >
                      <option value="all">جميع الفئات</option>
                      {categories.filter(cat => cat !== 'all').map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  {/* فلترة حسب المستوى */}
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <select
                      value={selectedLevel}
                      onChange={(e) => setSelectedLevel(e.target.value)}
                      className="border rounded-xl px-4 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent"
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

            {/* حالة التحميل */}
            {loading ? (
              <div className="text-center py-16">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-orange-400 border-t-transparent"></div>
                <p className="mt-6 text-gray-600 dark:text-gray-400 text-lg font-medium">جاري تحميل القصص الممتعة...</p>
              </div>
            ) : filteredStories.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                <BookOpen className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-700 dark:text-white mb-3">لا توجد قصص</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
                  {searchTerm ? "لم نعثر على قصص تطابق بحثك. حاول تغيير كلمات البحث." : "لم يتم العثور على قصص حالياً. سيتم إضافة قصص جديدة قريباً!"}
                </p>
                <Button 
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("all");
                    setSelectedLevel("all");
                  }}
                  className="bg-gradient-to-r from-orange-400 to-yellow-400 hover:from-orange-500 hover:to-yellow-500 text-white font-bold py-3 px-6 rounded-xl"
                >
                  عرض جميع القصص
                </Button>
              </div>
            ) : (
              <>
                {/* عرض الشبكة */}
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredStories.map((story) => (
                      <Card 
                        key={story.id} 
                        className="border-2 border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group bg-white dark:bg-gray-800"
                        onClick={() => handleViewStory(story.id)}
                      >
                        {/* صورة الغلاف */}
                        <div className="relative h-48 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-gray-700 dark:to-gray-600 overflow-hidden">
                          {story.cover_image ? (
                            <img
                              src={`/src/assets/${story.cover_image}`}
                              alt={story.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'https://placehold.co/400x300/FFE4C4/FFA500?text=Cover+Image';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <BookOpen className="w-16 h-16 text-amber-300 dark:text-amber-600" />
                            </div>
                          )}
                          
                          {/* عدد الصفحات */}
                          <div className="absolute top-3 left-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-800 dark:text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow">
                            <span className="w-1 h-1 bg-orange-400 rounded-full"></span>
                            {story.pages_count} صفحة
                          </div>
                          
                          {/* زر المشاهدة */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="bg-white/90 backdrop-blur-sm rounded-full p-4 transform group-hover:scale-110 transition-transform">
                              <Eye className="w-6 h-6 text-orange-500" />
                            </div>
                          </div>
                        </div>

                        <CardContent className="p-5">
                          {/* العنوان والفئة */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-2 line-clamp-1">
                                {story.title}
                              </h3>
                              <div className="flex flex-wrap gap-2 mb-3">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${getCategoryColor(story.category)}`}>
                                  {story.category}
                                </span>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${getLevelColor(story.difficulty_level)}`}>
                                  {getLevelLabel(story.difficulty_level)}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* الوصف */}
                          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2 h-10">
                            {story.description}
                          </p>
                          
                          {/* الأزرار */}
                          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-1 text-amber-500">
                              <Star className="w-4 h-4 fill-current" />
                              <Star className="w-4 h-4 fill-current" />
                              <Star className="w-4 h-4 fill-current" />
                              <Star className="w-4 h-4 fill-current" />
                              <Star className="w-4 h-4 fill-current opacity-30" />
                            </div>
                            <Button 
                              size="sm" 
                              className="bg-primary hover:bg-primary/90 text-white font-bold rounded-lg px-4"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewStory(story.id);
                              }}
                            >
                              اقرأ الآن
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  /* عرض القائمة */
                  <div className="space-y-4">
                    {filteredStories.map((story) => (
                      <Card 
                        key={story.id}
                        className="border-2 border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden hover:shadow-lg transition-all cursor-pointer bg-white dark:bg-gray-800 group"
                        onClick={() => handleViewStory(story.id)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center gap-6">
                            {/* صورة الغلاف */}
                            <div className="w-32 h-40 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-gray-700 dark:to-gray-600 rounded-xl overflow-hidden flex-shrink-0">
                              {story.cover_image ? (
                                <img
                                  src={`/src/assets/${story.cover_image}`}
                                  alt={story.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = 'https://placehold.co/200x300/FFE4C4/FFA500?text=Cover';
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <BookOpen className="w-12 h-12 text-amber-300 dark:text-amber-600" />
                                </div>
                              )}
                            </div>
                            
                            {/* تفاصيل القصة */}
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center justify-between mb-3 gap-3">
                                <div>
                                  <h3 className="font-bold text-xl text-gray-800 dark:text-white mb-2 line-clamp-1">
                                    {story.title}
                                  </h3>
                                  <div className="flex flex-wrap gap-2">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${getCategoryColor(story.category)}`}>
                                      {story.category}
                                    </span>
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${getLevelColor(story.difficulty_level)}`}>
                                      {getLevelLabel(story.difficulty_level)}
                                    </span>
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                                      {story.pages_count} صفحة
                                    </span>
                                  </div>
                                </div>
                                
                                <Button 
                                  size="sm" 
                                  className="bg-primary hover:bg-primary/90 text-white font-bold rounded-lg px-5 py-2"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewStory(story.id);
                                  }}
                                >
                                  اقرأ القصة
                                </Button>
                              </div>
                              
                              <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                                {story.description}
                              </p>
                              
                              <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center gap-1 text-amber-500">
                                    <Star className="w-4 h-4 fill-current" />
                                    <Star className="w-4 h-4 fill-current" />
                                    <Star className="w-4 h-4 fill-current" />
                                    <Star className="w-4 h-4 fill-current" />
                                    <Star className="w-4 h-4 fill-current opacity-30" />
                                  </div>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">4.0 (120 تقييم)</span>
                                </div>
                                
                           
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

            {/* إحصائيات ومعلومات */}
            <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl p-6 border border-blue-100 dark:border-blue-800">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-1">{stories.length} قصة</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">متاحة للقراءة</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-green-100 dark:border-green-800">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-400 rounded-xl flex items-center justify-center">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-1">قصص مفضلة</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">احفظ قصصك المفضلة</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-purple-100 dark:border-purple-800">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-1">نصائح القراءة</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">اقرأ في مكان هادئ ومريح</p>
                  </div>
                </div>
              </div>
            </div>

            {/* رسالة تذكير */}
            <div className="mt-8 text-center">
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                ⭐ قم بتسجيل الدخول يومياً لكسب نقاط ومكافآت خاصة!
              </p>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default StudentStories;