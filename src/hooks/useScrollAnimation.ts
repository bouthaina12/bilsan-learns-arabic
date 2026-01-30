import { useEffect, useRef, useState } from 'react';

interface UseScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export const useScrollAnimation = (options: UseScrollAnimationOptions = {}) => {
  const { threshold = 0.1, rootMargin = '0px', triggerOnce = true } = options;
  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin, triggerOnce]);

  return { ref, isVisible };
};

// Smooth scroll to section
export const scrollToSection = (sectionId: string) => {
  // If we're not on the homepage, navigate there first
  if (window.location.pathname !== '/') {
    window.location.href = `/#${sectionId}`;
    return;
  }
  
  const element = document.getElementById(sectionId);
  if (element) {
    const navbarHeight = 80;
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.scrollY - navbarHeight;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }
};

// نظام الأصوات المحسّن مع تأثيرات متعددة
export const playSound = (soundType: 'claps' | 'pop' | 'whoosh' | 'chime' | 'success' | 'correct' | 'wrong' | 'levelUp' | 'click' | 'tada' | 'confetti' | 'flip' | 'pageTurn' | 'bookOpen') => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const gainNode = audioContext.createGain();
    gainNode.connect(audioContext.destination);
    gainNode.gain.value = 0.3; // مستوى الصوت العام

    switch (soundType) {
      case 'claps':
        // تأثير تصفيق متعدد الطبقات
        const clapCount = 8;
        const clapInterval = 0.05;
        
        for (let i = 0; i < clapCount; i++) {
          setTimeout(() => {
            try {
              const clapOsc = audioContext.createOscillator();
              const clapGain = audioContext.createGain();
              clapOsc.connect(clapGain);
              clapGain.connect(audioContext.destination);
              
              // تردد عشوائي لخلق تأثير تصفيق واقعي
              const freq = 100 + Math.random() * 200;
              clapOsc.frequency.setValueAtTime(freq, audioContext.currentTime);
              
              clapGain.gain.setValueAtTime(0.15, audioContext.currentTime);
              clapGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
              
              clapOsc.start(audioContext.currentTime + i * clapInterval);
              clapOsc.stop(audioContext.currentTime + i * clapInterval + 0.1);
            } catch (e) {
              console.log('Clap error:', e);
            }
          }, i * clapInterval * 1000);
        }
        break;
        case 'flip':
            // صوت تقليب صفحة واقعي
            const flipOsc1 = audioContext.createOscillator();
            const flipOsc2 = audioContext.createOscillator();
            const flipGain = audioContext.createGain();
            
            flipOsc1.connect(flipGain);
            flipOsc2.connect(flipGain);
            flipGain.connect(audioContext.destination);
            
            // نغمة تصاعدية مع صدى
            flipOsc1.frequency.setValueAtTime(200, audioContext.currentTime);
            flipOsc1.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.3);
            
            flipOsc2.frequency.setValueAtTime(400, audioContext.currentTime);
            flipOsc2.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.25);
            
            flipGain.gain.setValueAtTime(0.08, audioContext.currentTime);
            flipGain.gain.linearRampToValueAtTime(0.15, audioContext.currentTime + 0.1);
            flipGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.4);
            
            flipOsc1.start(audioContext.currentTime);
            flipOsc2.start(audioContext.currentTime);
            flipOsc1.stop(audioContext.currentTime + 0.4);
            flipOsc2.stop(audioContext.currentTime + 0.4);
            break;

      case 'pageTurn':
        // صوت تقليب صفحة ورقي ناعم
        const pageOsc1 = audioContext.createOscillator();
        const pageOsc2 = audioContext.createOscillator();
        const pageOsc3 = audioContext.createOscillator();
        const pageGain = audioContext.createGain();
        
        pageOsc1.connect(pageGain);
        pageOsc2.connect(pageGain);
        pageOsc3.connect(pageGain);
        pageGain.connect(audioContext.destination);
        
        // ترددات متداخلة لمحاكاة صوت الورق
        pageOsc1.frequency.setValueAtTime(150, audioContext.currentTime);
        pageOsc1.frequency.exponentialRampToValueAtTime(300, audioContext.currentTime + 0.2);
        
        pageOsc2.frequency.setValueAtTime(180, audioContext.currentTime + 0.05);
        pageOsc2.frequency.exponentialRampToValueAtTime(350, audioContext.currentTime + 0.25);
        
        pageOsc3.frequency.setValueAtTime(220, audioContext.currentTime + 0.1);
        pageOsc3.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.3);
        
        pageGain.gain.setValueAtTime(0.05, audioContext.currentTime);
        pageGain.gain.linearRampToValueAtTime(0.12, audioContext.currentTime + 0.15);
        pageGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.35);
        
        pageOsc1.start(audioContext.currentTime);
        pageOsc2.start(audioContext.currentTime + 0.05);
        pageOsc3.start(audioContext.currentTime + 0.1);
        pageOsc1.stop(audioContext.currentTime + 0.35);
        pageOsc2.stop(audioContext.currentTime + 0.35);
        pageOsc3.stop(audioContext.currentTime + 0.35);
        break;

      case 'bookOpen':
        // صوت فتح كتاب
        const bookOsc1 = audioContext.createOscillator();
        const bookOsc2 = audioContext.createOscillator();
        const bookGain = audioContext.createGain();
        
        bookOsc1.connect(bookGain);
        bookOsc2.connect(bookGain);
        bookGain.connect(audioContext.destination);
        
        bookOsc1.frequency.setValueAtTime(100, audioContext.currentTime);
        bookOsc1.frequency.linearRampToValueAtTime(400, audioContext.currentTime + 0.4);
        
        bookOsc2.frequency.setValueAtTime(120, audioContext.currentTime);
        bookOsc2.frequency.linearRampToValueAtTime(450, audioContext.currentTime + 0.35);
        
        bookGain.gain.setValueAtTime(0.06, audioContext.currentTime);
        bookGain.gain.linearRampToValueAtTime(0.18, audioContext.currentTime + 0.2);
        bookGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.45);
        
        bookOsc1.start(audioContext.currentTime);
        bookOsc2.start(audioContext.currentTime);
        bookOsc1.stop(audioContext.currentTime + 0.45);
        bookOsc2.stop(audioContext.currentTime + 0.45);
        break;

      case 'tada':
        // صوت تادا - احتفالي
        const tadaOsc1 = audioContext.createOscillator();
        const tadaOsc2 = audioContext.createOscillator();
        const tadaGain = audioContext.createGain();
        
        tadaOsc1.connect(tadaGain);
        tadaOsc2.connect(tadaGain);
        tadaGain.connect(audioContext.destination);
        
        tadaOsc1.frequency.setValueAtTime(523, audioContext.currentTime); // C5
        tadaOsc2.frequency.setValueAtTime(659, audioContext.currentTime); // E5
        tadaOsc1.frequency.setValueAtTime(784, audioContext.currentTime + 0.1); // G5
        tadaOsc2.frequency.setValueAtTime(1046, audioContext.currentTime + 0.1); // C6
        
        tadaGain.gain.setValueAtTime(0, audioContext.currentTime);
        tadaGain.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.05);
        tadaGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.8);
        
        tadaOsc1.start(audioContext.currentTime);
        tadaOsc2.start(audioContext.currentTime);
        tadaOsc1.stop(audioContext.currentTime + 0.8);
        tadaOsc2.stop(audioContext.currentTime + 0.8);
        break;

      case 'confetti':
        // صوت انفجار كونفيتي
        const confettiCount = 12;
        const confettiInterval = 0.03;
        
        for (let i = 0; i < confettiCount; i++) {
          setTimeout(() => {
            try {
              const confettiOsc = audioContext.createOscillator();
              const confettiGain = audioContext.createGain();
              confettiOsc.connect(confettiGain);
              confettiGain.connect(audioContext.destination);
              
              const startFreq = 800 + Math.random() * 400;
              const endFreq = 200 + Math.random() * 200;
              
              confettiOsc.frequency.setValueAtTime(startFreq, audioContext.currentTime);
              confettiOsc.frequency.exponentialRampToValueAtTime(endFreq, audioContext.currentTime + 0.15);
              
              confettiGain.gain.setValueAtTime(0.08, audioContext.currentTime);
              confettiGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.15);
              
              confettiOsc.start(audioContext.currentTime);
              confettiOsc.stop(audioContext.currentTime + 0.15);
            } catch (e) {
              console.log('Confetti error:', e);
            }
          }, i * confettiInterval * 1000);
        }
        break;

      case 'success':
        // صوت نجاح متعدد النغمات
        const successOsc1 = audioContext.createOscillator();
        const successOsc2 = audioContext.createOscillator();
        const successGain = audioContext.createGain();
        
        successOsc1.connect(successGain);
        successOsc2.connect(successGain);
        successGain.connect(audioContext.destination);
        
        // نغمة C major chord
        successOsc1.frequency.setValueAtTime(523, audioContext.currentTime); // C5
        successOsc2.frequency.setValueAtTime(659, audioContext.currentTime); // E5
        
        successGain.gain.setValueAtTime(0.1, audioContext.currentTime);
        successGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
        
        successOsc1.start(audioContext.currentTime);
        successOsc2.start(audioContext.currentTime);
        successOsc1.stop(audioContext.currentTime + 0.3);
        successOsc2.stop(audioContext.currentTime + 0.3);
        break;

      case 'levelUp':
        // صوت صعود مستوى
        const levelUpOsc = audioContext.createOscillator();
        const levelUpGain = audioContext.createGain();
        
        levelUpOsc.connect(levelUpGain);
        levelUpGain.connect(audioContext.destination);
        
        levelUpOsc.frequency.setValueAtTime(200, audioContext.currentTime);
        levelUpOsc.frequency.linearRampToValueAtTime(800, audioContext.currentTime + 0.2);
        levelUpOsc.frequency.linearRampToValueAtTime(1000, audioContext.currentTime + 0.4);
        
        levelUpGain.gain.setValueAtTime(0.1, audioContext.currentTime);
        levelUpGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.6);
        
        levelUpOsc.start(audioContext.currentTime);
        levelUpOsc.stop(audioContext.currentTime + 0.6);
        break;

      case 'correct':
        // صوت إجابة صحيحة مميز
        const correctOsc1 = audioContext.createOscillator();
        const correctOsc2 = audioContext.createOscillator();
        const correctGain = audioContext.createGain();
        
        correctOsc1.connect(correctGain);
        correctOsc2.connect(correctGain);
        correctGain.connect(audioContext.destination);
        
        correctOsc1.frequency.setValueAtTime(784, audioContext.currentTime); // G5
        correctOsc2.frequency.setValueAtTime(1046, audioContext.currentTime); // C6
        
        correctGain.gain.setValueAtTime(0.15, audioContext.currentTime);
        correctGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.4);
        
        correctOsc1.start(audioContext.currentTime);
        correctOsc2.start(audioContext.currentTime);
        correctOsc1.stop(audioContext.currentTime + 0.4);
        correctOsc2.stop(audioContext.currentTime + 0.4);
        break;

      case 'wrong':
        // صوت إجابة خاطئة
        const wrongOsc = audioContext.createOscillator();
        const wrongGain = audioContext.createGain();
        
        wrongOsc.connect(wrongGain);
        wrongGain.connect(audioContext.destination);
        
        wrongOsc.frequency.setValueAtTime(300, audioContext.currentTime);
        wrongOsc.frequency.linearRampToValueAtTime(150, audioContext.currentTime + 0.15);
        
        wrongGain.gain.setValueAtTime(0.1, audioContext.currentTime);
        wrongGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);
        
        wrongOsc.start(audioContext.currentTime);
        wrongOsc.stop(audioContext.currentTime + 0.2);
        break;

      case 'click':
        // صوت نقرة لطيف
        const clickOsc = audioContext.createOscillator();
        const clickGain = audioContext.createGain();
        
        clickOsc.connect(clickGain);
        clickGain.connect(audioContext.destination);
        
        clickOsc.frequency.setValueAtTime(1200, audioContext.currentTime);
        clickOsc.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.05);
        
        clickGain.gain.setValueAtTime(0.08, audioContext.currentTime);
        clickGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.05);
        
        clickOsc.start(audioContext.currentTime);
        clickOsc.stop(audioContext.currentTime + 0.05);
        break;

      case 'pop':
        // صوت الفقاعة المحسّن
        const popOsc = audioContext.createOscillator();
        const popGain = audioContext.createGain();
        
        popOsc.connect(popGain);
        popGain.connect(audioContext.destination);
        
        popOsc.frequency.setValueAtTime(800, audioContext.currentTime);
        popOsc.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.15);
        
        popGain.gain.setValueAtTime(0.12, audioContext.currentTime);
        popGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.15);
        
        popOsc.start(audioContext.currentTime);
        popOsc.stop(audioContext.currentTime + 0.15);
        break;

      case 'whoosh':
        // صوت الـ whoosh المحسّن
        const whooshOsc = audioContext.createOscillator();
        const whooshGain = audioContext.createGain();
        
        whooshOsc.connect(whooshGain);
        whooshGain.connect(audioContext.destination);
        
        whooshOsc.frequency.setValueAtTime(150, audioContext.currentTime);
        whooshOsc.frequency.exponentialRampToValueAtTime(700, audioContext.currentTime + 0.2);
        
        whooshGain.gain.setValueAtTime(0.06, audioContext.currentTime);
        whooshGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);
        
        whooshOsc.start(audioContext.currentTime);
        whooshOsc.stop(audioContext.currentTime + 0.2);
        break;

      case 'chime':
        // نغمة الجرس المحسنة
        const chimeOsc1 = audioContext.createOscillator();
        const chimeOsc2 = audioContext.createOscillator();
        const chimeOsc3 = audioContext.createOscillator();
        const chimeGain = audioContext.createGain();
        
        chimeOsc1.connect(chimeGain);
        chimeOsc2.connect(chimeGain);
        chimeOsc3.connect(chimeGain);
        chimeGain.connect(audioContext.destination);
        
        // نغمة C major arpeggio
        chimeOsc1.frequency.setValueAtTime(523, audioContext.currentTime); // C5
        chimeOsc2.frequency.setValueAtTime(659, audioContext.currentTime + 0.1); // E5
        chimeOsc3.frequency.setValueAtTime(784, audioContext.currentTime + 0.2); // G5
        chimeOsc1.frequency.setValueAtTime(1046, audioContext.currentTime + 0.3); // C6
        
        chimeGain.gain.setValueAtTime(0.1, audioContext.currentTime);
        chimeGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);
        
        chimeOsc1.start(audioContext.currentTime);
        chimeOsc2.start(audioContext.currentTime + 0.1);
        chimeOsc3.start(audioContext.currentTime + 0.2);
        chimeOsc1.stop(audioContext.currentTime + 0.5);
        chimeOsc2.stop(audioContext.currentTime + 0.5);
        chimeOsc3.stop(audioContext.currentTime + 0.5);
        break;
    }
  } catch (error) {
    console.log('Audio not available:', error);
  }
};

// دالة مساعدة للعب أصوات متعددة بفواصل زمنية
export const playSoundSequence = (sounds: Array<{type: string, delay?: number}>) => {
  sounds.forEach((sound, index) => {
    setTimeout(() => {
      playSound(sound.type as any);
    }, (sound.delay || 0) + (index * 150));
  });
};

// تأثيرات خاصة للأحداث الكبيرة
export const playCelebrationSounds = () => {
  playSoundSequence([
    { type: 'tada', delay: 0 },
    { type: 'claps', delay: 300 },
    { type: 'confetti', delay: 600 },
    { type: 'levelUp', delay: 900 }
  ]);
};

export const playQuizCompleteSounds = () => {
  playSoundSequence([
    { type: 'success', delay: 0 },
    { type: 'correct', delay: 200 },
    { type: 'tada', delay: 400 }
  ]);
};

export const playLessonCompleteSounds = () => {
  playSoundSequence([
    { type: 'chime', delay: 0 },
    { type: 'claps', delay: 500 },
    { type: 'levelUp', delay: 1000 },
    { type: 'tada', delay: 1500 }
  ]);
};