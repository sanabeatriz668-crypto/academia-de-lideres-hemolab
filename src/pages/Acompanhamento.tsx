import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, ExternalLink, Users, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Acompanhamento() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: trainings = [] } = useQuery({
    queryKey: ["trainings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("trainings").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: myProgress = [] } = useQuery({
    queryKey: ["training_progress", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.from("training_progress").select("*").eq("user_id", user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const isAdmin = profile?.role === "admin";

  const { data: allProgress = [] } = useQuery({
    queryKey: ["training_progress_all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("training_progress").select("*");
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*");
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const updateProgress = useMutation({
    mutationFn: async ({ training_id, progress }: { training_id: string; progress: number }) => {
      if (!user) throw new Error("Não autenticado");
      const status = progress >= 100 ? "concluido" : progress > 0 ? "em_andamento" : "pendente";
      const { error } = await supabase
        .from("training_progress")
        .upsert({ user_id: user.id, training_id, progress, status, updated_at: new Date().toISOString() }, { onConflict: "user_id,training_id" });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Progresso atualizado!");
      queryClient.invalidateQueries({ queryKey: ["training_progress", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["training_progress_all"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const progressByTraining = useMemo(() => {
    const map: Record<string, number> = {};
    myProgress.forEach((p: any) => { map[p.training_id] = p.progress; });
    return map;
  }, [myProgress]);

  const adminStats = useMemo(() => {
    if (!isAdmin) return [];
    return profiles.map((prof: any) => {
      const userProgress = allProgress.filter((p: any) => p.user_id === prof.user_id);
      const completed = userProgress.filter((p: any) => p.status === "concluido").length;
      const inProgress = userProgress.filter((p: any) => p.status === "em_andamento").length;
      const avg = userProgress.length > 0 ? Math.round(userProgress.reduce((s: number, p: any) => s + p.progress, 0) / userProgress.length) : 0;
      return { ...prof, completed, inProgress, avg, total: userProgress.length };
    });
  }, [profiles, allProgress, isAdmin]);

  return (
    <AppLayout title="Acompanhamento de Treinamentos" subtitle="Acompanhe seu progresso e dos líderes">
      <div className="max-w-5xl mx-auto">
        <Tabs defaultValue="meus" className="space-y-6">
          <TabsList className={`grid w-full ${isAdmin ? "grid-cols-2" : "grid-cols-1"}`}>
            <TabsTrigger value="meus" className="text-xs gap-1.5"><GraduationCap className="h-3.5 w-3.5" /> Meus Treinamentos</TabsTrigger>
            {isAdmin && <TabsTrigger value="equipe" className="text-xs gap-1.5"><Users className="h-3.5 w-3.5" /> Equipe</TabsTrigger>}
          </TabsList>

          <TabsContent value="meus" className="space-y-4">
            {trainings.length === 0 ? (
              <Card className="shadow-card"><CardContent className="py-10 text-center text-sm text-muted-foreground">Nenhum treinamento cadastrado ainda.</CardContent></Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {trainings.map((t: any) => {
                  const prog = progressByTraining[t.id] ?? 0;
                  return (
                    <Card key={t.id} className="shadow-card">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-sm flex items-center gap-2"><GraduationCap className="h-4 w-4 text-primary" />{t.title}</CardTitle>
                          <Badge variant={prog >= 100 ? "default" : prog > 0 ? "secondary" : "outline"} className="text-[10px]">{prog >= 100 ? "Concluído" : prog > 0 ? "Em andamento" : "Pendente"}</Badge>
                        </div>
                        {t.category && <p className="text-[10px] text-muted-foreground">{t.category}{t.duration_minutes ? ` • ${t.duration_minutes} min` : ""}</p>}
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {t.description && <p className="text-xs text-muted-foreground">{t.description}</p>}
                        <div>
                          <div className="flex justify-between text-[10px] text-muted-foreground mb-1"><span>Progresso</span><span>{prog}%</span></div>
                          <Progress value={prog} className="h-2" />
                        </div>
                        <div className="flex items-end gap-2">
                          <div className="flex-1 space-y-1">
                            <Label className="text-[10px]">Atualizar %</Label>
                            <Input
                              type="number" min="0" max="100" defaultValue={prog} className="text-sm h-8"
                              onBlur={(e) => {
                                const v = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                                if (v !== prog) updateProgress.mutate({ training_id: t.id, progress: v });
                              }}
                            />
                          </div>
                          {t.link && (
                            <Button asChild variant="outline" size="sm">
                              <a href={t.link} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-3.5 w-3.5 mr-1" />Acessar</a>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {isAdmin && (
            <TabsContent value="equipe" className="space-y-4">
              <Card className="shadow-card">
                <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> Progresso por Líder</CardTitle></CardHeader>
                <CardContent>
                  {adminStats.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">Nenhum líder cadastrado.</p>
                  ) : (
                    <div className="space-y-3">
                      {adminStats.map((s: any) => (
                        <div key={s.id} className="p-3 rounded-lg border bg-card space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <p className="text-sm font-medium">{s.full_name}</p>
                              <p className="text-[10px] text-muted-foreground">{s.completed} concluído(s) • {s.inProgress} em andamento • {s.total} total</p>
                            </div>
                            <Badge variant="outline" className="text-[10px]">Média {s.avg}%</Badge>
                          </div>
                          <Progress value={s.avg} className="h-2" />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </AppLayout>
  );
}
