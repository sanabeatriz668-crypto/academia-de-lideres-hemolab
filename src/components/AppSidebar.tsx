import {
  LayoutDashboard,
  Route,
  CheckSquare,
  MessageSquare,
  Trophy,
  BookOpen,
  Bell,
  Settings,
  LogOut,
  TrendingUp,
  ShieldCheck,
  GraduationCap,
  Target,
  CalendarDays,
  Users,
} from "lucide-react";
import hemolabLogo from "@/assets/hemolab-logo.png";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard, roles: ["admin","lider","participante"] },
  { title: "Trilha", url: "/trilha", icon: Route, roles: ["admin","lider","participante"] },
  { title: "Tarefas", url: "/tarefas", icon: CheckSquare, roles: ["admin","lider","participante"] },
  { title: "Avaliação 360°", url: "/avaliacao", icon: MessageSquare, roles: ["admin","lider","participante"] },
  { title: "Ranking", url: "/ranking", icon: Trophy, roles: ["admin","lider","participante"] },
  { title: "Biblioteca", url: "/biblioteca", icon: BookOpen, roles: ["admin","lider","participante"] },
  { title: "Evolução", url: "/evolucao", icon: TrendingUp, roles: ["admin","lider","participante"] },
  { title: "Acompanhamento", url: "/acompanhamento", icon: GraduationCap, roles: ["admin","lider"] },
  { title: "Plano de Ação", url: "/plano-acao", icon: Target, roles: ["admin","lider","participante"] },
  { title: "Cronograma", url: "/cronograma", icon: CalendarDays, roles: ["admin","lider","participante"] },
  { title: "Gestão de Usuários", url: "/usuarios", icon: Users, roles: ["admin"] },
];

const secondaryItems = [
  { title: "Administração", url: "/admin", icon: ShieldCheck, roles: ["admin"] },
  { title: "Notificações", url: "/notificacoes", icon: Bell, roles: ["admin","lider","participante"] },
  { title: "Configurações", url: "/configuracoes", icon: Settings, roles: ["admin","lider","participante"] },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { user, signOut } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ["sidebar-role", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
  });
  const role = profile?.role ?? "participante";
  const visibleMain = mainItems.filter((i) => i.roles.includes(role));
  const visibleSecondary = secondaryItems.filter((i) => i.roles.includes(role));
  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  const displayName = user?.user_metadata?.full_name || user?.email || "Usuário";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-3">
        <div className="bg-white rounded-lg p-2 flex items-center justify-center">
          <img
            src={hemolabLogo}
            alt="HemoLab"
            className={collapsed ? "h-8 w-8 object-contain" : "h-12 w-auto object-contain"}
          />
        </div>
        {!collapsed && (
          <p className="text-[10px] text-sidebar-foreground/60 text-center mt-2">
            Desenvolvimento de Líderes
          </p>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] uppercase tracking-widest">
            Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] uppercase tracking-widest">
            Sistema
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink
                      to={item.url}
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        {!collapsed && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent/50 p-3">
              <div className="h-8 w-8 rounded-full gradient-accent flex items-center justify-center text-xs font-bold text-accent-foreground flex-shrink-0">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-sidebar-accent-foreground truncate">
                  {displayName}
                </p>
                <p className="text-[10px] text-sidebar-foreground/50 truncate">{user?.email}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-xs text-muted-foreground"
              onClick={signOut}
            >
              <LogOut className="h-3 w-3 mr-2" />
              Sair
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
