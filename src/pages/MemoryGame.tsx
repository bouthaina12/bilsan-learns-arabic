import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft, Home } from 'lucide-react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';

const MemoryGame = () => {
  const navigate = useNavigate();
  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;

  useEffect(() => {
    if (!user) {
      window.location.href = '/login';
      return;
    }
  }, []);

  if (!user) return null;

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
                  العودة للألعاب
                </Button>
                <h1 className="text-2xl font-bold text-primary">لعبة الحقيبة</h1>
              </div>
            </div>
          </header>

          <main className="p-6">
            <Card className="p-6">
              <iframe 
                src="https://wordwall.net/embed/be708a590195475382bbe0e0a309b000?themeId=41&templateId=36&fontStackId=0"
                style={{ border: 0, width: '100%', height: '600px' }}
                allowFullScreen
                title="Memory Game"
                className="w-full rounded-lg"
              />
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MemoryGame;