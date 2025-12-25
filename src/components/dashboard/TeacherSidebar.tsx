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
  Users,
  LogOut,
  PlusCircle,
} from "lucide-react";

const teacherMenuItems = [
  { title: "لوحة التحكم", url: "/teacher-dashboard", icon: LayoutDashboard },
  { title: "إضافة درس", url: "/teacher-dashboard/add-lesson", icon: GraduationCap },
  { title: "إضافة كتاب", url: "/teacher-dashboard/add-book", icon: BookOpen },
  { title: "إضافة لعبة", url: "/teacher-dashboard/add-game", icon: Gamepad2 },
  { title: "إضافة ورقة عمل", url: "/teacher-dashboard/add-worksheet", icon: FileText },
  { title: "إضافة امتحان", url: "/teacher-dashboard/add-exam", icon: PlusCircle },
  { title: "متابعة الطلاب", url: "/teacher-dashboard/students", icon: Users },
];

interface TeacherSidebarProps {
  userName?: string;
}

export function TeacherSidebar({ userName = "معلم" }: TeacherSidebarProps) {
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

      {/* Teacher Info */}
      {!collapsed && (
        <div className="p-4 border-b border-sidebar-border">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-accent/30 rounded-full flex items-center justify-center mb-2">
              <span className="text-2xl">👨‍🏫</span>
            </div>
            <h3 className="font-arabic font-bold text-foreground">{userName}</h3>
            <span className="text-sm font-arabic text-muted-foreground">معلم</span>
          </div>
        </div>
      )}

      <SidebarContent className="flex-1">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {teacherMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    className={cn(
                      "transition-all duration-200",
                      isActive(item.url) 
                        ? "bg-accent text-accent-foreground hover:bg-accent/90" 
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
