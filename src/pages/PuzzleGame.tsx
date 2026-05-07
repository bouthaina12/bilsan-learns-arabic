import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Home, RotateCw, Trophy, Timer, Star, ChevronRight,
  Volume2, VolumeX, HelpCircle, Award, RefreshCw, 
  Image as ImageIcon, Grid3x3, LayoutGrid
} from 'lucide-react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { playSound, playSoundSequence } from "@/hooks/useScrollAnimation";
import { toast } from '@/components/ui/sonner';

interface PuzzleImage {
  id: number;
  name: string;
  category: string;
  word: string;
  description: string;
  folderName: string;
  gridSizes: number[];
  difficulty: 'easy' | 'medium' | 'hard';
}

interface Tile {
  id: number;
  position: number;
  imageUrl: string;
  correctPosition: number;
  row: number;
  col: number;
}

const PuzzleGame = () => {
  const navigate = useNavigate();
  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;

  const [gameState, setGameState] = useState<'ready' | 'playing' | 'completed'>('ready');
  const [time, setTime] = useState(0);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showHint, setShowHint] = useState(false);
  const [gridSize, setGridSize] = useState(3);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [emptyIndex, setEmptyIndex] = useState(0);
  const [currentImage, setCurrentImage] = useState(0);
  const [isShuffling, setIsShuffling] = useState(false);

  const puzzleImages: PuzzleImage[] = [
    {
      id: 1,
      name: 'قرقنة',
      category: 'قرقنة',
      word: 'قرقنة',
      description: 'قرقنة  ',
      folderName: 'apple',
      gridSizes: [3],
      difficulty: 'easy'
    },
    {
      id: 2,
      name: 'أسد',
      category: 'حيوانات',
      word: 'أسد',
      description: 'صورة أسد ملك الغابة',
      folderName: 'lion',
      gridSizes: [3],
      difficulty: 'medium'
    }
  ];

  // أحجام أكبر للوحة اللعبة
  const getBoardSize = () => {
    if (gridSize === 3) return { width: 450, height: 500 }; // حجم أكبر لـ 3x3
    return { width: 600, height: 700 }; // حجم أكبر لـ 4x4
  };

  const getTileImageUrl = (folderName: string, gridSize: number, tileId: number): string => {
    if (tileId === 0) {
      return `/src/assets/games/puzzle/${folderName}/${gridSize}x${gridSize}/empty.jpg`;
    }
    return `/src/assets/games/puzzle/${folderName}/${gridSize}x${gridSize}/${tileId}.jpg`;
  };

  const getPreviewImageUrl = (folderName: string): string => {
    return `/src/assets/games/puzzle/${folderName}/preview.jpg`;
  };

  // دالة مساعدة لإنشاء القطع
  const createTiles = useCallback((imageIndex: number) => {
    const selectedImage = puzzleImages[imageIndex];
    const size = gridSize;
    const totalTiles = size * size;
    
    const tilesArray: Tile[] = [];
    let tileId = 1;
    
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        const position = row * size + col;
        
        if (tileId < totalTiles) {
          tilesArray.push({
            id: tileId,
            position,
            imageUrl: getTileImageUrl(selectedImage.folderName, size, tileId),
            correctPosition: position,
            row,
            col
          });
          tileId++;
        } else {
          tilesArray.push({
            id: 0,
            position,
            imageUrl: getTileImageUrl(selectedImage.folderName, size, 0),
            correctPosition: position,
            row,
            col
          });
        }
      }
    }
    
    return { tilesArray, totalTiles };
  }, [gridSize]);

  // تهيئة اللعبة
  const initializeGame = useCallback(() => {
    const { tilesArray, totalTiles } = createTiles(currentImage);
    
    setTiles(tilesArray);
    setEmptyIndex(totalTiles - 1);
    setTime(0);
    setMoves(0);
    setScore(0);
    setGameState('ready');
    setShowHint(false);
    
    playSound('click');
  }, [currentImage, createTiles]);

  // خلط القطع
  const shuffleTiles = useCallback(() => {
    if (isShuffling) return;
    
    setIsShuffling(true);
    playSound('whoosh');
    
    const { tilesArray, totalTiles } = createTiles(currentImage);
    let newTiles = tilesArray;
    let newEmptyIndex = totalTiles - 1;
    
    const shuffleMoves = totalTiles * 20;
    const directions = [-gridSize, gridSize, -1, 1];
    
    for (let i = 0; i < shuffleMoves; i++) {
      const possibleMoves = directions
        .map(dir => newEmptyIndex + dir)
        .filter(index => 
          index >= 0 && 
          index < totalTiles &&
          Math.abs((index % gridSize) - (newEmptyIndex % gridSize)) <= 1
        );
      
      if (possibleMoves.length > 0) {
        const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        [newTiles[newEmptyIndex], newTiles[randomMove]] = [newTiles[randomMove], newTiles[newEmptyIndex]];
        newTiles[newEmptyIndex].position = newEmptyIndex;
        newTiles[randomMove].position = randomMove;
        newEmptyIndex = randomMove;
      }
    }
    
    setTimeout(() => {
      setTiles(newTiles);
      setEmptyIndex(newEmptyIndex);
      setIsShuffling(false);
      setGameState('playing');
    }, 500);
  }, [currentImage, gridSize, isShuffling, createTiles]);

  // التحقق من اكتمال اللعبة
  const checkCompletion = async (currentTiles: Tile[]) => {
    const isSolved = currentTiles.every((tile, index) => 
      tile.id === 0 ? index === currentTiles.length - 1 : tile.position === tile.correctPosition
    );
    
    if (isSolved && gameState === 'playing') {
      setGameState('completed');
      
      const timeBonus = Math.max(500 - time, 0);
      const movesBonus = Math.max(200 - moves, 0);
      const sizeBonus = gridSize * 100;
      const difficultyBonus = puzzleImages[currentImage].difficulty === 'hard' ? 200 : 
                            puzzleImages[currentImage].difficulty === 'medium' ? 100 : 50;
      
      const totalScore = timeBonus + movesBonus + sizeBonus + difficultyBonus;
      setScore(totalScore);
      
      playSoundSequence([
        { type: 'success', delay: 0 },
        { type: 'tada', delay: 300 },
        { type: 'confetti', delay: 600 }
      ]);
      
      if (user) {
        const savedScores = JSON.parse(localStorage.getItem(`puzzle-scores-${user.id}`) || '[]');
        savedScores.push({
          score: totalScore,
          time,
          moves,
          gridSize,
          image: puzzleImages[currentImage].name,
          date: new Date().toISOString()
        });
        localStorage.setItem(`puzzle-scores-${user.id}`, JSON.stringify(savedScores));
              // 2. تحديث النقاط في قاعدة البيانات
        const response = await fetch('/api/update-score.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: user.id,
            points: totalScore
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
    }
  };

  // تحريك القطعة
  const moveTile = (index: number) => {
    if (gameState !== 'playing' || index === emptyIndex) return;
    
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    const emptyRow = Math.floor(emptyIndex / gridSize);
    const emptyCol = emptyIndex % gridSize;
    
    const isAdjacent = 
      (row === emptyRow && Math.abs(col - emptyCol) === 1) ||
      (col === emptyCol && Math.abs(row - emptyRow) === 1);
    
    if (isAdjacent) {
      const newTiles = [...tiles];
      [newTiles[emptyIndex], newTiles[index]] = [newTiles[index], newTiles[emptyIndex]];
      newTiles[emptyIndex].position = emptyIndex;
      newTiles[index].position = index;
      
      setTiles(newTiles);
      setEmptyIndex(index);
      setMoves(prev => prev + 1);
      
      if (soundEnabled) playSound('click');
      setTimeout(() => checkCompletion(newTiles), 100);
    }
  };

  // تغيير حجم الشبكة
  const changeGridSize = (size: number) => {
    if (gameState === 'playing') {
      if (!window.confirm('سيتم إعادة تعيين اللعبة. هل تريد المتابعة؟')) return;
    }
    
    setGridSize(size);
  };

  // تغيير الصورة
  const changeImage = (direction: 'next' | 'prev') => {
 
    
    const newIndex = direction === 'next' 
      ? (currentImage + 1) % puzzleImages.length
      : (currentImage - 1 + puzzleImages.length) % puzzleImages.length;
    
    setCurrentImage(newIndex);
    playSound('click');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // عرض قطعة الصورة مع تحسينات
  const renderTile = (tile: Tile, index: number) => {
    const isAdjacentToEmpty = () => {
      const row = Math.floor(index / gridSize);
      const col = index % gridSize;
      const emptyRow = Math.floor(emptyIndex / gridSize);
      const emptyCol = emptyIndex % gridSize;
      
      return (row === emptyRow && Math.abs(col - emptyCol) === 1) ||
             (col === emptyCol && Math.abs(row - emptyRow) === 1);
    };

    if (tile.id === 0) {
      return (
        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-lg flex items-center justify-center">
          <span className="text-gray-400 dark:text-gray-500 text-sm">فارغ</span>
        </div>
      );
    }

    const isMovable = gameState === 'playing' && isAdjacentToEmpty();

    return (
      <button
        onClick={() => moveTile(index)}
        className={`w-full h-full rounded-lg overflow-hidden transition-all duration-200 ${
          isMovable 
            ? 'hover:scale-105 active:scale-95 cursor-pointer ring-2 ring-offset-2 ring-indigo-500' 
            : 'cursor-default'
        } ${
          tile.position === tile.correctPosition && gameState === 'playing'
            ? 'border-2 border-green-500'
            : ''
        }`}
        disabled={!isMovable}
      >
        <div className="relative w-full h-full">
          <img
            src={tile.imageUrl}
            alt={`قطعة ${tile.id}`}
            className="w-full h-full object-contain" // تغيير object-cover إلى object-contain
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.innerHTML = `
                  <div class="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50">
                    <span class="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                      ${tile.id}
                    </span>
                    ${showHint ? `<span class="text-sm text-gray-500 dark:text-gray-400 mt-2">قطعة ${tile.id}</span>` : ''}
                  </div>
                `;
              }
            }}
            style={{
              maxWidth: '100%',
              maxHeight: '100%'
            }}
          />
          {showHint && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">
                {tile.id}
              </span>
            </div>
          )}
          {gameState === 'playing' && isMovable && (
            <div className="absolute inset-0 border-4 border-dashed border-indigo-400 pointer-events-none" />
          )}
        </div>
      </button>
    );
  };

  // مؤقت
  useEffect(() => {
    let timer: number;
    if (gameState === 'playing') {
      timer = setInterval(() => setTime(prev => prev + 1), 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [gameState]);

  // تهيئة عند التحميل
  useEffect(() => {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    initializeGame();
    playSound('bookOpen');
  }, []);

  // تحديث اللعبة عند تغيير الصورة
  useEffect(() => {
    initializeGame();
  }, [currentImage, initializeGame]);

  // تحديث اللعبة عند تغيير الحجم
  useEffect(() => {
    initializeGame();
  }, [gridSize, initializeGame]);

  // تشغيل اللعبة تلقائياً بعد التهيئة
  useEffect(() => {
    if (tiles.length > 0 && gameState === 'ready' && !isShuffling) {
      const timer = setTimeout(() => {
        shuffleTiles();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [tiles, gameState, isShuffling, shuffleTiles]);

  const currentImageData = puzzleImages[currentImage];
  const boardSize = getBoardSize();

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
          <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b dark:border-gray-700">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/student-dashboard/games')}
                    className="flex items-center gap-2"
                  >
                    <Home className="w-4 h-4" />
                    العودة للألعاب
                  </Button>
                  <h1 className="text-xl font-bold text-gray-800 dark:text-white">
                    لعبة الصور المتزلقة
                  </h1>
                </div>
                
                <div className="flex items-center gap-3">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className="flex items-center gap-1"
                  >
                    {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowHint(!showHint)}
                    className="flex items-center gap-1"
                  >
                    <HelpCircle className="w-4 h-4" />
                    {showHint ? 'إخفاء الأرقام' : 'إظهار الأرقام'}
                  </Button>
                </div>
              </div>
            </div>
          </header>

          <main className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-6">
                <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 p-5">
                  <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-indigo-500" />
                    معلومات الصورة
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="relative w-full h-48 overflow-hidden rounded-lg mb-4">
                      <img
                        src={getPreviewImageUrl(currentImageData.folderName)}
                        alt={currentImageData.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://placehold.co/300x200/4F46E5/7C3AED?text=${encodeURIComponent(currentImageData.name)}`;
                        }}
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                        <p className="text-white font-bold">{currentImageData.name}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">اسم الصورة:</span>
                        <span className="font-bold text-gray-800 dark:text-white">
                          {currentImageData.name}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">الكلمة:</span>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">
                          {currentImageData.word}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">التصنيف:</span>
                        <span className="text-gray-800 dark:text-white">
                          {currentImageData.category}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">الصعوبة:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          currentImageData.difficulty === 'easy' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : currentImageData.difficulty === 'medium'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                        }`}>
                          {currentImageData.difficulty === 'easy' ? 'سهل' : 
                           currentImageData.difficulty === 'medium' ? 'متوسط' : 'صعب'}
                        </span>
                      </div>
                      
                      <div className="mt-2 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
                          {currentImageData.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 p-5">
                  <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">إحصائيات اللعبة</h2>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg">
                      <Timer className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-800 dark:text-white">{formatTime(time)}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">الوقت</div>
                    </div>
                    
                    <div className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                      <RefreshCw className="w-6 h-6 text-green-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-800 dark:text-white">{moves}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">الحركات</div>
                    </div>
                    
                    <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
                      <Award className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-800 dark:text-white">{score}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">النقاط</div>
                    </div>
                    
                    <div className="text-center p-3 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg">
                      <Star className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-800 dark:text-white">{gridSize}x{gridSize}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">الحجم</div>
                    </div>
                  </div>
                </Card>

                <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 p-5">
                  <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">التحكم</h2>
                  
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        onClick={initializeGame}
                        variant="outline"
                        className="w-full"
                        disabled={isShuffling}
                      >
                        <RotateCw className="w-4 h-4 ml-2" />
                        إعادة تعيين
                      </Button>
                      
                      <Button
                        onClick={shuffleTiles}
                        className="w-full bg-gradient-to-r from-indigo-500 to-purple-500"
                        disabled={gameState === 'playing' || isShuffling}
                      >
                        {gameState === 'ready' ? 'ابدأ اللعبة' : 'إعادة خلط'}
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">تغيير الحجم:</p>
                      <div className="flex gap-2">
                        {currentImageData.gridSizes.map(size => (
                          <Button
                            key={size}
                            variant={gridSize === size ? "default" : "outline"}
                            onClick={() => changeGridSize(size)}
                            className={`flex-1 flex items-center justify-center gap-1 ${
                              gridSize === size ? 'bg-gradient-to-r from-indigo-500 to-purple-500' : ''
                            }`}
                          >
                            {size === 3 ? <Grid3x3 className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
                            {size}x{size}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">تغيير الصورة:</p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => changeImage('prev')}
                          className="flex-1"
                          disabled={isShuffling}
                        >
                          <ChevronRight className="w-4 h-4" />
                          السابقة
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => changeImage('next')}
                          className="flex-1"
                          disabled={isShuffling}
                        >
                          التالية
                          <ChevronRight className="w-4 h-4 rotate-180" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm pt-2 border-t dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400">
                        {currentImage + 1} / {puzzleImages.length}
                      </span>
                      <span className="font-medium text-indigo-600 dark:text-indigo-400">
                        {puzzleImages.length} صورة متاحة
                      </span>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="lg:col-span-2">
                <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 p-6 h-full">
                  <div className="flex flex-col items-center justify-center h-full">
                    {gameState === 'completed' && (
                      <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
                        <div className="text-center p-8 bg-white/90 dark:bg-gray-800/90 rounded-xl shadow-2xl max-w-md">
                          <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Trophy className="w-8 h-8 text-white" />
                          </div>
                          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                            أحسنت! لقد أكملت اللغز
                          </h3>
                          <div className="space-y-3 mb-6">
                            <div className="flex justify-between">
                              <span>الصورة:</span>
                              <span className="font-bold">{currentImageData.name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>الحجم:</span>
                              <span className="font-bold">{gridSize}x{gridSize}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>الوقت:</span>
                              <span className="font-bold">{formatTime(time)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>الحركات:</span>
                              <span className="font-bold">{moves}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold text-indigo-600 dark:text-indigo-400">
                              <span>النقاط:</span>
                              <span>{score}</span>
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
                              className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500"
                            >
                              العودة للألعاب
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mb-6 text-center">
                      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                        رتب قطع الصورة لاستكمال الصورة الكاملة
                      </h2>
                      <p className="text-gray-600 dark:text-gray-300">
                        انقر على القطعة المجاورة للمربع الفارغ لتحريكها
                      </p>
                    </div>

                    {/* شبكة اللعبة - حجم أكبر */}
                    <div 
                      className={`grid gap-1 mb-8 border-4 border-indigo-300 dark:border-indigo-700 bg-indigo-50/30 dark:bg-indigo-900/20 p-1 rounded-xl ${
                        gridSize === 3 ? 'grid-cols-3' : 'grid-cols-4'
                      }`}
                      style={{
                        width: `${boardSize.width}px`,
                        height: `${boardSize.height}px`,
                        maxWidth: '100%',
                        maxHeight: '100%'
                      }}
                    >
                      {tiles.map((tile, index) => (
                        <div 
                          key={`${currentImage}-${tile.id}-${index}`} 
                          className="w-full h-full p-1"
                        >
                          {renderTile(tile, index)}
                        </div>
                      ))}
                    </div>

                    <div className="text-center mb-6">
                      {gameState === 'ready' && isShuffling && (
                        <div className="flex items-center justify-center gap-3">
                          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                          <p className="text-lg text-indigo-600 dark:text-indigo-400">
                            جاري تحضير اللعبة...
                          </p>
                        </div>
                      )}
                      {gameState === 'ready' && !isShuffling && tiles.length === 0 && (
                        <p className="text-lg text-gray-600 dark:text-gray-300">
                          جاري تحميل الصور...
                        </p>
                      )}
                      {gameState === 'playing' && (
                        <div className="space-y-2">
                          <p className="text-lg text-green-600 dark:text-green-400 font-bold">
                            جاري اللعب... استمر في ترتيب القطع!
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            يمكنك تحريك القطع ذات الحدود المنقطة فقط
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 rounded-lg">
                      <h3 className="font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        الصورة الكاملة التي تحاول تكوينها:
                      </h3>
                      <div className="relative w-52 h-52 mx-auto overflow-hidden rounded-lg border-2 border-indigo-300 dark:border-indigo-700">
                        <img
                          src={getPreviewImageUrl(currentImageData.folderName)}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://placehold.co/208x208/4F46E5/7C3AED?text=${encodeURIComponent(currentImageData.name)}`;
                          }}
                        />
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg">
                      <h3 className="font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
                        <HelpCircle className="w-4 h-4" />
                        كيفية اللعب:
                      </h3>
                      <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                        <li>• انقر على أي قطعة مجاورة للمربع الفارغ لتحريكها</li>
                        <li>• القطع القابلة للتحريك لها حدود منقطة</li>
                        <li>• هدفك هو تكوين الصورة الكاملة</li>
                        <li>• حاول إكمال اللعبة بأقل وقت وحركات ممكنة</li>
                        <li>• استخدم معاينة الصورة كدليل لك</li>
                      </ul>
                    </div>
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

export default PuzzleGame;