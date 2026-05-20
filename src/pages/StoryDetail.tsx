import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Maximize2, Minimize2, Play, Pause, Volume2, VolumeX, Home, 
  BookOpen, Download, Bookmark, Share2, Loader2,
  ChevronRight, ChevronLeft, SkipBack, SkipForward,
  Music, Repeat, Shuffle,
  Settings,
  Star,
  Edit3,
  Heart,
  Sparkles
} from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import HTMLFlipBook from "react-pageflip";
import { playSound, playCelebrationSounds, playQuizCompleteSounds, playLessonCompleteSounds } from "@/hooks/useScrollAnimation";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
// تعريف global لـ pdfjsLib
declare global {
  interface Window {
    pdfjsLib?: any;
  }
}

interface Story {
  id: number;
  title: string;
  description: string;
  pdf_path: string;
  cover_image: string;
  category: string;
  difficulty_level: string;
  pages_count: number;
  audio_file: string | null; // إضافة حقل ملف الصوت
}

interface PDFPage {
  pageNum: number;
  imgUrl: string;
  width: number;
  height: number;
  isLoaded: boolean;
}

interface AudioSegment {
  pageNum: number;
  startTime: number;
  endTime: number;
  title?: string;
}
// تعريف واجهة نموذج الأطفال
interface KidsFormData {
  id?: number;
  story_id: number;
  user_id: number;
  liked_words: string;
  summary_arabic: string;
  favorite_part: string;
  desired_changes: string;
  favorite_paragraph: string;
  submitted_at?: string;
}
const StoryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;

  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // حالات الكتاب المقلب
  const [pages, setPages] = useState<PDFPage[]>([]);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isBookmarkAdded, setIsBookmarkAdded] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  // حالات مشغل الصوت
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isLooping, setIsLooping] = useState(false);
  const [showAudioControls, setShowAudioControls] = useState(false);
  
  // مقاطع الصوت المتزامنة مع الصفحات
  const [audioSegments, setAudioSegments] = useState<AudioSegment[]>([
    { pageNum: 1, startTime: 0, endTime: 30, title: "مقدمة القصة" },
    { pageNum: 2, startTime: 30, endTime: 65, title: "البداية" },
    // يمكن إضافة المزيد حسب عدد الصفحات
  ]);
  // حالات نموذج الأطفال
  const [showKidsForm, setShowKidsForm] = useState(false);
  const [kidsForm, setKidsForm] = useState<KidsFormData>({
    story_id: parseInt(id || '0'),
    user_id: user?.id || 0,
    liked_words: '',
    summary_arabic: '',
    favorite_part: '',
    desired_changes: '',
    favorite_paragraph: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submissionId, setSubmissionId] = useState<number | null>(null);
  const flipSoundRef = useRef<HTMLAudioElement | null>(null);
  const storyAudioRef = useRef<HTMLAudioElement | null>(null);
  const fullScreenRef = useRef<HTMLDivElement>(null);
  const flipBookRef = useRef<any>(null);
  const isPdfjsLoaded = useRef(false);
  const progressIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!user) {
      window.location.href = '/login';
      return;
    }

    // تحميل مكتبة PDF.js من CDN بشكل ديناميكي
    const loadPdfjsLibrary = () => {
      if (!window.pdfjsLib && !isPdfjsLoaded.current) {
        isPdfjsLoaded.current = true;
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        script.onload = () => {
          window.pdfjsLib!.GlobalWorkerOptions.workerSrc = 
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          console.log('PDF.js loaded successfully');
        };
        script.onerror = () => {
          console.error('Failed to load PDF.js');
        };
        document.head.appendChild(script);
      }
    };

    loadPdfjsLibrary();

   // تشغيل صوت فتح الكتاب عند التحميل
    setTimeout(() => {
      if (soundEnabled) {
        playSound('bookOpen');
      }
    }, 500);

    fetchStory();
    checkExistingSubmission();

    return () => {
   
      
      if (storyAudioRef.current) {
        storyAudioRef.current.pause();
        storyAudioRef.current = null;
      }
      
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [id]);

  useEffect(() => {
    // عندما تتغير الصفحة، تحقق إذا كان هناك مقطع صوتي مخصص
    const segment = audioSegments.find(s => s.pageNum === currentPage + 1);
    if (segment && storyAudioRef.current && isAudioPlaying) {
      // الانتقال إلى وقت بداية المقطع
      storyAudioRef.current.currentTime = segment.startTime;
    }
  }, [currentPage, audioSegments, isAudioPlaying]);

  const fetchStory = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/stories.php?id=${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Story data:', data);
      
      if (data.success) {
        setStory(data.data);
        // تحميل PDF بعد الحصول على بيانات القصة
        loadPDF(data.data.pdf_path);
      } else {
        setError(data.message || 'فشل في تحميل القصة');
        setLoading(false);
      }
      
    } catch (err) {
      console.error('Error fetching story:', err);
      setError('حدث خطأ أثناء تحميل القصة');
      setLoading(false);
    }
  };

  const loadPDF = async (pdfPath: string) => {
    if (!window.pdfjsLib) {
      console.error('PDF.js library not loaded yet, retrying in 1 second...');
      setTimeout(() => loadPDF(pdfPath), 1000);
      return;
    }

    setPdfLoading(true);
    try {
      console.log('Loading PDF from:', pdfPath);
      
      // استخدام المسار المباشر للملف في مجلد src/assets
      const pdfUrl = `/src/assets/${pdfPath}`;
      console.log('PDF URL:', pdfUrl);
      
      const loadingTask = window.pdfjsLib.getDocument(pdfUrl);
      const pdf = await loadingTask.promise;
      
      const totalPages = pdf.numPages;
      console.log(`PDF loaded successfully. Total pages: ${totalPages}`);
      
      // تحميل جميع الصفحات دفعة واحدة
      const pagePromises = [];
      for (let i = 1; i <= totalPages; i++) {
        pagePromises.push(renderPage(pdf, i));
      }
      
      const renderedPages = await Promise.all(pagePromises);
      console.log(`All ${renderedPages.length} pages rendered`);
      
      setPages(renderedPages);
      setPdfLoading(false);
      setLoading(false);
      
    } catch (err) {
      console.error('Error loading PDF:', err);
      
      // إذا فشل تحميل PDF، أنشئ صفحات وهمية للاختبار
      console.log('Creating demo pages for testing...');
      createDemoPages();
      setPdfLoading(false);
      setLoading(false);
    }
  };

  const renderPage = async (pdf: any, pageNum: number): Promise<PDFPage> => {
    try {
      const page = await pdf.getPage(pageNum);
      
      // حساب حجم مناسب للعرض - حجم أصغر وأوضح للقراءة
      const viewport = page.getViewport({ scale: 1 });
      
      // تحديد حجم ثابت وواضح للصفحة (A5 size تقريباً)
      const targetWidth = 450; // حجم مناسب للقراءة بدون تمرير
      const targetHeight = 650;
      
      // حساب المقياس المناسب
      const scale = Math.min(targetWidth / viewport.width, targetHeight / viewport.height);
      const scaledViewport = page.getViewport({ scale });
      
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Could not get canvas context');
      
      canvas.height = scaledViewport.height;
      canvas.width = scaledViewport.width;
      
      // تعيين خلفية بيضاء للصفحة
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      
      await page.render({
        canvasContext: context,
        viewport: scaledViewport
      }).promise;
      
      return {
        pageNum,
        imgUrl: canvas.toDataURL('image/jpeg', 0.95), // جودة عالية
        width: canvas.width,
        height: canvas.height,
        isLoaded: true
      };
      
    } catch (err) {
      console.error(`Error rendering page ${pageNum}:`, err);
      // صفحة بديلة في حالة الخطأ
      return {
        pageNum,
        imgUrl: `https://placehold.co/450x650/FFFFFF/333333?text=صفحة+${pageNum}&font=arabic`,
        width: 450,
        height: 650,
        isLoaded: true
      };
    }
  };

  const createDemoPages = () => {
    if (!story) return;
    
    const demoPages: PDFPage[] = [];
    const totalPages = story.pages_count || 8;
    
    for (let i = 1; i <= totalPages; i++) {
      demoPages.push({
        pageNum: i,
        imgUrl: `https://placehold.co/450x650/FFFFFF/333333?text=${encodeURIComponent(story.title)}+صفحة+${i}&font=arabic`,
        width: 450,
        height: 650,
        isLoaded: true
      });
    }
    
    setPages(demoPages);
    console.log(`Created ${demoPages.length} demo pages`);
  };

  // ========== وظائف مشغل الصوت ==========
  const initAudioPlayer = () => {
    if (!story || !story.audio_file) return;
    
    if (storyAudioRef.current) {
      storyAudioRef.current.pause();
      storyAudioRef.current = null;
    }
    
    const audio = new Audio(`/src/assets/audio/${story.audio_file}`);
    storyAudioRef.current = audio;
    
    audio.addEventListener('loadedmetadata', () => {
      setAudioDuration(audio.duration);
      console.log('Audio duration:', audio.duration, 'seconds');
    });
    
    audio.addEventListener('timeupdate', () => {
      if (audio.duration) {
        const progress = (audio.currentTime / audio.duration) * 100;
        setAudioProgress(progress);
        setCurrentTime(audio.currentTime);
      }
    });
    
    audio.addEventListener('play', () => {
      setIsAudioPlaying(true);
      startProgressTracking();
    });
    
    audio.addEventListener('pause', () => {
      setIsAudioPlaying(false);
      stopProgressTracking();
    });
    
    audio.addEventListener('ended', () => {
      setIsAudioPlaying(false);
      stopProgressTracking();
      setAudioProgress(0);
      setCurrentTime(0);
      
      if (isLooping) {
        setTimeout(() => playAudio(), 500);
      }
    });
    
    audio.addEventListener('error', (e) => {
      console.error('Audio error:', e);
      setIsAudioPlaying(false);
      alert('حدث خطأ في تشغيل الملف الصوتي. تأكد من صحة الملف.');
    });
  };

  const startProgressTracking = () => {
    stopProgressTracking();
    progressIntervalRef.current = setInterval(() => {
      if (storyAudioRef.current) {
        const progress = (storyAudioRef.current.currentTime / audioDuration) * 100;
        setAudioProgress(progress);
        setCurrentTime(storyAudioRef.current.currentTime);
        
        // التحقق من الانتقال بين المقاطع بناءً على الوقت
        
      }
    }, 100);
  };

  const stopProgressTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };



  const playAudio = () => {
    if (!story || !story.audio_file) {
      playSound('click');
      alert('لا يوجد ملف صوتي لهذه القصة');
      return;
    }
    
    if (!storyAudioRef.current) {
      initAudioPlayer();
    }
    
    if (storyAudioRef.current) {
      storyAudioRef.current.play()
        .then(() => {
          setIsAudioPlaying(true);
        })
        .catch((error) => {
          console.error('Error playing audio:', error);
          alert('تعذر تشغيل الملف الصوتي. قد يكون الملف تالفاً أو غير مدعوم.');
        });
    }
  };

  const pauseAudio = () => {
    if (storyAudioRef.current) {
      storyAudioRef.current.pause();
      setIsAudioPlaying(false);
    }
  };

  const toggleAudio = () => {
    if (isAudioPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  };

  const handleAudioProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = parseFloat(e.target.value);
    setAudioProgress(newProgress);
    
    if (storyAudioRef.current && audioDuration) {
      const newTime = (newProgress / 100) * audioDuration;
      storyAudioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    
    if (storyAudioRef.current) {
      storyAudioRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    if (storyAudioRef.current) {
      storyAudioRef.current.muted = !storyAudioRef.current.muted;
      setIsMuted(storyAudioRef.current.muted);
    }
  };

  const toggleLoop = () => {
    if (storyAudioRef.current) {
      storyAudioRef.current.loop = !storyAudioRef.current.loop;
      setIsLooping(storyAudioRef.current.loop);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const skipForward = (seconds: number = 10) => {
    if (storyAudioRef.current) {
      storyAudioRef.current.currentTime += seconds;
    }
  };

  const skipBackward = (seconds: number = 10) => {
    if (storyAudioRef.current) {
      storyAudioRef.current.currentTime -= seconds;
    }
  };

  // ========== وظائف الكتاب المقلب ==========
  const onPageFlip = (e: any) => {
    setCurrentPage(e.data);
    
     if (soundEnabled) {
      playSound('whoosh');
    }
  
  };

  const goToNextPage = () => {
    if (flipBookRef.current && flipBookRef.current.pageFlip) {
      flipBookRef.current.pageFlip().flipNext();
    }
  };

  const goToPrevPage = () => {
    if (flipBookRef.current && flipBookRef.current.pageFlip) {
      flipBookRef.current.pageFlip().flipPrev();
    }
  };

  const toggleFullScreen = () => {
    if (!fullScreenRef.current) return;

    if (!document.fullscreenElement) {
      fullScreenRef.current.requestFullscreen().then(() => {
        setIsFullScreen(true);
        // إعادة تحميل الكتاب بحجم جديد
        if (flipBookRef.current && flipBookRef.current.pageFlip) {
          setTimeout(() => {
            flipBookRef.current.pageFlip().update();
          }, 100);
        }
      }).catch(err => {
        console.log(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullScreen(false);
        // إعادة تحميل الكتاب بحجم جديد
        if (flipBookRef.current && flipBookRef.current.pageFlip) {
          setTimeout(() => {
            flipBookRef.current.pageFlip().update();
          }, 100);
        }
      });
    }
  };

  const toggleSound = () => {
    setSoundEnabled(prev => !prev);
  };

  const handleDownload = () => {
    if (!story) return;
    
    // تنزيل ملف PDF
    const link = document.createElement('a');
    link.href = `/src/assets/${story.pdf_path}`;
    link.download = `${story.title}.pdf`;
    link.click();
  };

  const handleShare = () => {
    if (navigator.share && story) {
      navigator.share({
        title: story.title,
        text: story.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('تم نسخ الرابط إلى الحافظة!');
    }
  };
  // ========== وظائف نموذج الأطفال ==========
  const checkExistingSubmission = async () => {
    if (!user || !id) return;
    
    try {
      const response = await fetch(`/api/story-form.php?story_id=${id}&user_id=${user.id}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setHasSubmitted(true);
          setSubmissionId(result.data.id);
          setKidsForm(result.data);
        }
      }
    } catch (error) {
      console.error('Error checking submission:', error);
    }
  };

  const handleKidsFormSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!user || !id) {
    toast.error('يجب تسجيل الدخول أولاً');
    return;
  }

  setIsSubmitting(true);

  try {
    const formData = {
      story_id: parseInt(id),
      user_id: user.id,
      liked_words: kidsForm.liked_words,
      summary_arabic: kidsForm.summary_arabic,
      favorite_part: kidsForm.favorite_part,
      desired_changes: kidsForm.desired_changes,
      favorite_paragraph: kidsForm.favorite_paragraph
    };

    // استخدم POST دائماً، والـ API سيتعامل مع التحديث تلقائياً
    const response = await fetch('/api/story-form.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });

    const result = await response.json();

    if (!response.ok) {
      // إذا كان الخطأ 409، حاول استخدام PUT إذا كان لدينا submissionId
      if (response.status === 409 && submissionId) {
        const putResponse = await fetch(`/api/story-form.php?id=${submissionId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        });
        
        const putResult = await putResponse.json();
        
        if (!putResponse.ok) {
          throw new Error(putResult.error || putResult.message || 'حدث خطأ في التحديث');
        }
        
        handleSuccessfulSubmit(putResult, false);
        return;
      }
      throw new Error(result.error || result.message || 'حدث خطأ');
    }

    handleSuccessfulSubmit(result, result.is_new);

  } catch (error) {
    console.error('Error submitting form:', error);
    toast.error(error instanceof Error ? error.message : 'تعذر الاتصال بالخادم');
  } finally {
    setIsSubmitting(false);
  }
};

const handleSuccessfulSubmit = (result: any, isNew: boolean) => {
  if (result.success) {
    if (isNew) {
      // تشغيل أصوات الاحتفال فقط للإرسال الجديد
      playCelebrationSounds();
      
      // تحديث نقاط المستخدم في localStorage فقط للإرسال الجديد
      const updatedUser = { 
        ...user, 
        score: result.new_score || (user.score || 0) + 50 
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      toast.success(
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-500" />
          <span>
            تم حفظ إجابتك وإضافة {result.points_added || 50} نقطة لرصيدك!
          </span>
        </div>,
        {
          duration: 5000,
          icon: '🎉'
        }
      );
    } else {
      toast.success('تم تحديث إجابتك بنجاح!', {
        duration: 3000
      });
    }
    
    setHasSubmitted(true);
    if (result.data?.id) {
      setSubmissionId(result.data.id);
    }
    
    setTimeout(() => {
      setShowKidsForm(false);
    }, 2000);
    
  } else {
    throw new Error(result.error || result.message || 'حدث خطأ أثناء الحفظ');
  }
};

  const handleKidsFormChange = (field: keyof KidsFormData, value: string) => {
    setKidsForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleKidsForm = () => {
    setShowKidsForm(!showKidsForm);
    if (!showKidsForm && soundEnabled) {
      playSound('click');
    }
  };
  // ========== التصميم ==========
  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-orange-500 mx-auto mb-6"></div>
          <p className="text-gray-700 dark:text-gray-300 text-lg">جاري تحميل القصة...</p>
        </div>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center max-w-md p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">حدث خطأ</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error || 'القصة غير موجودة'}</p>
          <Button 
            onClick={() => navigate('/student-dashboard/stories')}
            className="bg-gradient-to-r from-orange-400 to-yellow-400 hover:from-orange-500 hover:to-yellow-500 text-white font-bold py-3 px-6 rounded-xl"
          >
            العودة إلى المكتبة
          </Button>
        </div>
      </div>
    );
  }

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
                  onClick={() => navigate('/student-dashboard/stories')}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="w-5 h-5" />
                  العودة للقصص
                </Button>
                <h1 className="text-xl font-bold text-primary"> {story.title}</h1>
              </div>
              <div className="flex items-center gap-2">
                  {story.audio_file && (
                    <Button 
                      variant={isAudioPlaying ? "default" : "outline"}
                      size="sm"
                      onClick={() => setShowAudioControls(!showAudioControls)}
                      className={`flex items-center gap-2 ${
                        isAudioPlaying ? 'bg-gradient-to-r from-pink-500 to-pink-500 text-white' : ''
                      }`}
                    >
                      <Music className="w-4 h-4" />
                      {isAudioPlaying ? 'الصوت يعمل' : 'الاستماع للقصة'}
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleDownload}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90"
                  >
                    <Download className="w-4 h-4 " />
                    تحميل PDF
                  </Button>
                </div>
            </div>
          </header>
       
          

          <main className={isFullScreen ? 'h-screen' : 'p-6'}>
            <div className={isFullScreen ? 'h-full flex flex-col' : ''}>
              {/* معلومات القصة (تظهر فقط في وضع الشاشة العادية) */}
              {!isFullScreen && (
                <div className="mb-6 bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="flex flex-col lg:flex-row gap-6 items-start">
                    <div className="w-40 h-56 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-gray-700 dark:to-gray-600 rounded-xl overflow-hidden flex-shrink-0">
                      {story.cover_image ? (
                        <img
                          src={`/src/assets/${story.cover_image}`}
                          alt={story.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://placehold.co/200x300/FFE4C4/FFA500?text=Cover';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-300 to-orange-300">
                          <BookOpen className="w-16 h-16 text-white" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
                        {story.title}
                      </h2>
                      
                      <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg leading-relaxed">
                        {story.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-4 mb-6">
                        <div className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-xl font-medium">
                          الفئة: {story.category}
                        </div>
                        <div className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-xl font-medium">
                          المستوى: {story.difficulty_level === 'easy' ? 'سهل' : story.difficulty_level === 'medium' ? 'متوسط' : 'صعب'}
                        </div>
                        <div className="px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 rounded-xl font-medium">
                          عدد الصفحات: {pages.length || story.pages_count}
                        </div>
                        {story.audio_file && (
                          <div className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-pink-800 dark:text-pink-300 rounded-xl font-medium">
                            <Music className="w-4 h-4 inline ml-1" />
                            متاح بالصوت
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-3">
                        
                        
                        <Button 
                          onClick={handleShare}
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <Share2 className="w-4 h-4" />
                          مشاركة
                        </Button>
                        
                        {story.audio_file && (
                          <Button 
                             onClick={() => setShowAudioControls(!showAudioControls)}
                            variant={isAudioPlaying ? "destructive" : "default"}
                            className={`flex items-center gap-2 ${
                              isAudioPlaying 
                                ? 'bg-gradient-to-r from-red-500 to-pink-500' 
                                : 'bg-gradient-to-r from-purple-500 to-indigo-500'
                            } text-white`}
                          >
                            {isAudioPlaying ? (
                              <>
                                <Pause className="w-4 h-4" />
                                إيقاف الصوت
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4" />
                                الاستماع للقصة
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* مشغل الصوت */}
              {showAudioControls && story.audio_file && (
                <div className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-700 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Music className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                        مشغل الصوت - {story.title}
                      </h3>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowAudioControls(false)}
                    >
                      إخفاء
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {/* شريط التقدم */}
                   
                    
                    {/* أزرار التحكم */}
                    <div className="flex items-center justify-center gap-4">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={toggleLoop}
                        className={isLooping ? "text-purple-600 dark:text-purple-400" : ""}
                        title="تكرار"
                      >
                        <Repeat className="w-5 h-5" />
                      </Button>

                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => skipBackward()}
                        title="رجوع 10 ثواني"
                      >
                        <SkipBack className="w-5 h-5" />
                      </Button>
                      
                      <Button
                        size="lg"
                        variant={isAudioPlaying ? "destructive" : "default"}
                        onClick={toggleAudio}
                        className={`rounded-full w-14 h-14 ${
                          isAudioPlaying 
                            ? 'bg-gradient-to-r from-red-500 to-pink-500' 
                            : 'bg-gradient-to-r from-purple-500 to-indigo-500'
                        }`}
                      >
                        {isAudioPlaying ? (
                          <Pause className="w-6 h-6" />
                        ) : (
                          <Play className="w-6 h-6" />
                        )}
                      </Button>
                      
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => skipForward()}
                        title="تقديم 10 ثواني"
                      >
                        <SkipForward className="w-5 h-5" />
                      </Button>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={toggleMute}
                          title={isMuted ? "إلغاء كتم الصوت" : "كتم الصوت"}
                        >
                          {isMuted ? (
                            <VolumeX className="w-5 h-5" />
                          ) : (
                            <Volume2 className="w-5 h-5" />
                          )}
                        </Button>
                        
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={volume}
                          onChange={handleVolumeChange}
                          className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </div>
                    
                   
                  </div>
                </div>
              )}

              {/* منطقة عرض الكتاب المقلب */}
              <div className={`${isFullScreen ? 'flex-1' : ''} bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-xl`}>
                {/* شريط أدوات الكتاب */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-b dark:border-gray-700 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                   
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={toggleSound}
                      className="flex items-center gap-1.5"
                    >
                      {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                      أصوات التقليب
                    </Button>
                    
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {pdfLoading ? 'جاري تحميل الصفحات...' : `صفحة ${currentPage + 1} من ${pages.length}`}
                      {isAudioPlaying && story.audio_file && (
                        <span className="mr-3 text-purple-600 dark:text-purple-400">
                          {' • '}
                          <Music className="w-3 h-3 inline ml-1" />
                          {formatTime(currentTime)} / {formatTime(audioDuration)}
                        </span>
                      )}
                    </div>
                    
                    {isFullScreen && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate('/student-dashboard/stories')}
                        className="flex items-center gap-1.5"
                      >
                        <Home className="w-4 h-4" />
                        المكتبة
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* منطقة عرض الكتاب باستخدام react-pageflip */}
                <div className="relative flex items-center justify-center min-h-[500px] md:min-h-[600px] lg:min-h-[700px] overflow-hidden bg-gradient-to-br from-amber-100 to-pink-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
                  {pdfLoading ? (
                    <div className="text-center">
                      <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
                      <p className="text-gray-700 dark:text-gray-300 text-lg">جاري تحميل صفحات القصة...</p>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">يرجى الانتظار قليلاً</p>
                    </div>
                  ) : pages.length > 0 ? (
                    <div className="relative w-full flex items-center justify-center">
                      {/* أزرار التنقل */}
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                        <Button
                          onClick={goToPrevPage}
                          disabled={currentPage === 0}
                          className="h-12 w-12 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg hover:bg-white dark:hover:bg-gray-700 disabled:opacity-50"
                          size="icon"
                        >
                          <ChevronLeft className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                        </Button>
                      </div>
                      
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10">
                        <Button
                          onClick={goToNextPage}
                          disabled={currentPage === pages.length - 1}
                          className="h-12 w-12 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg hover:bg-white dark:hover:bg-gray-700 disabled:opacity-50"
                          size="icon"
                        >
                          <ChevronRight className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                        </Button>
                      </div>
                      
                     
                      
                      {/* الكتاب المقلب */}
                      <HTMLFlipBook
                        ref={flipBookRef}
                        width={isFullScreen ? 500 : 450}
                        height={isFullScreen ? 700 : 650}
                        size="fixed"
                        minWidth={350}
                        maxWidth={600}
                        minHeight={500}
                        maxHeight={900}
                        maxShadowOpacity={0.2}
                        showCover={false}
                        mobileScrollSupport={true}
                        onFlip={onPageFlip}
                        startPage={0}
                        drawShadow={true}
                        flippingTime={800}
                        usePortrait={true}
                        useMouseEvents={true}
                        swipeDistance={30}
                        clickEventForward={false}
                        startZIndex={0}
                        autoSize={true}
                        showPageCorners={true}
                        disableFlipByClick={false}
                        className="flip-book-arabic"
                        style={{ 
                          backgroundColor: 'transparent',
                        }}
                      >
                        {pages.map((page, index) => (
                          <div 
                            key={index} 
                            className="demoPage bg-white shadow-lg"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '15px',
                              boxSizing: 'border-box',
                              backgroundColor: '#fbd1f6',
                              border: '1px solid #e5e7eb'
                            }}
                          >
                            <div className="w-full h-full flex flex-col items-center justify-center overflow-hidden">
                              <img
                                src={page.imgUrl}
                                alt={`صفحة ${page.pageNum}`}
                                className="w-auto h-auto max-w-full max-h-full object-contain"
                                style={{
                                  maxWidth: '100%',
                                  maxHeight: '100%',
                                  width: 'auto',
                                  height: 'auto'
                                }}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = `https://placehold.co/450x650/FFFFFF/333333?text=صفحة+${page.pageNum}&font=arabic`;
                                  target.className = "w-full h-full object-contain";
                                }}
                              />
                              <div className="mt-3 text-center text-gray-500 text-xs">
                                صفحة {page.pageNum} من {pages.length}
                                {story.audio_file && (
                                  <span className="block mt-1 text-purple-600 dark:text-purple-400">
                                    <Music className="w-3 h-3 inline ml-1" />
                                    متاح بالصوت
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </HTMLFlipBook>
                    </div>
                  ) : (
                    <div className="text-center text-gray-700 dark:text-gray-300">
                      <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                      <p className="text-lg">لم يتم العثور على صفحات للعرض</p>
                      <Button 
                        onClick={() => window.location.reload()}
                        className="mt-4 bg-gradient-to-r from-orange-400 to-yellow-400 hover:from-orange-500 hover:to-yellow-500 text-white"
                      >
                        إعادة تحميل
                      </Button>
                    </div>
                  )}
                  
                  
                </div>
              </div>
{/* نموذج الأطفال التفاعلي */}
              { (
                <div className="mb-4 animate-in slide-in-from-top duration-300">
                  <Card className="bg-gradient-to-r from-cyan-50 via-blue-50  rounded-3xl shadow-2xl overflow-hidden">
                    <div className="p-1 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 rounded-t-2xl">
                      <div className="bg-white dark:bg-gray-800 rounded-t-xl p-6">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-purple-500 rounded-2xl flex items-center justify-center">
                              <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                                🎨 تمرين الإبداع والخيال
                              </h3>
                              <p className="text-gray-600 dark:text-gray-300">
                                أجب على الأسئلة واكسب 50 نقطة!
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="px-4 py-2 bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30 rounded-xl">
                              <span className="font-bold text-yellow-700 dark:text-yellow-300">+50 نقطة</span>
                            </div>
                         
                          </div>
                        </div>

                        <form onSubmit={handleKidsFormSubmit} className="space-y-6">
                          {/* الكلمات المفضلة */}
                          <div className="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/10 dark:to-rose-900/10 p-5 rounded-2xl border border-pink-200 dark:border-pink-700">
                          <Label htmlFor="liked_words" className="text-lg font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span>الكلمات التي أعجبتني من القصة</span>
                            <span className="text-sm text-gray-500">(بالعربية)</span>
                          </Label>
                          
                          {/* السؤال بالألمانية */}
                          <p className="text-m text-gray-500 dark:text-gray-400 mb-3">
                            ?Welche Wörter haben dir gefallen💡
                          </p>
                            <Input
                              id="liked_words"
                              value={kidsForm.liked_words}
                              onChange={(e) => handleKidsFormChange('liked_words', e.target.value)}
                              className="bg-white dark:bg-gray-700 border-2 border-pink-300 dark:border-pink-600 rounded-xl p-4 h-12 text-lg"
                              required
                            />
                          </div>

                          {/* ملخص القصة */}
                          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10 p-5 rounded-2xl border border-blue-200 dark:border-blue-700">
                            <Label htmlFor="summary_arabic" className="text-lg font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                              <Edit3 className="w-5 h-5 text-blue-500" />
                              <span>اكتب ملخصاً قصيراً للقصة بالعربية</span>
                            </Label>

                            <p className="text-m text-gray-500 dark:text-gray-400 mb-3">
                            Schreibe eine kurze Zusammenfassung 💡
                          </p>
                            <Textarea
                              id="summary_arabic"
                              value={kidsForm.summary_arabic}
                              onChange={(e) => handleKidsFormChange('summary_arabic', e.target.value)}
                              className="bg-white dark:bg-gray-700 border-2 border-blue-300 dark:border-blue-600 rounded-xl p-4 min-h-[100px] text-lg"
                              required
                            />
                          </div>

                          {/* الجزء المفضل */}
                          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 p-5 rounded-2xl border border-green-200 dark:border-green-700">
                            <Label htmlFor="favorite_part" className="text-lg font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                              <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                              <span>ما  الذي أعجبك أكثر في القصة؟</span>
                              <span className="text-sm text-gray-500">(بالعربية)</span>
                            </Label>
                            <p className="text-m text-gray-500 dark:text-gray-400 mb-3">
                            ?Was war dein Lieblingsteil 💡
                          </p>
                            <Textarea
                              id="favorite_part"
                              value={kidsForm.favorite_part}
                              onChange={(e) => handleKidsFormChange('favorite_part', e.target.value)}
                              className="bg-white dark:bg-gray-700 border-2 border-green-300 dark:border-green-600 rounded-xl p-4 min-h-[80px] text-lg"
                              required
                            />
                          </div>

                          {/* التغييرات المقترحة */}
                          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 p-5 rounded-2xl border border-amber-200 dark:border-amber-700">
                            <Label htmlFor="desired_changes" className="text-lg font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                              <span className="text-2xl">🎯</span>
                              <span>إذا استطعت تغيير شيء في القصة، ماذا ستغير؟</span>
                              <span className="text-sm text-gray-500">(بالعربية)</span>
                            </Label>
                            <p className="text-m text-gray-500 dark:text-gray-400 mb-3">
                            ?Was würdest du ändern wollen💡
                          </p>
                            <Textarea
                              id="desired_changes"
                              value={kidsForm.desired_changes}
                              onChange={(e) => handleKidsFormChange('desired_changes', e.target.value)}
                              className="bg-white dark:bg-gray-700 border-2 border-amber-300 dark:border-amber-600 rounded-xl p-4 min-h-[80px] text-lg"
                              required
                            />
                          </div>

                          {/* الفقرة المفضلة */}
                          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 p-5 rounded-2xl border border-purple-200 dark:border-purple-700">
                            <Label htmlFor="favorite_paragraph" className="text-lg font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                              <span className="text-2xl">📖</span>
                              <span>أعد كتابة أفضل فقرة أعجبتك من القصة</span>
                            </Label>
                            <p className="text-m text-gray-500 dark:text-gray-400 mb-3">
                           Schreibe deinen Lieblingsabsatz💡
                          </p>
                            <Textarea
                              id="favorite_paragraph"
                              value={kidsForm.favorite_paragraph}
                              onChange={(e) => handleKidsFormChange('favorite_paragraph', e.target.value)}
                              className="bg-white dark:bg-gray-700 border-2 border-purple-300 dark:border-purple-600 rounded-xl p-4 min-h-[100px] text-lg"
                              required
                            />
                          </div>

                          

                          {/* أزرار الإرسال */}
                          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl">
                                <span className="text-2xl">🏆</span>
                                <span className="font-bold text-green-700 dark:text-green-300">
                                  {hasSubmitted ? 'تم الإرسال مسبقاً' : 'ستكسب 50 نقطة!'}
                                </span>
                              </div>
                              <p className="text-sm text-gray-500">
                                يمكنك التعديل عدة مرات
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                             
                              <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold px-8 py-3 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                              >
                                {isSubmitting ? (
                                  <>
                                    <Loader2 className="w-5 h-5 animate-spin ml-2" />
                                    جاري الحفظ...
                                  </>
                                ) : hasSubmitted ? (
                                  'تحديث إجابتي'
                                ) : (
                                  'إرسال إجابتي وربح 50 نقطة 🎉'
                                )}
                              </Button>
                            </div>
                          </div>
                        </form>
                      </div>
                    </div>
                  </Card>
                </div>
              )}
              {/* توجيهات وإرشادات */}
              {!isFullScreen && !pdfLoading && pages.length > 0 && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-0 p-5">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-xl">📖</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800 dark:text-white mb-2">كيفية القراءة بالعربية</h4>
                        <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                          <li>• اسحب الصفحة من <strong>اليمين إلى اليسار</strong> للصفحة التالية</li>
                        </ul>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-0 p-5">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Music className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800 dark:text-white mb-2">الاستماع للقصة</h4>
                        <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                          <li>• اضغط <strong>زر الموسيقى</strong> للاستماع للقصة</li>
                          
                        </ul>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-0 p-5">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-orange-400 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Settings className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800 dark:text-white mb-2">نصائح وإرشادات</h4>
                        <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                          <li>• استخدم وضع ملء الشاشة لتجربة قراءة أفضل</li>
                         
                        </ul>
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default StoryDetail;