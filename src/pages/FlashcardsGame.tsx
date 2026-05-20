import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Home, Volume2, VolumeX, RotateCw, ChevronRight, ChevronLeft,
  Star, TrendingUp, CheckCircle, XCircle, Trophy, Timer, Image as ImageIcon
} from 'lucide-react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { playSound, playCelebrationSounds, playQuizCompleteSounds, playLessonCompleteSounds, playSoundSequence } from "@/hooks/useScrollAnimation";
import { toast } from '@/components/ui/sonner';

interface Flashcard {
  id: number;
  word: string;
  meaning: string;
  arabicExample: string;
  englishExample: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  imagePath: string; // مسار الصورة
}

interface GameStat {
  currentCard: number;
  correctAnswers: number;
  wrongAnswers: number;
  score: number;
  time: number;
}

const FlashcardsGame = () => {
  const navigate = useNavigate();
  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;

  // حالة اللعبة
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'completed'>('ready');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [currentCategory, setCurrentCategory] = useState('all');
  const [isFlipped, setIsFlipped] = useState(false);

  // مجموعة البطاقات مع صور حقيقية
  const [flashcards, setFlashcards] = useState<Flashcard[]>([
    {
      id: 1,
      word: 'شاشيّةٌ',
      meaning: '',
      arabicExample: 'شاشيّةٌ تزين الحائط',
      englishExample: '',
      category: 'شاشيّةٌ',
      difficulty: 'easy',
      imagePath: '/src/assets/games/flashcards/شاشيّةٌ.jpg'
    },
    {
      id: 2,
      word: 'خرز ملوّنٌ',
      meaning: '',
      arabicExample: ' خرز ملوّنٌ يزين العقد',
      englishExample: '',
      category: 'خرز',
      difficulty: 'easy',
      imagePath: '/src/assets/games/flashcards/خرز.jpg'
    },
    {
      id: 3,
      word: 'قفطانٌ',
      meaning: '',
      arabicExample: '   قفطانٌ جميلٌ  ',
      englishExample: '',
      category: 'قفطانٌ',
      difficulty: 'medium',
      imagePath: '/src/assets/games/flashcards/قفطانٌ.jpg'
    },
    {
      id: 4,
      word: 'برنُسٌ',
      meaning: '',
      arabicExample: 'برنُسٌ دافئٌ في الشتاء',
      englishExample: '',
      category: 'برنُسٌ',
      difficulty: 'medium',
      imagePath: '/src/assets/games/flashcards/برنُسٌ.jpg'
    }
  ]);

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [gameStats, setGameStats] = useState<GameStat>({
    currentCard: 1,
    correctAnswers: 0,
    wrongAnswers: 0,
    score: 0,
    time: 0
  });

  const [shuffledCards, setShuffledCards] = useState<Flashcard[]>([]);
  const [usedCards, setUsedCards] = useState<number[]>([]);

  // تصفية البطاقات حسب الفئة
  const filteredCards = currentCategory === 'all' 
    ? flashcards 
    : flashcards.filter(card => card.category === currentCategory);

  // الحصول على الفئات الفريدة
  const categories = ['all', ...new Set(flashcards.map(card => card.category))];

  // تهيئة اللعبة
  const initializeGame = () => {
    // خلط البطاقات
    const shuffled = [...filteredCards]
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(10, filteredCards.length));
    
    setShuffledCards(shuffled);
    setCurrentCardIndex(0);
    setUsedCards([]);
    setIsFlipped(false);
    setShowAnswer(false);
    setShowTranslation(false);
    setGameStats({
      currentCard: 1,
      correctAnswers: 0,
      wrongAnswers: 0,
      score: 0,
      time: 0
    });
    setGameState('ready');
    
    playSound('click');
  };

  // بدء اللعبة
  const startGame = () => {
    if (shuffledCards.length === 0) {
      alert('لا توجد بطاقات في هذه الفئة!');
      return;
    }
    
    setGameState('playing');
    playSound('bookOpen');
  };

  // التالي
  const nextCard = () => {
    if (currentCardIndex < shuffledCards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setGameStats(prev => ({
        ...prev,
        currentCard: prev.currentCard + 1
      }));
      setIsFlipped(false);
      setShowAnswer(false);
      setShowTranslation(false);
      playSound('pageTurn');
    } else {
      endGame();
    }
  };

  // السابق
  const prevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(prev => prev - 1);
      setGameStats(prev => ({
        ...prev,
        currentCard: prev.currentCard - 1
      }));
      setIsFlipped(false);
      setShowAnswer(false);
      setShowTranslation(false);
      playSound('pageTurn');
    }
  };

  // الإجابة الصحيحة
  const markCorrect = () => {
    if (gameState !== 'playing') return;
    
    const currentCardId = shuffledCards[currentCardIndex].id;
    if (!usedCards.includes(currentCardId)) {
      setUsedCards(prev => [...prev, currentCardId]);
      setGameStats(prev => ({
        ...prev,
        correctAnswers: prev.correctAnswers + 1,
        score: prev.score + 100
      }));
      
      playSound('correct');
      
      // التلقائي للبطاقة التالية بعد ثانية
      setTimeout(() => {
        if (gameState === 'playing') {
          nextCard();
        }
      }, 1000);
    }
  };

  // الإجابة الخاطئة
  const markWrong = () => {
    if (gameState !== 'playing') return;
    
    const currentCardId = shuffledCards[currentCardIndex].id;
    if (!usedCards.includes(currentCardId)) {
      setUsedCards(prev => [...prev, currentCardId]);
      setGameStats(prev => ({
        ...prev,
        wrongAnswers: prev.wrongAnswers + 1,
        score: Math.max(prev.score - 20, 0)
      }));
      
      playSound('wrong');
 // التلقائي للبطاقة التالية بعد ثانية
      setTimeout(() => {
        if (gameState === 'playing') {
          nextCard();
        }
      }, 1000);    }
  };

  // إنهاء اللعبة
  const endGame = async () => {
    setGameState('completed');
    
    // تشغيل أصوات النجاح
    const accuracy = gameStats.correctAnswers / (gameStats.correctAnswers + gameStats.wrongAnswers);
    if (accuracy >= 0.7) {
      playSoundSequence([
        { type: 'success', delay: 0 },
        { type: 'tada', delay: 300 },
        { type: 'confetti', delay: 600 }
      ]);
    } else {
      playSoundSequence([
        { type: 'chime', delay: 0 },
        { type: 'claps', delay: 300 }
      ]);
    }
    
    // حفظ النتيجة
    if (user) {
      const savedScores = JSON.parse(localStorage.getItem(`flashcards-scores-${user.id}`) || '[]');
      savedScores.push({
        score: gameStats.score,
        correct: gameStats.correctAnswers,
        wrong: gameStats.wrongAnswers,
        time: gameStats.time,
        category: currentCategory,
        date: new Date().toISOString()
      });
      localStorage.setItem(`flashcards-scores-${user.id}`, JSON.stringify(savedScores));
      // 2. تحديث النقاط في قاعدة البيانات
        const response = await fetch('/api/update-score.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: user.id,
            points: 50
          })
        });


        const result = await response.json();

         if (result.success) {
          // تحديث بيانات المستخدم في localStorage
          const updatedUser = { 
            ...user, 
            score: result.new_score 
          };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          
          toast.success(
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span>
                تم إضافة {result.added_points} نقطة لرصيدك! النقاط الإجمالية: {result.new_score}
              </span>
            </div>,
            {
              duration: 5000,
              icon: '🎉'
            }
          );
        } else {
          toast.error('تم حفظ النتيجة محلياً، ولكن حدث خطأ في تحديث النقاط');
        }
      }
    
  };

  // تنسيق الوقت
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  useEffect(() => {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    
    initializeGame();
  }, [currentCategory]);

  useEffect(() => {
    let timer: number;

    if (gameState === 'playing') {
      timer = setInterval(() => {
        setGameStats(prev => ({
          ...prev,
          time: prev.time + 1
        }));
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [gameState]);

  const currentCard = shuffledCards[currentCardIndex];

  return (
 <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background font-arabic" dir="rtl">
        
        {/* Dashboard Sidebar Integration */}
        <DashboardSidebar 
          userType="student" 
          userName={user?.username}
          progress={65} 
        />

        {/* Content Area Wrapper */}
        <div className="flex-1 min-h-screen bg-gradient-to-br from-amber-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 overflow-x-hidden">
          
          {/* Header */}
          <header className="bg-white shadow-sm border-b sticky top-0 z-30">
            <div className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
                <Button
                  variant="ghost"
                  onClick={() => navigate('/student-dashboard/games')}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="w-5 h-5" />
                  العودة إلى الألعاب
                </Button>
                <h1 className="text-xl font-bold text-primary hidden md:block"> البطاقات التعليمية</h1>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className="flex items-center gap-1 text-xs sm:text-sm"
                  >
                    {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                    <span className="hidden sm:inline">{soundEnabled ? 'صوت' : 'بدون'}</span>
                  </Button>
                </div>
            </div>
          </header>

          <main className="p-4 sm:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* لوحة التحكم */}
              <div className="space-y-4 sm:space-y-6">
                {/* إحصائيات */}
                <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 p-4 sm:p-5">
                  <h2 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white mb-4">إحصائيات اللعبة</h2>
                  
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="text-center p-2 sm:p-3 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg">
                      <Timer className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 mx-auto mb-1 sm:mb-2" />
                      <div className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">{formatTime(gameStats.time)}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">الوقت</div>
                    </div>
                    
                    <div className="text-center p-2 sm:p-3 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                      <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 mx-auto mb-1 sm:mb-2" />
                      <div className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">{gameStats.correctAnswers}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">صحيح</div>
                    </div>
                    
                    <div className="text-center p-2 sm:p-3 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-lg">
                      <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 mx-auto mb-1 sm:mb-2" />
                      <div className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">{gameStats.wrongAnswers}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">خطأ</div>
                    </div>
                    
                   
                  </div>
                </Card>

                {/* التحكم */}
                <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 p-4 sm:p-5">
                  <h2 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white mb-4">التحكم</h2>
                  
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      <Button
                        onClick={initializeGame}
                        variant="outline"
                        size="sm"
                        className="w-full text-xs sm:text-sm"
                      >
                        <RotateCw className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
                        إعادة تعيين
                      </Button>
                      
                      <Button
                        onClick={startGame}
                        size="sm"
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-xs sm:text-sm"
                        disabled={gameState === 'playing' || shuffledCards.length === 0}
                      >
                        ابدأ اللعبة
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">تصفية حسب الفئة:</p>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        {categories.map(category => (
                          <Button
                            key={category}
                            size="sm"
                            variant={currentCategory === category ? "default" : "outline"}
                            onClick={() => {
                              playSound('click');
                              setCurrentCategory(category);
                            }}
                            className={`text-xs ${
                              currentCategory === category 
                                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                                : ''
                            }`}
                          >
                            {category === 'all' ? 'الكل' : category}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">إعدادات البطاقة:</p>
                      <div className="flex gap-2">
                        
                        <Button
                          size="sm"
                          variant={showTranslation ? "default" : "outline"}
                          onClick={() => setShowTranslation(!showTranslation)}
                          className={`flex-1 ${
                            showTranslation ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : ''
                          }`}
                          disabled={gameState !== 'playing'}
                        >
                          {showTranslation ? 'إخفاء الترجمة' : 'إظهار الترجمة'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* كيفية اللعب */}
                <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 p-5">
                  <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">كيفية اللعب</h2>
                  
                  <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                    <li className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-green-500 mt-0.5" />
                      <span>انظر إلى الصورة  </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-green-500 mt-0.5" />
                      <span>حاول تذكر المعنى بالعربية</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-green-500 mt-0.5" />
                      <span>اضغط على "صحيح" إذا كنت تعرف الإجابة</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-green-500 mt-0.5" />
                      <span>اضغط على "خطأ" إذا أردت رؤية الإجابة</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-green-500 mt-0.5" />
                      <span>انقر على البطاقة لقلبها ومشاهدة التفاصيل</span>
                    </li>
                  </ul>
                </Card>
              </div>

              {/* البطاقة الرئيسية */}
              <div className="lg:col-span-2">
                <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 p-6 h-full">
                  <div className="flex flex-col items-center justify-center h-full">
                    {/* رسالة اكتمال اللعبة */}
                    {gameState === 'completed' && (
                      <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
                        <div className="text-center p-8 bg-white/90 dark:bg-gray-800/90 rounded-xl shadow-2xl max-w-md">
                          <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Trophy className="w-8 h-8 text-white" />
                          </div>
                          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                            أحسنت! لقد أكملت البطاقات
                          </h3>
                          <div className="space-y-3 mb-6">
                            <div className="flex justify-between">
                              <span>البطاقات الصحيحة:</span>
                              <span className="font-bold text-green-600 dark:text-green-400">{gameStats.correctAnswers}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>البطاقات الخاطئة:</span>
                              <span className="font-bold text-red-600 dark:text-red-400">{gameStats.wrongAnswers}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>الوقت:</span>
                              <span className="font-bold">{formatTime(gameStats.time)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold text-indigo-600 dark:text-indigo-400">
                              <span> نقطة لرصيدك:</span>
                              <span>50</span>
                            </div>
                            <div className="flex justify-between">
                              <span>الدقة:</span>
                              <span className="font-bold">
                                {gameStats.correctAnswers + gameStats.wrongAnswers > 0
                                  ? Math.round((gameStats.correctAnswers / (gameStats.correctAnswers + gameStats.wrongAnswers)) * 100)
                                  : 0}%
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <Button
                              onClick={initializeGame}
                              variant="outline"
                              className="flex-1"
                            >
                              العب مرة أخرى
                            </Button>
                            <Button
                              onClick={() => navigate('/student-dashboard/games')}
                              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500"
                            >
                              العودة للألعاب
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* تعليمات البداية */}
                    {gameState === 'ready' && (
                      <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                          بطاقات تعليمية لكلمات جديدة
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                          اختر فئة وابدأ تعلم كلمات جديدة مع الصور التوضيحية
                        </p>
                        <div className="flex items-center justify-center gap-4 mb-4">
                          <div className="w-16 h-16 rounded-lg overflow-hidden">
                            <img
                              src="/src/assets/games/flashcards/برنُسٌ.jpg"
                              alt="Sample"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = `https://placehold.co/64x64/10B981/34D399?text=🍎`;
                              }}
                            />
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-800 dark:text-white"></p>
                            <p className="text-green-600 dark:text-green-400">برنُسٌ</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {filteredCards.length} بطاقة متاحة في هذه الفئة
                        </p>
                      </div>
                    )}

                    {/* عرض البطاقة */}
                    {currentCard && gameState === 'playing' && (
                      <div className="w-full max-w-lg">
                        {/* معلومات البطاقة */}
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-800 dark:text-green-300">
                              {currentCard.category}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              currentCard.difficulty === 'easy' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                                : currentCard.difficulty === 'medium'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                            }`}>
                              {currentCard.difficulty === 'easy' ? 'سهل' : currentCard.difficulty === 'medium' ? 'متوسط' : 'صعب'}
                            </span>
                          </div>
                          <div className="text-gray-600 dark:text-gray-400">
                            {gameStats.currentCard} / {shuffledCards.length}
                          </div>
                        </div>

                        {/* البطاقة الرئيسية */}
                        <div 
                          className={`relative w-full h-64 sm:h-96 rounded-xl mb-4 sm:mb-6 transition-all duration-500 transform cursor-pointer ${
                            isFlipped ? 'rotate-y-180' : ''
                          }`}
                          style={{ transformStyle: 'preserve-3d' }}
                          onClick={() => setIsFlipped(!isFlipped)}
                        >
                          {/* وجه البطاقة */}
                          <div className={`absolute inset-0 w-full h-full rounded-xl flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 ${
                            isFlipped ? 'opacity-0' : 'opacity-100'
                          } transition-opacity duration-300 backface-hidden`}>
                            <div className="relative w-32 h-32 sm:w-48 sm:h-48 mb-3 sm:mb-6 rounded-lg overflow-hidden">
                              <img
                                src={currentCard.imagePath}
                                alt={currentCard.word}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = `https://placehold.co/192x192/10B981/34D399?text=${encodeURIComponent(currentCard.word)}`;
                                }}
                              />
                            </div>
                            <div className="text-center">
                              
                              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                انقر على البطاقة لرؤية المعنى
                              </p>
                            </div>
                          </div>

                          {/* ظهر البطاقة */}
                          <div className={`absolute inset-0 w-full h-full rounded-xl flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900 transform rotate-y-180 ${
                            isFlipped ? 'opacity-100' : 'opacity-0'
                          } transition-opacity duration-300 backface-hidden overflow-y-auto`}>
                            <div className="text-center">
                              <div className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400 mb-2 sm:mb-4">
                                {currentCard.meaning}
                              </div>
                              <div className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400 mb-2 sm:mb-4">
                                {currentCard.word}
                              </div>
                              
                              <div className="relative w-24 h-24 sm:w-32 sm:h-32 mb-4 sm:mb-6 rounded-lg overflow-hidden mx-auto">
                                <img
                                  src={currentCard.imagePath}
                                  alt={currentCard.word}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = `https://placehold.co/128x128/10B981/34D399?text=${encodeURIComponent(currentCard.word)}`;
                                  }}
                                />
                              </div>
                              
                              {showTranslation && (
                                <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                                  <div className="text-gray-700 dark:text-gray-300 p-2 sm:p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                                    {currentCard.englishExample}
                                  </div>
                                  <div className="text-gray-700 dark:text-gray-300 p-2 sm:p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                                    {currentCard.arabicExample}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* أزرار الإجابة */}
                        <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-4 sm:mb-6">
                          <Button
                            onClick={markCorrect}
                            className="h-12 sm:h-16 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-xs sm:text-sm"
                            size="sm"
                          >
                            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 ml-1 sm:ml-2" />
                            <span className="hidden sm:inline">صحيح - أعرف الإجابة</span>
                            <span className="sm:hidden">صحيح</span>
                          </Button>
                          
                          <Button
                            onClick={markWrong}
                            className="h-12 sm:h-16 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-xs sm:text-sm"
                            size="sm"
                          >
                            <XCircle className="w-4 h-4 sm:w-5 sm:h-5 ml-1 sm:ml-2" />
                            <span className="hidden sm:inline">خطأ - أريد رؤية الإجابة</span>
                            <span className="sm:hidden">خطأ</span>
                          </Button>
                        </div>

                        {/* أزرار التنقل */}
                        <div className="flex items-center justify-between gap-2 sm:gap-4">
                          <Button
                            onClick={prevCard}
                            variant="outline"
                            disabled={currentCardIndex === 0}
                            size="sm"
                            className="flex-1 text-xs sm:text-sm"
                          >
                            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                            السابقة
                          </Button>
                          
                          <Button
                            onClick={nextCard}
                            variant="outline"
                            disabled={currentCardIndex >= shuffledCards.length - 1}
                            size="sm"
                            className="flex-1 text-xs sm:text-sm"
                          >
                            التالية
                            <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                        </div>

                        {/* تلميح */}
                        <div className="mt-4 p-2 sm:p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg">
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 text-center">
                            💡 انقر على البطاقة لقلبها ورؤية المعنى والتفاصيل
                          </p>
                        </div>
                      </div>
                    )}

                    {/* رسالة انتهاء البطاقات */}
                    {gameState === 'playing' && !currentCard && (
                      <div className="text-center">
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                          لقد انتهيت من جميع البطاقات!
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                          اضغط على الزر أدناه لرؤية النتائج
                        </p>
                        <Button
                          onClick={endGame}
                          className="bg-gradient-to-r from-green-500 to-emerald-500"
                          size="lg"
                        >
                          رؤية النتائج
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default FlashcardsGame;