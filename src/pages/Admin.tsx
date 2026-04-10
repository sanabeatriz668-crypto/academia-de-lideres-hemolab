import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, Plus, Trash2, Users, BookOpen, CheckSquare } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export default function Admin() {
  const queryClient = useQueryClient();

  // ---- Leaders ----
  const [leaderName, setLeaderName] = useState("");
  const [leaderEmail, setLeaderEmail] = useState("");
  const [leaderPassword, setLeaderPassword] = useState("");
  const [loadingLeader, setLoadingLeader] = useState(false);

  const { data: profiles = [] } = useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const handleCreateLeader = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaderName.trim() || !leaderEmail.trim() || !leaderPassword.trim()) {
      toast.error("Preencha todos os campos");
      return;
    }
    if (leaderPassword.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres");
      return;
    }
    setLoadingLeader(true);
    const { error } = await supabase.auth.signUp({
      email: leaderEmail,
      password: leaderPassword,
      options: { data: { full_name: leaderName } },
    });
    setLoadingLeader(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Líder cadastrado com sucesso!");
      setLeaderName("");
      setLeaderEmail("");
      setLeaderPassword("");
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    }
  };

  // ---- Modules ----
  const [modTitle, setModTitle] = useState("");
  const [modDescription, setModDescription] = useState("");
  const [modMonth, setModMonth] = useState("");
  const [modLessons, setModLessons] = useState("0");
  const [modActivities, setModActivities] = useState("0");

  const { data: modules = [] } = useQuery({
    queryKey: ["modules"],
    queryFn: async () => {
      const { data, error } = await supabase.from("modules").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const createModule = useMutation({
    mutationFn: async () => {
      if (!modTitle.trim() || !modMonth.trim()) throw new Error("Título e mês são obrigatórios");
      const { error } = await supabase.from("modules").insert({
        title: modTitle.trim(),
        description: modDescription.trim() || null,
        month: modMonth.trim(),
        lessons: parseInt(modLessons) || 0,
        activities: parseInt(modActivities) || 0,
        sort_order: modules.length,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Módulo criado!");
      setModTitle("");
      setModDescription("");
      setModMonth("");
      setModLessons("0");
      setModActivities("0");
      queryClient.invalidateQueries({ queryKey: ["modules"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // ---- Tasks ----
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskWeek, setTaskWeek] = useState("");
  const [taskPoints, setTaskPoints] = useState("10");
  const [taskDueDate, setTaskDueDate] = useState("");

  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data, error } = await supabase.from("tasks").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createTask = useMutation({
    mutationFn: async () => {
      if (!taskTitle.trim() || !taskWeek.trim()) throw new Error("Título e semana são obrigatórios");
      const { error } = await supabase.from("tasks").insert({
        title: taskTitle.trim(),
        description: taskDescription.trim() || null,
        week: taskWeek.trim(),
        points: parseInt(taskPoints) || 0,
        due_date: taskDueDate || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Tarefa criada!");
      setTaskTitle("");
      setTaskDescription("");
      setTaskWeek("");
      setTaskPoints("10");
      setTaskDueDate("");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AppLayout title="Administração" subtitle="Cadastrar líderes e atividades">
      <div className="max-w-4xl mx-auto">
        <Tabs defaultValue="leaders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="leaders" className="text-xs gap-1.5">
              <Users className="h-3.5 w-3.5" /> Líderes
            </TabsTrigger>
            <TabsTrigger value="modules" className="text-xs gap-1.5">
              <BookOpen className="h-3.5 w-3.5" /> Módulos
            </TabsTrigger>
            <TabsTrigger value="tasks" className="text-xs gap-1.5">
              <CheckSquare className="h-3.5 w-3.5" /> Tarefas
            </TabsTrigger>
          </TabsList>

          {/* Leaders Tab */}
          <TabsContent value="leaders" className="space-y-4">
            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-primary" /> Cadastrar Novo Líder
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateLeader} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Nome completo</Label>
                      <Input value={leaderName} onChange={(e) => setLeaderName(e.target.value)} placeholder="Nome do líder" className="text-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">E-mail</Label>
                      <Input type="email" value={leaderEmail} onChange={(e) => setLeaderEmail(e.target.value)} placeholder="email@empresa.com" className="text-sm" />
                    </div>
                  </div>
                  <div className="space-y-1.5 max-w-xs">
                    <Label className="text-xs">Senha inicial</Label>
                    <Input type="password" value={leaderPassword} onChange={(e) => setLeaderPassword(e.target.value)} placeholder="Mínimo 6 caracteres" className="text-sm" />
                  </div>
                  <Button type="submit" size="sm" disabled={loadingLeader}>
                    <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                    {loadingLeader ? "Cadastrando..." : "Cadastrar Líder"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" /> Líderes Cadastrados ({profiles.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profiles.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">Nenhum líder cadastrado.</p>
                ) : (
                  <div className="space-y-2">
                    {profiles.map((p, i) => (
                      <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                        className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                        <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground flex-shrink-0">
                          {p.full_name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{p.full_name}</p>
                          <p className="text-[10px] text-muted-foreground">{new Date(p.created_at).toLocaleDateString("pt-BR")}</p>
                        </div>
                        <Badge variant="outline" className="text-[10px] capitalize">{p.role}</Badge>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Modules Tab */}
          <TabsContent value="modules" className="space-y-4">
            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Plus className="h-4 w-4 text-primary" /> Adicionar Módulo de Trilha
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => { e.preventDefault(); createModule.mutate(); }} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Título do módulo *</Label>
                      <Input value={modTitle} onChange={(e) => setModTitle(e.target.value)} placeholder="Ex: Comunicação Assertiva" className="text-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Mês *</Label>
                      <Input value={modMonth} onChange={(e) => setModMonth(e.target.value)} placeholder="Ex: Mês 1" className="text-sm" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Descrição</Label>
                    <Textarea value={modDescription} onChange={(e) => setModDescription(e.target.value)} placeholder="Descrição do módulo..." className="text-sm min-h-[70px]" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 max-w-xs">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Aulas</Label>
                      <Input type="number" value={modLessons} onChange={(e) => setModLessons(e.target.value)} min="0" className="text-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Atividades</Label>
                      <Input type="number" value={modActivities} onChange={(e) => setModActivities(e.target.value)} min="0" className="text-sm" />
                    </div>
                  </div>
                  <Button type="submit" size="sm" disabled={createModule.isPending}>
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    {createModule.isPending ? "Criando..." : "Criar Módulo"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" /> Módulos Cadastrados ({modules.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {modules.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">Nenhum módulo cadastrado.</p>
                ) : (
                  <div className="space-y-2">
                    {modules.map((m, i) => (
                      <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                        className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{m.title}</p>
                          <p className="text-[10px] text-muted-foreground">{m.month} • {m.lessons} aulas • {m.activities} atividades</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-4">
            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Plus className="h-4 w-4 text-primary" /> Adicionar Tarefa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => { e.preventDefault(); createTask.mutate(); }} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Título da tarefa *</Label>
                      <Input value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder="Ex: Feedback para equipe" className="text-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Semana *</Label>
                      <Input value={taskWeek} onChange={(e) => setTaskWeek(e.target.value)} placeholder="Ex: Semana 1" className="text-sm" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Descrição</Label>
                    <Textarea value={taskDescription} onChange={(e) => setTaskDescription(e.target.value)} placeholder="Descrição da tarefa..." className="text-sm min-h-[70px]" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 max-w-xs">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Pontos</Label>
                      <Input type="number" value={taskPoints} onChange={(e) => setTaskPoints(e.target.value)} min="0" className="text-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Prazo</Label>
                      <Input type="date" value={taskDueDate} onChange={(e) => setTaskDueDate(e.target.value)} className="text-sm" />
                    </div>
                  </div>
                  <Button type="submit" size="sm" disabled={createTask.isPending}>
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    {createTask.isPending ? "Criando..." : "Criar Tarefa"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CheckSquare className="h-4 w-4 text-primary" /> Tarefas Cadastradas ({tasks.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {tasks.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">Nenhuma tarefa cadastrada.</p>
                ) : (
                  <div className="space-y-2">
                    {tasks.map((t, i) => (
                      <motion.div key={t.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                        className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <CheckSquare className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{t.title}</p>
                          <p className="text-[10px] text-muted-foreground">{t.week} • +{t.points} pts{t.due_date ? ` • Prazo: ${new Date(t.due_date).toLocaleDateString("pt-BR")}` : ""}</p>
                        </div>
                        <Badge variant="outline" className="text-[10px]">{t.week}</Badge>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
