import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  BookOpen, 
  Clock, 
  User as UserIcon, 
  GraduationCap,
  Play,
  Share2,
  CheckCircle,
  Bookmark,
  BarChart3,
  PartyPopper,
  Trophy,
  Sparkles,
  X,
  Brain,
  HelpCircle,
  ChevronRight,
  Check,
  Volume2,
  RefreshCw,
  Star
} from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Progress } from "@/components/ui/progress";
import { playSound, playCelebrationSounds, playQuizCompleteSounds, playLessonCompleteSounds } from "@/hooks/useScrollAnimation";

interface Lesson {
  id: number;
  name: string;
  youtube_url: string;
  description: string;
  level: string;
  video_id: string;
  created_at: string;
}

interface CompletionStatus {
  isCompleted: boolean;
  completedAt?: string;
}

interface Question {
  id: number;
  lesson_id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation: string;
}

const LessonDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [user, setUser] = useState<any>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedLessons, setRelatedLessons] = useState<Lesson[]>([]);
  const [completionStatus, setCompletionStatus] = useState<CompletionStatus>({ isCompleted: false });
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [userProgress, setUserProgress] = useState<any>(null);
  
  // حالة النوافذ المنبثقة
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  
  // حالة الأسئلة
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  // تحميل user مرة واحدة
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        
        const stats = localStorage.getItem('userStats');
        if (stats) {
          setUserProgress(JSON.parse(stats));
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
        window.location.href = '/login';
      }
    } else {
      window.location.href = '/login';
    }
  }, []);

  // تحميل بيانات الدرس
  useEffect(() => {
    if (!user || !id) return;

    let isMounted = true;

    const fetchData = async () => {
      setLoading(true);
      
      try {
        // تحميل تفاصيل الدرس
        const lessonResponse = await fetch(`/api/lesson-details.php?id=${id}`);
        
        if (!lessonResponse.ok) throw new Error(`HTTP error! status: ${lessonResponse.status}`);
        
        const lessonData = await lessonResponse.json();
        
        if (lessonData.success && isMounted) {
          setLesson(lessonData.lesson);
          
          if (user.id) {
            await checkLessonCompletion(user.id, lessonData.lesson.id);
          }
          
          await fetchRelatedLessons(lessonData.lesson.id);
          
          // تحميل الأسئلة الخاصة بالدرس
          await fetchQuestions(lessonData.lesson.id);
        }

        if (user.id) {
          await fetchUserProgress(user.id);
        }
        
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => { isMounted = false; };
  }, [id, user]);

  // تحميل الأسئلة
  const fetchQuestions = async (lessonId: number) => {
    try {
      const response = await fetch(`/api/lesson-details.php?action=get_questions&lesson_id=${lessonId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setQuestions(data.questions);
        }
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };

  // التحقق من إكمال الدرس
  const checkLessonCompletion = async (userId: number, lessonId: number) => {
    try {
      const response = await fetch(
        `/api/lesson-details.php?action=check_completion&user_id=${userId}&lesson_id=${lessonId}`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCompletionStatus({
            isCompleted: data.completed,
            completedAt: data.completed_at
          });
        }
      }
    } catch (error) {
      console.error("Error checking completion:", error);
    }
  };

  // إزالة الدرس من المكتملات
  const unmarkLessonComplete = async () => {
    if (!user || !lesson || !completionStatus.isCompleted) return;
    
    try {
      const response = await fetch('/api/lesson-details.php?action=unmark_complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, lesson_id: lesson.id })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setCompletionStatus({ isCompleted: false });
        
        // تحديث الإحصائيات
        if (user.id) await fetchUserProgress(user.id);
      }
    } catch (error) {
      console.error("Error unmarking lesson complete:", error);
    }
  };
  // تحديد الدرس كمكتمل
  const markLessonComplete = async () => {
    if (!user || !lesson || completionStatus.isCompleted || isMarkingComplete) return;
    
    setIsMarkingComplete(true);
    
    try {
      const response = await fetch('/api/lesson-details.php?action=mark_complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, lesson_id: lesson.id, status: 'completed' })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setCompletionStatus({ isCompleted: true, completedAt: data.completed_at });
        updateUserStats();
        
        // عرض نافذة التهنئة مع تشغيل الصوت
         playLessonCompleteSounds();
        setShowCongratulations(true);
        
        // تحديث الإحصائيات
        if (user.id) await fetchUserProgress(user.id);
      }
    } catch (error) {
      console.error("Error marking lesson complete:", error);
    } finally {
      setIsMarkingComplete(false);
    }
  };

  

  // بدء الاختبار
  const startQuiz = () => {
    setShowCongratulations(false);
    setShowQuiz(true);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsAnswerCorrect(null);
    setQuizScore(0);
    setQuizCompleted(false);
    setShowExplanation(false);
    
    // صوت بداية الاختبار
    playSound('pop');
  };

  // اختيار إجابة
  const handleAnswerSelect = (answer: string) => {
    if (selectedAnswer || quizCompleted) return;
    
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = answer === currentQuestion.correct_answer;
    
    setSelectedAnswer(answer);
    setIsAnswerCorrect(isCorrect);
    
    if (isCorrect) {
      playSound('correct');
      setQuizScore(prev => prev + 1);
    } else {
      playSound('wrong');
    }
    setShowExplanation(true);
    
  };

  // الانتقال للسؤال التالي
  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswerCorrect(null);
      setShowExplanation(false);
      playSound('whoosh');
    } else {
      // إنهاء الاختبار
      setQuizCompleted(true);
      playSound('success');
      
      // حفظ نتيجة الاختبار
    }
  };


  // إغلاق الاختبار
  const closeQuiz = () => {
    setShowQuiz(false);
    playSound('pop');
  };

  // إغلاق نافذة التهنئة
  const closeCongratulations = () => {
    setShowCongratulations(false);
    playSound('pop');
  };

  // دالة لتحميل الدروس ذات الصلة
  const fetchRelatedLessons = async (lessonId: number) => {
    try {
      const response = await fetch(
        `/api/lesson-details.php?action=get_related_lessons&exclude=${lessonId}&limit=3`
      );
      
      const data = await response.json();
      
      if (data.success) {
        setRelatedLessons(data.lessons);
      }
    } catch (error) {
      console.error("Error fetching related lessons:", error);
    }
  };

  // دالة لتحميل إحصائيات المستخدم
  const fetchUserProgress = async (userId: number) => {
    try {
      const response = await fetch(
        `/api/lesson-details.php?action=get_user_progress&user_id=${userId}`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUserProgress(data);
          localStorage.setItem('userStats', JSON.stringify(data));
        }
      }
    } catch (error) {
      console.error("Error fetching user progress:", error);
    }
  };

  // تحديث إحصائيات المستخدم محلياً
  const updateUserStats = () => {
    const stats = JSON.parse(localStorage.getItem('userStats') || '{}');
    stats.completedLessons = (stats.completedLessons || 0) + 1;
    localStorage.setItem('userStats', JSON.stringify(stats));
  };

  // استخراج YouTube ID
  const extractYouTubeId = (url: string) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : '';
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

  const handleShare = () => {
    if (navigator.share && lesson) {
      navigator.share({
        title: lesson.name,
        text: lesson.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      playSound('pop');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('userStats');
    localStorage.removeItem('bookmarks');
    window.location.href = '/login';
  };

  // تحقق إذا كان الدرس محفوظاً
  useEffect(() => {
    if (lesson?.id) {
      const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
      setIsBookmarked(bookmarks.includes(lesson.id));
    }
  }, [lesson]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">جاري تحميل الدرس...</p>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <GraduationCap className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-bold text-foreground mb-2">الدرس غير موجود</h3>
          <p className="text-muted-foreground mb-4">عذراً، لم نتمكن من العثور على هذا الدرس</p>
          <Button onClick={() => navigate('/student-dashboard/lessons')}>
            <ChevronLeft className="w-4 h-4 ml-2" />
            العودة للدروس
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full bg-background font-arabic" dir="rtl">
        {/* نافذة التهنئة */}
        {showCongratulations && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-yellow-50 to-pink-50 rounded-2xl p-8 max-w-md w-full shadow-2xl border-2 border-pink-200 animate-fade-in">
              <div className="text-center">
                {/* أيقونات متحركة */}
                <div className="relative mb-6">
                  <PartyPopper className="w-16 h-16 text-yellow-500 mx-auto animate-bounce" />
                  <Sparkles className="w-8 h-8 text-pink-500 absolute top-0 left-1/4 animate-ping" />
                  <Sparkles className="w-6 h-6 text-blue-500 absolute top-2 right-1/4 animate-pulse" />
                </div>
                
                <h2 className="text-3xl font-bold text-gray-800 mb-3">مبروك! 🎉</h2>
                <p className="text-lg text-gray-600 mb-2">أحسنت! لقد أكملت الدرس بنجاح</p>
                <p className="text-gray-500 mb-6">{lesson.name}</p>
                
                <div className="flex gap-3 mb-8">
                  <div className="flex-1 bg-white rounded-xl p-4 border border-yellow-100">
                    <Trophy className="w-8 h-8 text-primary mx-auto mb-2" />
                    <p className="text-sm text-gray-600">خطوة جديدة</p>
                  </div>
                  <div className="flex-1 bg-white rounded-xl p-4 border border-yellow-100">
                    <Star className="w-8 h-8 text-primary mx-auto mb-2" />
                    <p className="text-sm text-gray-600">تقدم رائع</p>
                  </div>
                  <div className="flex-1 bg-white rounded-xl p-4 border border-yellow-100">
                    <Brain className="w-8 h-8 text-primary mx-auto mb-2" />
                    <p className="text-sm text-gray-600">معرفة جديدة</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Button 
                    onClick={startQuiz}
                    className="w-full text-primary hover:from-pink-600 hover:to-purple-600 text-white text-lg py-6 rounded-xl shadow-lg"
                  >
                    <HelpCircle className="w-5 h-5 ml-2" />
                    اختبر معلوماتك (اختبار قصير)
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={closeCongratulations}
                    className="w-full py-6 rounded-xl"
                  >
                    <X className="w-5 h-5 ml-2" />
                    استمر في التصفح
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

     {/* نافذة الاختبار - تصميم بوب أب */}
{showQuiz && (
  <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border-2 border-[hsl(var(--border))] animate-fade-in font-arabic">
      {/* الهيدر */}
      <div className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary))] text-white p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2 font-arabic">
              <Brain className="w-6 h-6" />
              اختبر معلوماتك
            </h2>
            <p className="text-white/90 text-sm font-arabic">اختبر فهمك للدرس بطريقة ممتعة</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={closeQuiz}
            className="text-white hover:bg-white/20 rounded-full"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        {/* شريط التقدم */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-arabic">
            <span>السؤال {currentQuestionIndex + 1} من {questions.length}</span>
            <span>النقاط: {quizScore}</span>
          </div>
          <Progress 
            value={((currentQuestionIndex + (quizCompleted ? 1 : 0)) / questions.length) * 100} 
            className="h-2 bg-white/30 rounded-full"
          />
        </div>
      </div>
      
      {/* محتوى الاختبار */}
      <div className="p-6 overflow-y-auto max-h-[60vh] bg-[hsl(var(--background))]">
        {!quizCompleted ? (
          // سؤال حالي
          <div className="space-y-6">
            <div className="bg-[hsl(var(--lavender-light))] rounded-2xl p-6 border border-[hsl(var(--border))]">
              <h3 className="text-xl font-bold text-[hsl(var(--foreground))] mb-4 flex items-center gap-2 font-arabic">
                <span className="bg-[hsl(var(--primary))] text-white w-8 h-8 rounded-full flex items-center justify-center">
                  {currentQuestionIndex + 1}
                </span>
                {questions[currentQuestionIndex]?.question_text}
              </h3>
              
              {/* خيارات الإجابة */}
              <div className="space-y-3">
                {['a', 'b', 'c', 'd'].map((option) => {
                  const optionText = questions[currentQuestionIndex]?.[`option_${option}` as keyof Question] as string;
                  if (!optionText) return null;
                  
                  const isSelected = selectedAnswer === option;
                  const isCorrect = questions[currentQuestionIndex]?.correct_answer === option;
                  
                  return (
                    <Button
                      key={option}
                      variant="outline"
                      onClick={() => handleAnswerSelect(option)}
                      disabled={!!selectedAnswer}
                      className={`w-full justify-start p-4 h-auto text-right rounded-xl border-2 transition-all duration-200 font-arabic ${
                        isSelected 
                          ? isCorrect
                            ? 'border-[hsl(var(--mint))] bg-[hsl(var(--mint))/20] text-[hsl(var(--foreground))]'
                            : 'border-[hsl(var(--coral))] bg-[hsl(var(--coral))/20] text-[hsl(var(--foreground))]'
                          : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary))] bg-white'
                      } ${!selectedAnswer && 'hover:scale-[1.02]'}`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-lg font-arabic">{optionText}</span>
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center font-arabic ${
                          selectedAnswer 
                            ? option === questions[currentQuestionIndex]?.correct_answer
                              ? 'bg-[hsl(var(--mint))] text-white'
                              : isSelected
                                ? 'bg-[hsl(var(--coral))] text-white'
                                : 'bg-[hsl(var(--muted))]'
                            : 'bg-[hsl(var(--beige))] text-[hsl(var(--foreground))]'
                        }`}>
                          {option.toUpperCase()}
                        </span>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </div>
            
            {/* شرح الإجابة */}
            {showExplanation && (
              <div className={`p-4 rounded-2xl border-2 ${
                isAnswerCorrect 
                  ? 'border-[hsl(var(--mint))] bg-[hsl(var(--mint))/10]' 
                  : 'border-[hsl(var(--coral))] bg-[hsl(var(--coral))/10]'
              }`}>
                <div className="flex items-start gap-3">
                  {isAnswerCorrect ? (
                    <CheckCircle className="w-6 h-6 text-[hsl(var(--mint))] mt-1 flex-shrink-0" />
                  ) : (
                    <HelpCircle className="w-6 h-6 text-[hsl(var(--coral))] mt-1 flex-shrink-0" />
                  )}
                  <div>
                    <p className="font-medium mb-1 text-[hsl(var(--foreground))] font-arabic">
                      {isAnswerCorrect ? 'إجابة صحيحة! 🎉' : 'الإجابة الصحيحة هي:'}
                      {!isAnswerCorrect && (
                        <span className="text-[hsl(var(--mint))] mr-2 font-arabic">
                          {questions[currentQuestionIndex]?.correct_answer.toUpperCase()}: {
                            questions[currentQuestionIndex]?.[
                              `option_${questions[currentQuestionIndex]?.correct_answer}` as keyof Question
                            ]
                          }
                        </span>
                      )}
                    </p>
                    <p className="text-[hsl(var(--muted-foreground))] text-sm font-arabic">
                      {questions[currentQuestionIndex]?.explanation}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* زر التالي */}
            {selectedAnswer && (
              <Button
                onClick={goToNextQuestion}
                className="w-full py-6 text-lg bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary))] hover:from-[hsl(var(--lavender))/90] hover:to-[hsl(var(--lavender))/90] text-white rounded-2xl shadow-lg font-arabic"
              >
                {currentQuestionIndex < questions.length - 1 ? (
                  <>
                    السؤال التالي
                    <ChevronRight className="w-5 h-5 mr-2" />
                  </>
                ) : (
                  <>
                    إنهاء الاختبار
                    <Trophy className="w-5 h-5 mr-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        ) : (
          // نتائج الاختبار
          <div className="text-center py-8">
            <div className="relative mb-6">
              <Trophy className="w-20 h-20 yellow mx-auto animate-bounce" />
              <div className="absolute inset-0 bg-[hsl(var(--yellow))/20] rounded-full blur-xl"></div>
            </div>
            
            <h3 className="text-3xl font-bold text-[hsl(var(--foreground))] mb-2 font-arabic">
              {quizScore === questions.length ? 'ممتاز! 💯' : 
               quizScore >= questions.length * 0.7 ? 'رائع! 🎉' : 
               'جيد! 👍'}
            </h3>
            
            <div className="bg-gradient-to-r from-[hsl(var(--lavender-light))] to-[hsl(var(--beige))] rounded-2xl p-6 mb-6 border-2 border-[hsl(var(--border))]">
              <div className="text-6xl font-bold text-[hsl(var(--primary))] mb-2">
                {Math.round((quizScore / questions.length) * 100)}%
              </div>
              <p className="text-[hsl(var(--muted-foreground))] font-arabic">
                {quizScore} من {questions.length} إجابة صحيحة
              </p>
            </div>
            
            <div className="space-y-3">
              <Button
                onClick={() => {
                  setCurrentQuestionIndex(0);
                  setQuizCompleted(false);
                  setSelectedAnswer(null);
                  setIsAnswerCorrect(null);
                  setQuizScore(0);
                  setShowExplanation(false);
                  playSound('whoosh');
                }}
                className="w-full py-6 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary))] hover:from-[hsl(var(--mint))/90] hover:to-[hsl(var(--lavender))/90] text-white rounded-2xl shadow-lg font-arabic"
              >
                <RefreshCw className="w-5 h-5 ml-2" />
                حاول مرة أخرى
              </Button>
              
              <Button
                variant="outline"
                onClick={closeQuiz}
                className="w-full py-6 rounded-2xl border-2 border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))] text-[hsl(var(--foreground))] font-arabic"
              >
                <Check className="w-5 h-5 ml-2" />
                العودة للدرس
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* رسالة تشجيعية */}
      {!quizCompleted && (
        <div className="p-4 bg-gradient-to-r from-[hsl(var(--lavender-light))] to-[hsl(var(--beige))] border-t border-[hsl(var(--border))]">
          <p className="text-center text-sm text-[hsl(var(--muted-foreground))] flex items-center justify-center gap-2 font-arabic">
            <Volume2 className="w-4 h-4 text-[hsl(var(--primary))]" />
            كل إجابة صحيحة تحصل على نقطة!
          </p>
        </div>
      )}
    </div>
  </div>
)}

        {/* Dashboard Sidebar */}
        <div className="fixed right-0 top-0 h-screen z-40 w-64">
          <DashboardSidebar 
            userType="student" 
            userName={user?.username}
            progress={65} 
          />
        </div>
        
        <div className="mr-64 min-h-screen bg-gradient-to-br from-amber-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
          {/* Header */}
          <header className="bg-white shadow-sm border-b">
            <div className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  onClick={() => navigate('/student-dashboard/lessons')}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="w-5 h-5" />
                  العودة للدروس
                </Button>
                <h1 className="text-xl font-bold text-primary">تفاصيل الدرس</h1>
              </div>
              
              
            </div>
          </header>

          {/* Main Content */}
          <main className="p-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Left Column - Video and Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Video Player */}
                <Card className="border-border/50 overflow-hidden">
                  <div className="aspect-video bg-black">
                    <iframe
                      className="w-full h-full"
                      src={`https://www.youtube.com/embed/${lesson.video_id}?rel=0&modestbranding=1&showinfo=0&controls=1`}
                      title={lesson.name}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                      allowFullScreen
                    />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        {/* زر إكمال الدرس */}
                        <Button
                          variant={completionStatus.isCompleted ? "default" : "outline"}
                          size="sm"
                          onClick={completionStatus.isCompleted ? unmarkLessonComplete : markLessonComplete}
                          disabled={isMarkingComplete}
                          className={`flex items-center gap-2 ${
                            completionStatus.isCompleted 
                              ? 'bg-green-600 hover:bg-green-700 text-white' 
                              : ''
                          }`}
                        >
                          {isMarkingComplete ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              جاري الحفظ...
                            </>
                          ) : completionStatus.isCompleted ? (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              مكتمل ✓
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              أكملت الدرس
                            </>
                          )}
                        </Button>

                        

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleShare}
                          className="flex items-center gap-2"
                        >
                          <Share2 className="w-4 h-4" />
                          مشاركة
                        </Button>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(lesson.level)}`}>
                        {getLevelLabel(lesson.level)}
                      </div>
                    </div>

                    {completionStatus.isCompleted && completionStatus.completedAt && (
                      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 text-green-700">
                          <CheckCircle className="w-5 h-5" />
                          <span className="font-medium">أكملت هذا الدرس في {new Date(completionStatus.completedAt).toLocaleDateString('ar-SA')}</span>
                        </div>
                      </div>
                    )}

                    <h1 className="text-2xl font-bold text-foreground mb-4">
                      {lesson.name}
                    </h1>

                    <p className="text-muted-foreground mb-6">
                      {lesson.description}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>آخر تحديث: {new Date(lesson.created_at).toLocaleDateString('ar-SA')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Play className="w-4 h-4" />
                        <span>درس فيديو</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Additional Information */}
                <Card className="border-border/50">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      نصائح للدراسة
                    </h3>
                    <ul className="space-y-3 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>شاهد الدرس كاملاً دون انقطاع للمرة الأولى</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>كرر المشاهدة للتركيز على النقاط الصعبة</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>حاول تطبيق ما تعلمته مع زملائك أو أفراد عائلتك</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>اضغط على زر "أكملت الدرس" بعد الانتهاء من المشاهدة</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Related Lessons */}
                <Card className="border-border/50">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-foreground mb-4">دروس ذات صلة</h3>
                    <div className="space-y-4">
                      {relatedLessons.map((relatedLesson) => (
                        <div
                          key={relatedLesson.id}
                          className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => {
                            playSound('pop');
                            navigate(`/student-dashboard/lessons/${relatedLesson.id}`);
                          }}
                        >
                          <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            {relatedLesson.video_id ? (
                              <img
                                src={`https://img.youtube.com/vi/${relatedLesson.video_id}/default.jpg`}
                                alt={relatedLesson.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                <Play className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-foreground text-sm line-clamp-2">
                              {relatedLesson.name}
                            </h4>
                            <div className={`inline-flex items-center px-2 py-0.5 rounded text-xs mt-1 ${getLevelColor(relatedLesson.level)}`}>
                              {getLevelLabel(relatedLesson.level)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {relatedLessons.length === 0 && (
                      <p className="text-center text-muted-foreground text-sm py-4">
                        لا توجد دروس ذات صلة حالياً
                      </p>
                    )}

                    <Button
                      variant="outline"
                      className="w-full mt-4"
                      onClick={() => {
                        playSound('pop');
                        navigate('/student-dashboard/lessons');
                      }}
                    >
                      <BookOpen className="w-4 h-4 ml-2" />
                      عرض جميع الدروس
                    </Button>
                  </CardContent>
                </Card>

                {/* User Progress */}
                <Card className="border-border/50">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      تقدمك الدراسي
                    </h3>
                    
                    {userProgress && userProgress.success ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">الدروس المكتملة:</span>
                          <span className="font-bold text-primary">
                            {userProgress.progress.completed} / {userProgress.progress.total}
                          </span>
                        </div>
                        
                        <div className="bg-gray-100 rounded-full h-3">
                          <div 
                            className="bg-primary h-3 rounded-full transition-all duration-500"
                            style={{ width: `${userProgress.progress.percentage}%` }}
                          ></div>
                        </div>
                        
                        <div className="text-center">
                          <span className="text-2xl font-bold">{userProgress.progress.percentage}%</span>
                          <p className="text-sm text-muted-foreground">نسبة الإكمال</p>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="p-2 bg-green-50 rounded">
                            <div className="text-lg font-bold">{userProgress.levels?.beginner?.completed || 0}</div>
                            <div className="text-xs text-muted-foreground">مبتدئ</div>
                          </div>
                          <div className="p-2 bg-yellow-50 rounded">
                            <div className="text-lg font-bold">{userProgress.levels?.medium?.completed || 0}</div>
                            <div className="text-xs text-muted-foreground">متوسط</div>
                          </div>
                          <div className="p-2 bg-red-50 rounded">
                            <div className="text-lg font-bold">{userProgress.levels?.advanced?.completed || 0}</div>
                            <div className="text-xs text-muted-foreground">متقدم</div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-2 text-sm text-muted-foreground">جاري تحميل الإحصائيات...</p>
                      </div>
                    )}

                    <Button
                      variant="outline"
                      className="w-full mt-4"
                      onClick={() => {
                        playSound('pop');
                        navigate('/student-dashboard/progress');
                      }}
                    >
                      <BarChart3 className="w-4 h-4 ml-2" />
                      عرض التقرير الكامل
                    </Button>
                  </CardContent>
                </Card>

                {/* Current Lesson Status */}
                <Card className="border-border/50">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-foreground mb-4">حالة هذا الدرس</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">الحالة:</span>
                        <span className={`font-medium ${
                          completionStatus.isCompleted ? 'text-green-600' : 'text-amber-600'
                        }`}>
                          {completionStatus.isCompleted ? 'مكتمل ✓' : 'قيد التقدم'}
                        </span>
                      </div>
                      
                      <div className="bg-gray-100 rounded-full h-3">
                        <div 
                          className="bg-green-600 h-3 rounded-full transition-all duration-500"
                          style={{ width: completionStatus.isCompleted ? '100%' : '30%' }}
                        ></div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        {completionStatus.isCompleted 
                          ? 'تهانينا! لقد أكملت هذا الدرس بنجاح.'
                          : 'تابع المشاهدة واضغط على زر "أكملت الدرس" عند الانتهاء.'}
                      </p>
                      
                      {completionStatus.completedAt && (
                        <div className="text-sm text-muted-foreground">
                          <Clock className="w-4 h-4 inline ml-1" />
                          تم الإكمال: {new Date(completionStatus.completedAt).toLocaleDateString('ar-SA')}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default LessonDetails;