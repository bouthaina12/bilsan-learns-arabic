import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from "@/components/ui/card";
import { 
  Puzzle, Trophy, Star, Play, TrendingUp, 
  Clock, Users, Award, Zap, Sparkles, Gamepad2,
  Brain, Target, Volume2, GraduationCap
} from 'lucide-react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { playSound } from "@/hooks/useScrollAnimation";

import puzzlePreview from '@/assets/images/preview.jpg';
import flashcardsPreview from '@/assets/images/flashcards-preview.jpg';
import memoryGameImage from '@/assets/images/memory-game.jpg';
import wordRaceImage from '@/assets/images/word-race.jpg';
import listeningImage from '@/assets/images/listening-game.jpg';
import l from '@/assets/images/7.png';

interface Game {
  id: number;
  title: string;
  description: string;
  icon: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  estimatedTime: string;
  completed: boolean;
  highScore?: number;
  image: any;
}

interface GameStat {
  totalGames: number;
  completedGames: number;
  totalPoints: number;
  averageScore: number;
  favoriteGame: string;
}

const GamesPage = () => {
  const navigate = useNavigate();
  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;

  const [games, setGames] = useState<Game[]>([
    {
      id: 1,
      title: 'لعبة الصور المتزلقة',
      description: 'رتب قطع الصورة المتزلقة لتشكيل صورة كاملة واكتشف الكلمة المخفية',
      icon: 'puzzle',
      category: 'ألعاب التفكير',
      difficulty: 'medium',
      points: 50,
      estimatedTime: '5-10 دقائق',
      completed: false,
      highScore: 0,
      image: puzzlePreview
    },
    {
      id: 2,
      title: 'البطاقات التعليمية',
      description: 'تعلم كلمات جديدة من خلال بطاقات تعليمية تفاعلية مع صور ونطق',
      icon: 'cards',
      category: 'ألعاب التعلم',
      difficulty: 'easy',
      points: 50,
      estimatedTime: '3-5 دقائق',
      completed: false,
      highScore: 0,
      image: flashcardsPreview
    },
    {
      id: 3,
      title: 'حقيبة الكلمات ',
      description: 'افتح الحقيبة واكتشف الكلمات المخفية من خلال تذكر مواقعها في اللعبة',
      icon: 'target',
      category: 'ألعاب الذاكرة',
      difficulty: 'hard',
      points: 75,
      estimatedTime: '4-8 دقائق',
      completed: false,
      highScore: 0,
      image: wordRaceImage
    },
    {
      id: 4,
      title: 'كلمات وصور ',
      description: ' كلمات وصور: لعبة تفاعلية تجمع بين السرعة والتعلم، حيث يتعين عليك ربط الكلمات بالصور الصحيحة ',
      icon: 'zap',
      category: 'ألعاب التعلم',
      difficulty: 'easy',
      points: 80,
      estimatedTime: '5-10 دقائق',
      completed: false,
      highScore: 0,
      image: l
    },
{
  id: 5,
  title: 'مُبدعو الحروف: أسرار بلاد بيلسان',
  description: 'تسابق مع الوقت لكتابة أكبر عدد من الكلمات الصحيحة واجمع أكبر قدر من النقاط',
  icon: 'volume2',
  category: 'ألعاب المهارات',
  difficulty: 'medium',
  points: 90,
  estimatedTime: '6-12 دقائق',
  completed: false,
  highScore: 0,
  image: listeningImage 
}
  ]);

  const [stats, setStats] = useState<GameStat>({
    totalGames: 5,
    completedGames: 0,
    totalPoints: 0,
    averageScore: 0,
    favoriteGame: 'لم تلعب بعد'
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // First useEffect - Load saved data only once on mount
  useEffect(() => {
    if (!user) {
      window.location.href = '/login';
      return;
    }

    // Load saved stats
    const savedStats = localStorage.getItem(`game-stats-${user.id}`);
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }

    // Load saved games progress
    const savedGames = localStorage.getItem(`games-progress-${user.id}`);
    if (savedGames) {
      const parsedGames = JSON.parse(savedGames);
      setGames(prevGames => 
        prevGames.map(game => {
          const savedGame = parsedGames.find((g: Game) => g.id === game.id);
          return savedGame ? { ...game, completed: savedGame.completed, highScore: savedGame.highScore } : game;
        })
      );
    }

    playSound('click');
  }, []); // Empty dependency array - runs only once

  // Second useEffect - Save data when games change
  useEffect(() => {
    if (user && games.length > 0) {
      // Save games progress (without images to avoid storage issues)
      const gamesToSave = games.map(({ image, ...rest }) => rest);
      localStorage.setItem(`games-progress-${user.id}`, JSON.stringify(gamesToSave));
      
      // Update statistics
      const completedGames = games.filter(game => game.completed).length;
      const totalPoints = games.reduce((sum, game) => sum + (game.highScore || 0), 0);
      const averageScore = completedGames > 0 ? Math.round(totalPoints / completedGames) : 0;
      
      const favoriteGame = games.length > 0 
        ? games.reduce((prev, current) => 
            (prev.highScore || 0) > (current.highScore || 0) ? prev : current
          ).title
        : 'لم تلعب بعد';

      const newStats = {
        totalGames: games.length,
        completedGames,
        totalPoints,
        averageScore,
        favoriteGame
      };

      setStats(newStats);
      localStorage.setItem(`game-stats-${user.id}`, JSON.stringify(newStats));
    }
  }, [games, user]); // Only runs when games or user changes

  const filteredGames = selectedCategory === 'all' 
    ? games 
    : games.filter(game => game.category === selectedCategory);

  const categories = ['all', 'ألعاب التفكير', 'ألعاب التعلم', 'ألعاب الذاكرة', 'ألعاب السرعة', 'ألعاب المهارات'];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'puzzle': return <Puzzle className="w-6 h-6" />;
      case 'cards': return <GraduationCap className="w-6 h-6" />;
      case 'zap': return <Zap className="w-6 h-6" />;
      case 'sparkles': return <Sparkles className="w-6 h-6" />;
      case 'trendingUp': return <TrendingUp className="w-6 h-6" />;
      case 'brain': return <Brain className="w-6 h-6" />;
      case 'target': return <Target className="w-6 h-6" />;
      case 'volume2': return <Volume2 className="w-6 h-6" />;
      default: return <Gamepad2 className="w-6 h-6" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const handlePlayGame = (gameId: number) => {
    playSound('click');
    
    switch (gameId) {
      case 1:
        navigate('/student-dashboard/games/puzzle');
        break;
      case 2:
        navigate('/student-dashboard/games/flashcards');
        break;
      case 3:
        navigate('/student-dashboard/games/memory');
        break;
      case 4:
        navigate('/student-dashboard/games/word-race');
        break;
      case 5:
        navigate('/student-dashboard/games/listening');
        break;
      default:
        playSound('wrong');
        alert('اللعبة قيد التطوير!');
    }
  };

  if (!user) return null;

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full bg-gradient-to-br from-pink-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 font-arabic" dir="rtl">
        <div className="fixed right-0 top-0 h-screen z-40 w-64">
          <DashboardSidebar 
            userType="student" 
            userName={user?.username}
            progress={65} 
          />
        </div>

        <div className="mr-64 min-h-screen">
          <header className="bg-white shadow-sm border-b dark:bg-gray-800 dark:border-gray-700">
            <div className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold text-primary">ألعاب تعليمية</h1>
              </div>
            </div>
          </header>

          <main className="p-6">
           


            {/* Games Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGames.map((game) => (
                <Card 
                  key={game.id} 
                  className={`group border-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl overflow-hidden ${
                    game.completed 
                      ? 'border-green-500 dark:border-green-400' 
                      : 'border-transparent'
                  }`}
                >
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30">
                    {game.image && typeof game.image === 'string' ? (
                      <img
                        src={game.image}
                        alt={game.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://via.placeholder.com/400x300?text=Game';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-200 to-purple-200">
                        {getIcon(game.icon)}
                      </div>
                    )}
                    
                    <div className="absolute top-3 right-3">
                      <span className={`px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg ${getDifficultyColor(game.difficulty)}`}>
                        {game.difficulty === 'easy' && 'سهل'}
                        {game.difficulty === 'medium' && 'متوسط'}
                        {game.difficulty === 'hard' && 'صعب'}
                      </span>
                    </div>
                    
                    {game.completed && (
                      <div className="absolute top-3 left-3">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 shadow-lg">
                          ✓ مكتمل
                        </span>
                      </div>
                    )}
                    
                    <div className="absolute bottom-3 right-3">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-white shadow-lg">
                        +{game.points} نقطة
                      </span>
                    </div>
                    
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                      <h3 className="font-bold text-lg text-white">{game.title}</h3>
                      <p className="text-white/90 text-sm mt-1">{game.category}</p>
                    </div>
                  </div>

                  <div className="p-5">
                    <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm leading-relaxed">
                      {game.description}
                    </p>

                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{game.estimatedTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>فردي</span>
                      </div>
                    </div>

                    <Button
                      onClick={() => handlePlayGame(game.id)}
                      className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                      size="lg"
                    >
                      <Play className="w-4 h-4 ml-2" />
                      {game.completed ? 'العب مرة أخرى' : 'العب الآن'}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Instructions */}
            <div className="mt-12">
              <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-0 p-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  كيف تلعب وتكسب؟
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold">1</div>
                      <h3 className="font-bold text-gray-800 dark:text-white">اختر لعبة</h3>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      اختر من مجموعة ألعابنا التعليمية المناسبة لمستواك
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold">2</div>
                      <h3 className="font-bold text-gray-800 dark:text-white">العب وتعلم</h3>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      استمتع باللعبة وتعلم مهارات جديدة بطريقة ممتعة
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold">3</div>
                      <h3 className="font-bold text-gray-800 dark:text-white">اكسب نقاطاً</h3>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      احصل على نقاط ومكافآت وارفع مستوى مهاراتك
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default GamesPage;