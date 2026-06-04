import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, Plus, Users, BookOpen, CheckSquare, GraduationCap, Star, Trash2, HelpCircle, FileText, Upload } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

  // ---- Modules / Trilha ----
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
      toast.success("Módulo da trilha criado!");
      setModTitle(""); setModDescription(""); setModMonth(""); setModLessons("0"); setModActivities("0");
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
      setTaskTitle(""); setTaskDescription(""); setTaskWeek(""); setTaskPoints("10"); setTaskDueDate("");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // ---- Trainings ----
  const [trTitle, setTrTitle] = useState("");
  const [trDescription, setTrDescription] = useState("");
  const [trCategory, setTrCategory] = useState("");
  const [trLink, setTrLink] = useState("");
  const [trDuration, setTrDuration] = useState("0");

  const { data: trainings = [] } = useQuery({
    queryKey: ["trainings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("trainings").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createTraining = useMutation({
    mutationFn: async () => {
      if (!trTitle.trim()) throw new Error("Título é obrigatório");
      const { error } = await supabase.from("trainings").insert({
        title: trTitle.trim(),
        description: trDescription.trim() || null,
        category: trCategory.trim() || null,
        link: trLink.trim() || null,
        duration_minutes: parseInt(trDuration) || 0,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Treinamento criado!");
      setTrTitle(""); setTrDescription(""); setTrCategory(""); setTrLink(""); setTrDuration("0");
      queryClient.invalidateQueries({ queryKey: ["trainings"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // ---- Evaluation criteria ----
  const [critName, setCritName] = useState("");
  const [critDescription, setCritDescription] = useState("");

  const { data: criteria = [] } = useQuery({
    queryKey: ["evaluation_criteria"],
    queryFn: async () => {
      const { data, error } = await supabase.from("evaluation_criteria").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const createCriterion = useMutation({
    mutationFn: async () => {
      if (!critName.trim()) throw new Error("Nome do critério é obrigatório");
      const { error } = await supabase.from("evaluation_criteria").insert({
        name: critName.trim(),
        description: critDescription.trim() || null,
        sort_order: criteria.length,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Critério adicionado!");
      setCritName(""); setCritDescription("");
      queryClient.invalidateQueries({ queryKey: ["evaluation_criteria"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // ---- Generic delete ----
  const deleteRow = useMutation({
    mutationFn: async ({ table, id }: { table: "profiles" | "modules" | "tasks" | "trainings" | "evaluation_criteria"; id: string }) => {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
      return table;
    },
    onSuccess: (table) => {
      toast.success("Excluído com sucesso");
      queryClient.invalidateQueries({ queryKey: [table] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateRole = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      const { error } = await supabase.from("profiles").update({ role }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Permissão atualizada");
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const DeleteButton = ({ table, id, label }: { table: "profiles" | "modules" | "tasks" | "trainings" | "evaluation_criteria"; id: string; label: string }) => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:bg-destructive/10 flex-shrink-0">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir {label}?</AlertDialogTitle>
          <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={() => deleteRow.mutate({ table, id })} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return (
    <AppLayout title="Administração" subtitle="Gerenciar líderes, trilha, tarefas, treinamentos e avaliações">
      <div className="max-w-5xl mx-auto">
        <Tabs defaultValue="leaders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 gap-1 h-auto">
            <TabsTrigger value="leaders" className="text-xs gap-1.5"><Users className="h-3.5 w-3.5" /> Líderes</TabsTrigger>
            <TabsTrigger value="modules" className="text-xs gap-1.5"><BookOpen className="h-3.5 w-3.5" /> Trilha</TabsTrigger>
            <TabsTrigger value="tasks" className="text-xs gap-1.5"><CheckSquare className="h-3.5 w-3.5" /> Tarefas</TabsTrigger>
            <TabsTrigger value="trainings" className="text-xs gap-1.5"><GraduationCap className="h-3.5 w-3.5" /> Treinamentos</TabsTrigger>
            <TabsTrigger value="evaluation" className="text-xs gap-1.5"><Star className="h-3.5 w-3.5" /> Avaliação</TabsTrigger>
          </TabsList>

          {/* Leaders */}
          <TabsContent value="leaders" className="space-y-4">
            <Card className="shadow-card">
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><UserPlus className="h-4 w-4 text-primary" /> Cadastrar Novo Líder</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleCreateLeader} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5"><Label className="text-xs">Nome completo</Label><Input value={leaderName} onChange={(e) => setLeaderName(e.target.value)} placeholder="Nome do líder" className="text-sm" /></div>
                    <div className="space-y-1.5"><Label className="text-xs">E-mail</Label><Input type="email" value={leaderEmail} onChange={(e) => setLeaderEmail(e.target.value)} placeholder="email@empresa.com" className="text-sm" /></div>
                  </div>
                  <div className="space-y-1.5 max-w-xs"><Label className="text-xs">Senha inicial</Label><Input type="password" value={leaderPassword} onChange={(e) => setLeaderPassword(e.target.value)} placeholder="Mínimo 6 caracteres" className="text-sm" /></div>
                  <Button type="submit" size="sm" disabled={loadingLeader}><UserPlus className="h-3.5 w-3.5 mr-1.5" />{loadingLeader ? "Cadastrando..." : "Cadastrar Líder"}</Button>
                </form>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> Líderes Cadastrados ({profiles.length})</CardTitle></CardHeader>
              <CardContent>
                {profiles.length === 0 ? <p className="text-sm text-muted-foreground text-center py-6">Nenhum líder cadastrado.</p> : (
                  <div className="space-y-2">
                    {profiles.map((p, i) => (
                      <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                        <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground">{p.full_name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}</div>
                        <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{p.full_name}</p><p className="text-[10px] text-muted-foreground">{new Date(p.created_at).toLocaleDateString("pt-BR")}</p></div>
                        <Select value={p.role} onValueChange={(role) => updateRole.mutate({ id: p.id, role })}>
                          <SelectTrigger className="h-8 w-[110px] text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="lider">Líder</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <DeleteButton table="profiles" id={p.id} label="líder" />
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trilha / Módulos */}
          <TabsContent value="modules" className="space-y-4">
            <Card className="shadow-card">
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Plus className="h-4 w-4 text-primary" /> Adicionar Módulo da Trilha</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={(e) => { e.preventDefault(); createModule.mutate(); }} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5"><Label className="text-xs">Título *</Label><Input value={modTitle} onChange={(e) => setModTitle(e.target.value)} placeholder="Ex: Comunicação Assertiva" className="text-sm" /></div>
                    <div className="space-y-1.5"><Label className="text-xs">Mês *</Label><Input value={modMonth} onChange={(e) => setModMonth(e.target.value)} placeholder="Ex: Mês 1" className="text-sm" /></div>
                  </div>
                  <div className="space-y-1.5"><Label className="text-xs">Descrição</Label><Textarea value={modDescription} onChange={(e) => setModDescription(e.target.value)} className="text-sm min-h-[70px]" /></div>
                  <div className="grid grid-cols-2 gap-4 max-w-xs">
                    <div className="space-y-1.5"><Label className="text-xs">Aulas</Label><Input type="number" value={modLessons} onChange={(e) => setModLessons(e.target.value)} min="0" className="text-sm" /></div>
                    <div className="space-y-1.5"><Label className="text-xs">Atividades</Label><Input type="number" value={modActivities} onChange={(e) => setModActivities(e.target.value)} min="0" className="text-sm" /></div>
                  </div>
                  <Button type="submit" size="sm" disabled={createModule.isPending}><Plus className="h-3.5 w-3.5 mr-1.5" />{createModule.isPending ? "Criando..." : "Criar Módulo"}</Button>
                </form>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><BookOpen className="h-4 w-4 text-primary" /> Módulos ({modules.length})</CardTitle></CardHeader>
              <CardContent>
                {modules.length === 0 ? <p className="text-sm text-muted-foreground text-center py-6">Nenhum módulo cadastrado.</p> : (
                  <div className="space-y-2">
                    {modules.map((m, i) => (
                      <div key={m.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{i + 1}</div>
                        <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{m.title}</p><p className="text-[10px] text-muted-foreground">{m.month} • {m.lessons} aulas • {m.activities} atividades</p></div>
                        <DeleteButton table="modules" id={m.id} label="módulo" />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tasks */}
          <TabsContent value="tasks" className="space-y-4">
            <Card className="shadow-card">
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Plus className="h-4 w-4 text-primary" /> Adicionar Tarefa</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={(e) => { e.preventDefault(); createTask.mutate(); }} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5"><Label className="text-xs">Título *</Label><Input value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} className="text-sm" /></div>
                    <div className="space-y-1.5"><Label className="text-xs">Semana *</Label><Input value={taskWeek} onChange={(e) => setTaskWeek(e.target.value)} placeholder="Ex: Semana 1" className="text-sm" /></div>
                  </div>
                  <div className="space-y-1.5"><Label className="text-xs">Descrição</Label><Textarea value={taskDescription} onChange={(e) => setTaskDescription(e.target.value)} className="text-sm min-h-[70px]" /></div>
                  <div className="grid grid-cols-2 gap-4 max-w-xs">
                    <div className="space-y-1.5"><Label className="text-xs">Pontos</Label><Input type="number" value={taskPoints} onChange={(e) => setTaskPoints(e.target.value)} min="0" className="text-sm" /></div>
                    <div className="space-y-1.5"><Label className="text-xs">Prazo</Label><Input type="date" value={taskDueDate} onChange={(e) => setTaskDueDate(e.target.value)} className="text-sm" /></div>
                  </div>
                  <Button type="submit" size="sm" disabled={createTask.isPending}><Plus className="h-3.5 w-3.5 mr-1.5" />{createTask.isPending ? "Criando..." : "Criar Tarefa"}</Button>
                </form>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><CheckSquare className="h-4 w-4 text-primary" /> Tarefas ({tasks.length})</CardTitle></CardHeader>
              <CardContent>
                {tasks.length === 0 ? <p className="text-sm text-muted-foreground text-center py-6">Nenhuma tarefa cadastrada.</p> : (
                  <div className="space-y-2">
                    {tasks.map((t) => (
                      <div key={t.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center"><CheckSquare className="h-4 w-4 text-primary" /></div>
                        <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{t.title}</p><p className="text-[10px] text-muted-foreground">{t.week} • +{t.points} pts{t.due_date ? ` • ${new Date(t.due_date).toLocaleDateString("pt-BR")}` : ""}</p></div>
                        <TaskQuestionsManager taskId={t.id} taskTitle={t.title} />
                        <DeleteButton table="tasks" id={t.id} label="tarefa" />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trainings */}
          <TabsContent value="trainings" className="space-y-4">
            <Card className="shadow-card">
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Plus className="h-4 w-4 text-primary" /> Adicionar Treinamento</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={(e) => { e.preventDefault(); createTraining.mutate(); }} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5"><Label className="text-xs">Título *</Label><Input value={trTitle} onChange={(e) => setTrTitle(e.target.value)} placeholder="Ex: Liderança Situacional" className="text-sm" /></div>
                    <div className="space-y-1.5"><Label className="text-xs">Categoria</Label><Input value={trCategory} onChange={(e) => setTrCategory(e.target.value)} placeholder="Ex: Soft Skills" className="text-sm" /></div>
                  </div>
                  <div className="space-y-1.5"><Label className="text-xs">Descrição</Label><Textarea value={trDescription} onChange={(e) => setTrDescription(e.target.value)} className="text-sm min-h-[70px]" /></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5"><Label className="text-xs">Link / URL</Label><Input value={trLink} onChange={(e) => setTrLink(e.target.value)} placeholder="https://..." className="text-sm" /></div>
                    <div className="space-y-1.5"><Label className="text-xs">Duração (min)</Label><Input type="number" value={trDuration} onChange={(e) => setTrDuration(e.target.value)} min="0" className="text-sm" /></div>
                  </div>
                  <Button type="submit" size="sm" disabled={createTraining.isPending}><Plus className="h-3.5 w-3.5 mr-1.5" />{createTraining.isPending ? "Criando..." : "Criar Treinamento"}</Button>
                </form>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><GraduationCap className="h-4 w-4 text-primary" /> Treinamentos ({trainings.length})</CardTitle></CardHeader>
              <CardContent>
                {trainings.length === 0 ? <p className="text-sm text-muted-foreground text-center py-6">Nenhum treinamento cadastrado.</p> : (
                  <div className="space-y-2">
                    {trainings.map((t) => (
                      <div key={t.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center"><GraduationCap className="h-4 w-4 text-primary" /></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{t.title}</p>
                          <p className="text-[10px] text-muted-foreground">{t.category || "Geral"}{t.duration_minutes ? ` • ${t.duration_minutes} min` : ""}</p>
                        </div>
                        <TrainingDocsManager trainingId={t.id} trainingTitle={t.title} />
                        <DeleteButton table="trainings" id={t.id} label="treinamento" />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Evaluation criteria */}
          <TabsContent value="evaluation" className="space-y-4">
            <Card className="shadow-card">
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Plus className="h-4 w-4 text-primary" /> Adicionar Critério da Avaliação 360°</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={(e) => { e.preventDefault(); createCriterion.mutate(); }} className="space-y-4">
                  <div className="space-y-1.5"><Label className="text-xs">Nome do critério *</Label><Input value={critName} onChange={(e) => setCritName(e.target.value)} placeholder="Ex: Comunicação" className="text-sm" /></div>
                  <div className="space-y-1.5"><Label className="text-xs">Descrição</Label><Textarea value={critDescription} onChange={(e) => setCritDescription(e.target.value)} placeholder="O que será avaliado..." className="text-sm min-h-[70px]" /></div>
                  <Button type="submit" size="sm" disabled={createCriterion.isPending}><Plus className="h-3.5 w-3.5 mr-1.5" />{createCriterion.isPending ? "Criando..." : "Criar Critério"}</Button>
                </form>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Star className="h-4 w-4 text-primary" /> Critérios ({criteria.length})</CardTitle></CardHeader>
              <CardContent>
                {criteria.length === 0 ? <p className="text-sm text-muted-foreground text-center py-6">Nenhum critério cadastrado.</p> : (
                  <div className="space-y-2">
                    {criteria.map((c, i) => (
                      <div key={c.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">{i + 1}</div>
                        <div className="flex-1 min-w-0"><p className="text-sm font-medium">{c.name}</p>{c.description && <p className="text-[10px] text-muted-foreground">{c.description}</p>}</div>
                        <DeleteButton table="evaluation_criteria" id={c.id} label="critério" />
                      </div>
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

function TaskQuestionsManager({ taskId, taskTitle }: { taskId: string; taskTitle: string }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");

  const { data: questions = [] } = useQuery({
    queryKey: ["task_questions", taskId],
    enabled: open,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("task_questions")
        .select("*")
        .eq("task_id", taskId)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const addQ = useMutation({
    mutationFn: async () => {
      if (!text.trim()) throw new Error("Digite a pergunta");
      const { error } = await supabase.from("task_questions").insert({
        task_id: taskId,
        question_text: text.trim(),
        question_type: "text",
        sort_order: questions.length,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setText("");
      qc.invalidateQueries({ queryKey: ["task_questions", taskId] });
      toast.success("Pergunta adicionada");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const delQ = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("task_questions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["task_questions", taskId] }),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost" className="h-7 w-7 text-primary hover:bg-primary/10" title="Perguntas">
          <HelpCircle className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-sm">Perguntas: {taskTitle}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="flex gap-2">
            <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Digite a pergunta para o participante..." className="text-sm min-h-[60px]" />
            <Button size="sm" onClick={() => addQ.mutate()} disabled={addQ.isPending} className="self-end">
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {questions.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">Nenhuma pergunta ainda.</p>
            ) : questions.map((q: any, i: number) => (
              <div key={q.id} className="flex items-start gap-2 p-2 rounded border bg-card">
                <Badge variant="outline" className="text-[10px]">{i + 1}</Badge>
                <p className="flex-1 text-xs">{q.question_text}</p>
                <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => delQ.mutate(q.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TrainingDocsManager({ trainingId, trainingTitle }: { trainingId: string; trainingTitle: string }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const { data: docs = [] } = useQuery({
    queryKey: ["training_documents", trainingId],
    enabled: open,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("training_documents")
        .select("*")
        .eq("training_id", trainingId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const upload = async () => {
    if (!file || !title.trim() || !user) {
      toast.error("Informe título e arquivo");
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `trainings/${trainingId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: upErr } = await supabase.storage.from("library").upload(path, file, { contentType: file.type });
      if (upErr) throw upErr;
      const { error } = await supabase.from("training_documents").insert({
        training_id: trainingId,
        title: title.trim(),
        file_path: path,
        file_type: file.type,
        file_size: file.size,
        uploaded_by: user.id,
      });
      if (error) throw error;
      toast.success("Documento enviado");
      setTitle(""); setFile(null);
      qc.invalidateQueries({ queryKey: ["training_documents", trainingId] });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setUploading(false);
    }
  };

  const delDoc = useMutation({
    mutationFn: async (doc: any) => {
      await supabase.storage.from("library").remove([doc.file_path]);
      const { error } = await supabase.from("training_documents").delete().eq("id", doc.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["training_documents", trainingId] }),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost" className="h-7 w-7 text-primary hover:bg-primary/10" title="Documentos">
          <FileText className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-sm">Documentos: {trainingTitle}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-2 p-3 border rounded">
            <Input placeholder="Título do documento" value={title} onChange={(e) => setTitle(e.target.value)} className="text-sm" />
            <Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-sm" />
            <Button size="sm" onClick={upload} disabled={uploading}>
              <Upload className="h-3.5 w-3.5 mr-1.5" />{uploading ? "Enviando..." : "Enviar documento"}
            </Button>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {docs.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">Nenhum documento ainda.</p>
            ) : docs.map((d: any) => (
              <div key={d.id} className="flex items-center gap-2 p-2 rounded border bg-card">
                <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                <p className="flex-1 text-xs truncate">{d.title}</p>
                <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => delDoc.mutate(d)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
