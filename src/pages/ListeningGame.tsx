import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Home } from 'lucide-react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';

const ListeningGame = () => {
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
                <Button
                  variant="ghost"
                  onClick={() => navigate('/student-dashboard/games')}
                  className="flex items-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  العودة للألعاب
                </Button>
                <h1 className="text-2xl font-bold text-primary">مُبدعو الحروف: أسرار بلاد بيلسان
 </h1>
              </div>
            </div>
          </header>

          <main className="p-6">
            <Card className="p-6">
              <iframe 
                src="https://wordwall.net/embed/04a9d3f56de943149ae8dfdeccbe19b0?themeId=49&templateId=38&fontStackId=0"
                style={{ border: 0, width: '100%', height: '600px' }}
                allowFullScreen
                title="Listening Game"
                className="w-full rounded-lg"
              />
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default ListeningGame;