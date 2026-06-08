import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Play, Lock, ListChecks, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";
import { toast } from "sonner";

type ModuleStatus = "concluido" | "em_andamento" | "pendente";

const statusConfig: Record<ModuleStatus, { label: string; variant: "default" | "secondary" | "outline"; icon: typeof CheckCircle2 }> = {
  concluido: { label: "Concluído", variant: "default", icon: CheckCircle2 },
  em_andamento: { label: "Em andamento", variant: "secondary", icon: Play },
  pendente: { label: "Pendente", variant: "outline", icon: Lock },
};

export default function Trilha() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: meProfile } = useQuery({
    queryKey: ["me-role-trilha", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("role").eq("user_id", user!.id).maybeSingle();
      return data;
    },
  });
  const isParticipant = meProfile?.role === "participante" || !meProfile?.role;

  const { data: modules = [] } = useQuery({
    queryKey: ["modules"],
    queryFn: async () => {
      const { data, error } = await supabase.from("modules").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const { data: progressData = [] } = useQuery({
    queryKey: ["module_progress", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("module_progress").select("*").eq("user_id", user!.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Auto-advance signals: count completed activities the participant performed.
  const { data: taskDone = 0 } = useQuery({
    queryKey: ["auto-task-done", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { count } = await supabase.from("task_completions").select("id", { count: "exact", head: true }).eq("user_id", user!.id).eq("done", true);
      return count || 0;
    },
  });
  const { data: formsDone = 0 } = useQuery({
    queryKey: ["auto-forms-done", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { count } = await supabase.from("form_responses").select("id", { count: "exact", head: true }).eq("respondent_id", user!.id);
      return count || 0;
    },
  });
  const { data: trainingsDone = 0 } = useQuery({
    queryKey: ["auto-trainings-done", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { count } = await supabase.from("training_progress").select("id", { count: "exact", head: true }).eq("user_id", user!.id).eq("status", "concluido");
      return count || 0;
    },
  });

  const totalDone = taskDone + formsDone + trainingsDone;

  // Compute auto progress distributed across modules in sort_order.
  // Each module needs `activities` items to be 100%. Excess flows to the next module.
  const autoProgressByModule: Record<string, { status: ModuleStatus; progress: number }> = {};
  let remaining = totalDone;
  for (const m of modules as any[]) {
    const need = Math.max(1, m.activities || 1);
    const filled = Math.min(need, remaining);
    remaining -= filled;
    const pct = Math.round((filled / need) * 100);
    autoProgressByModule[m.id] = {
      progress: pct,
      status: pct >= 100 ? "concluido" : pct > 0 ? "em_andamento" : "pendente",
    };
  }

  const upsertProgress = useMutation({
    mutationFn: async ({ moduleId, status, progress }: { moduleId: string; status: string; progress: number }) => {
      const { error } = await supabase.from("module_progress").upsert(
        { user_id: user!.id, module_id: moduleId, status, progress },
        { onConflict: "user_id,module_id" }
      );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["module_progress"] });
      toast.success("Progresso atualizado!");
    },
  });

  const getProgress = (moduleId: string) => {
    const manual = progressData.find((p) => p.module_id === moduleId);
    const auto = autoProgressByModule[moduleId];
    if (!auto) return manual;
    // Use the higher of manual/auto so participants always see auto-advance.
    if (!manual) return { module_id: moduleId, status: auto.status, progress: auto.progress } as any;
    const manualPct = manual.progress || 0;
    return manualPct >= auto.progress ? manual : { ...manual, status: auto.status, progress: auto.progress };
  };


  const completed = (modules as any[]).filter((m) => getProgress(m.id)?.status === "concluido").length;

  return (
    <AppLayout title="Trilha de Desenvolvimento" subtitle="Seu programa de 3 meses">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4 p-4 rounded-xl bg-card border shadow-card">
          <div className="gradient-primary rounded-lg p-3">
            <ListChecks className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">Progresso Geral da Trilha</p>
            <p className="text-xs text-muted-foreground">{completed} de {modules.length} módulos concluídos</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">
              {modules.length > 0 ? Math.round((completed / modules.length) * 100) : 0}%
            </p>
          </div>
        </div>

        {modules.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="p-8">
              <p className="text-sm text-muted-foreground text-center">Nenhum módulo disponível ainda.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border hidden md:block" />
            <div className="space-y-4">
              {modules.map((mod, i) => {
                const prog = getProgress(mod.id);
                const status = (prog?.status || "pendente") as ModuleStatus;
                const progressVal = prog?.progress || 0;
                const sc = statusConfig[status];
                return (
                  <motion.div key={mod.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
                    <Card className={`shadow-card relative md:ml-12 ${status === "em_andamento" ? "border-primary/40 ring-1 ring-primary/20" : ""} ${status === "pendente" ? "opacity-60" : ""}`}>
                      <div className="absolute -left-[2.15rem] top-5 hidden md:flex h-5 w-5 rounded-full border-2 border-card items-center justify-center z-10"
                        style={{ backgroundColor: status === "concluido" ? "hsl(152,60%,42%)" : status === "em_andamento" ? "hsl(217,91%,50%)" : "hsl(215,15%,50%)" }}>
                        <sc.icon className="h-3 w-3 text-primary-foreground" />
                      </div>
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">{mod.month}</p>
                            <CardTitle className="text-base mt-1">{mod.title}</CardTitle>
                          </div>
                          <Badge variant={sc.variant} className="text-[10px] flex-shrink-0">{sc.label}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">{mod.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><FileText className="h-3 w-3" />{mod.lessons} aulas</span>
                          <span className="flex items-center gap-1"><ListChecks className="h-3 w-3" />{mod.activities} atividades</span>
                        </div>
                        {status !== "pendente" && <Progress value={progressVal} className="h-1.5" />}
                        <ModuleActions
                          status={status}
                          progress={progressVal}
                          onUpdate={(s, p) => upsertProgress.mutate({ moduleId: mod.id, status: s, progress: p })}
                        />
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function ModuleActions({ status, progress, onUpdate }: { status: ModuleStatus; progress: number; onUpdate: (s: string, p: number) => void }) {
  const [sliderVal, setSliderVal] = useState(progress);

  if (status === "pendente") {
    return (
      <Button size="sm" variant="outline" className="text-xs" onClick={() => onUpdate("em_andamento", 0)}>
        Iniciar módulo
      </Button>
    );
  }
  if (status === "em_andamento") {
    return (
      <div className="flex items-center gap-3">
        <Slider value={[sliderVal]} onValueChange={([v]) => setSliderVal(v)} max={100} step={5} className="flex-1" />
        <span className="text-xs text-muted-foreground w-8">{sliderVal}%</span>
        <Button size="sm" variant="outline" className="text-xs" onClick={() => onUpdate(sliderVal >= 100 ? "concluido" : "em_andamento", sliderVal)}>
          Salvar
        </Button>
      </div>
    );
  }
  return <p className="text-xs text-success font-medium">✓ Módulo concluído</p>;
}
