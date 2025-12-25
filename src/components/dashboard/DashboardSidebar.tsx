import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  BookOpen,
  Gamepad2,
  FileText,
  GraduationCap,
  Trophy,
  LogOut,
  Sprout,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

const studentMenuItems = [
  { title: "لوحة التحكم", url: "/student-dashboard", icon: LayoutDashboard },
  { title: "الدروس", url: "/student-dashboard/lessons", icon: GraduationCap },
  { title: "الكتب", url: "/student-dashboard/books", icon: BookOpen },
  { title: "أوراق العمل", url: "/student-dashboard/worksheets", icon: FileText },
  { title: "الألعاب", url: "/student-dashboard/games", icon: Gamepad2 },
  { title: "الامتحانات", url: "/student-dashboard/exams", icon: FileText },
  { title: "المسابقات", url: "/student-dashboard/competitions", icon: Trophy },
];

interface DashboardSidebarProps {
  userType: "student" | "teacher";
  userName?: string;
  seeds?: number;
  progress?: number;
}

export function DashboardSidebar({ 
  userType, 
  userName = "طالب", 
  seeds = 150,
  progress = 65 
}: DashboardSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const handleLogout = () => {
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar 
      className={cn(
        "border-l border-border bg-sidebar-background transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
      collapsible="icon"
    >
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">🌸</span>
          {!collapsed && (
            <span className="text-xl font-bold text-primary font-arabic">
              بيلسان
            </span>
          )}
        </Link>
      </SidebarHeader>

      {/* User Info with Progress and Seeds */}
      {!collapsed && (
        <div className="p-4 border-b border-sidebar-border">
          <div className="text-center mb-4">
            <div className="w-16 h-16 mx-auto bg-primary/20 rounded-full flex items-center justify-center mb-2">
              <span className="text-2xl">👧</span>
            </div>
            <h3 className="font-arabic font-bold text-foreground">{userName}</h3>
          </div>

          {/* Seeds/Coins */}
          <div className="flex items-center justify-center gap-2 bg-mint/30 rounded-xl py-2 px-4 mb-3">
            <Sprout className="w-5 h-5 text-green-600" />
            <span className="font-arabic font-bold text-green-700">{seeds}</span>
            <span className="font-arabic text-sm text-muted-foreground">بذرة</span>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-arabic">
              <span className="text-muted-foreground">التقدم</span>
              <span className="text-primary font-bold">{progress}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      <SidebarContent className="flex-1">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {studentMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    className={cn(
                      "transition-all duration-200",
                      isActive(item.url) 
                        ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                        : "hover:bg-sidebar-accent"
                    )}
                  >
                    <Link to={item.url} className="flex items-center gap-3">
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!collapsed && (
                        <span className="font-arabic">{item.title}</span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="font-arabic">تسجيل الخروج</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
