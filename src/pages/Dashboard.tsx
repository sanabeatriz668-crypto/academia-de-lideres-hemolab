import { AppLayout } from "@/components/AppLayout";
import { StatCard } from "@/components/StatCard";
import { Users, TrendingUp, CheckCircle2, Trophy, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();

  const { data: profiles = [] } = useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: completions = [] } = useQuery({
    queryKey: ["my_completions", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("task_completions").select("*").eq("user_id", user!.id).eq("done", true);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: moduleProgress = [] } = useQuery({
    queryKey: ["my_module_progress", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("module_progress").select("*").eq("user_id", user!.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: modules = [] } = useQuery({
    queryKey: ["modules_count"],
    queryFn: async () => {
      const { data, error } = await supabase.from("modules").select("id");
      if (error) throw error;
      return data;
    },
  });

  const leadersCount = profiles.filter((p) => p.role === "lider").length;
  const completedModules = moduleProgress.filter((m) => m.status === "concluido").length;
  const evolution = modules.length > 0 ? Math.round((completedModules / modules.length) * 100) : 0;

  return (
    <AppLayout title="Dashboard" subtitle="Visão geral do programa">
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Users} title="Líderes Ativos" value={String(leadersCount)} change={leadersCount > 0 ? `${leadersCount} cadastrado(s)` : "Nenhum cadastrado"} changeType="neutral" gradient="gradient-primary" />
          <StatCard icon={TrendingUp} title="Evolução na Trilha" value={`${evolution}%`} change={`${completedModules}/${modules.length} módulos`} changeType={evolution > 0 ? "positive" : "neutral"} />
          <StatCard icon={CheckCircle2} title="Tarefas Concluídas" value={String(completions.length)} change={completions.length > 0 ? "Bom trabalho!" : "Sem tarefas concluídas"} changeType={completions.length > 0 ? "positive" : "neutral"} />
          <StatCard icon={Trophy} title="Pontos Totais" value="0" change="Meta: 2.000" changeType="neutral" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-warning" /> Líderes Cadastrados
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profiles.length > 0 ? (
                  <div className="space-y-3">
                    {profiles.map((p) => (
                      <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                        <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground">
                          {p.full_name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{p.full_name}</p>
                          <p className="text-[10px] text-muted-foreground capitalize">{p.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground py-8 text-center">Nenhum líder cadastrado ainda.</p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card className="shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4 text-info" /> Atividades Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground py-8 text-center">Nenhuma atividade registrada.</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}
