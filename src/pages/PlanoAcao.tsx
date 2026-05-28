import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Target, Plus, Trash2, CheckCircle2, Clock, AlertCircle, User, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { motion } from "framer-motion";

const priorityConfig: Record<string, { label: string; color: string }> = {
  alta: { label: "Alta", color: "bg-destructive/10 text-destructive border-destructive/30" },
  media: { label: "Média", color: "bg-warning/10 text-warning border-warning/30" },
  baixa: { label: "Baixa", color: "bg-muted text-muted-foreground border-border" },
};

const statusConfig: Record<string, { label: string; icon: typeof Clock; color: string }> = {
  pendente: { label: "Pendente", icon: Clock, color: "text-muted-foreground" },
  em_andamento: { label: "Em andamento", icon: AlertCircle, color: "text-warning" },
  concluido: { label: "Concluído", icon: CheckCircle2, color: "text-success" },
};

export default function PlanoAcao() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("media");
  const [assignedTo, setAssignedTo] = useState<string>("self");

  const [openPlan, setOpenPlan] = useState<any | null>(null);
  const [notesDraft, setNotesDraft] = useState("");
  const [statusDraft, setStatusDraft] = useState("pendente");

  useEffect(() => {
    if (openPlan) {
      setNotesDraft(openPlan.progress_notes || "");
      setStatusDraft(openPlan.status || "pendente");
    }
  }, [openPlan]);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("role").eq("user_id", user!.id).maybeSingle();
      return data;
    },
  });
  const isAdmin = profile?.role === "admin";

  const { data: leaders = [] } = useQuery({
    queryKey: ["leaders-list"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, full_name, role")
        .order("full_name");
      if (error) throw error;
      return data;
    },
  });

  const { data: plans = [] } = useQuery({
    queryKey: ["action_plans", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("action_plans")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const leaderNameById = (id: string) =>
    leaders.find((l) => l.user_id === id)?.full_name || "Líder";

  const createPlan = useMutation({
    mutationFn: async () => {
      if (!title.trim()) throw new Error("Informe um título para o plano");
      if (!user) throw new Error("Usuário não autenticado");
      const targetUserId = assignedTo !== "self" ? assignedTo : user.id;
      const { error } = await supabase.from("action_plans").insert({
        user_id: targetUserId,
        title: title.trim(),
        description: description.trim() || null,
        due_date: dueDate || null,
        priority,
        status: "pendente",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Plano de ação criado!");
      setTitle(""); setDescription(""); setDueDate(""); setPriority("media"); setAssignedTo("self");
      queryClient.invalidateQueries({ queryKey: ["action_plans"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updatePlan = useMutation({
    mutationFn: async ({ id, status, progress_notes }: { id: string; status?: string; progress_notes?: string }) => {
      const payload: any = { updated_at: new Date().toISOString() };
      if (status !== undefined) payload.status = status;
      if (progress_notes !== undefined) payload.progress_notes = progress_notes;
      const { error } = await supabase.from("action_plans").update(payload).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Plano atualizado");
      queryClient.invalidateQueries({ queryKey: ["action_plans"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deletePlan = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("action_plans").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Plano removido");
      queryClient.invalidateQueries({ queryKey: ["action_plans"] });
      setOpenPlan(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const stats = {
    total: plans.length,
    concluidos: plans.filter((p) => p.status === "concluido").length,
    andamento: plans.filter((p) => p.status === "em_andamento").length,
    pendentes: plans.filter((p) => p.status === "pendente").length,
  };

  return (
    <AppLayout title="Plano de Ação" subtitle="Defina suas metas e acompanhe seu progresso como líder">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total", value: stats.total, color: "text-primary" },
            { label: "Pendentes", value: stats.pendentes, color: "text-muted-foreground" },
            { label: "Em andamento", value: stats.andamento, color: "text-warning" },
            { label: "Concluídos", value: stats.concluidos, color: "text-success" },
          ].map((s) => (
            <Card key={s.label} className="shadow-card">
              <CardContent className="p-4">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</p>
                <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {isAdmin && (
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Plus className="h-4 w-4 text-primary" /> Novo Plano de Ação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => { e.preventDefault(); createPlan.mutate(); }} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Atribuir ao líder *</Label>
                  <Select value={assignedTo} onValueChange={setAssignedTo}>
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Selecione um líder" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="self">Para mim mesmo</SelectItem>
                      {leaders
                        .filter((l) => l.user_id !== user?.id)
                        .map((l) => (
                          <SelectItem key={l.user_id} value={l.user_id}>
                            {l.full_name} {l.role === "admin" ? "(admin)" : ""}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Título *</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Melhorar feedback à equipe" className="text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Descrição / Como pretendo fazer</Label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="text-sm min-h-[80px]" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Prazo</Label>
                    <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Prioridade</Label>
                    <Select value={priority} onValueChange={setPriority}>
                      <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="alta">Alta</SelectItem>
                        <SelectItem value="media">Média</SelectItem>
                        <SelectItem value="baixa">Baixa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit" size="sm" disabled={createPlan.isPending}>
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  {createPlan.isPending ? "Salvando..." : "Adicionar Plano"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              {isAdmin ? `Planos de Ação (${plans.length})` : `Meus Planos (${plans.length})`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {plans.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhum plano de ação atribuído ainda.
              </p>
            ) : (
              <div className="space-y-3">
                {plans.map((p, i) => {
                  const StatusIcon = statusConfig[p.status]?.icon || Clock;
                  return (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="p-4 rounded-lg border bg-card space-y-3 cursor-pointer hover:border-primary/40 transition"
                      onClick={() => setOpenPlan(p)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-semibold">{p.title}</h3>
                            <Badge variant="outline" className={`text-[10px] ${priorityConfig[p.priority]?.color}`}>
                              {priorityConfig[p.priority]?.label}
                            </Badge>
                            {isAdmin && (
                              <Badge variant="secondary" className="text-[10px] gap-1">
                                <User className="h-3 w-3" />
                                {p.user_id === user?.id ? "Você" : leaderNameById(p.user_id)}
                              </Badge>
                            )}
                          </div>
                          {p.description && (
                            <p className="text-xs text-muted-foreground mt-1.5 whitespace-pre-wrap line-clamp-2">{p.description}</p>
                          )}
                          <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                            <span className={`flex items-center gap-1 ${statusConfig[p.status]?.color}`}>
                              <StatusIcon className="h-3 w-3" />
                              {statusConfig[p.status]?.label}
                            </span>
                            {p.due_date && (
                              <span>Prazo: {new Date(p.due_date).toLocaleDateString("pt-BR")}</span>
                            )}
                          </div>
                        </div>
                        <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setOpenPlan(p); }}>
                          <Eye className="h-3.5 w-3.5 mr-1" /> Abrir
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!openPlan} onOpenChange={(o) => !o && setOpenPlan(null)}>
        <DialogContent className="max-w-2xl">
          {openPlan && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" /> {openPlan.title}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className={`text-[10px] ${priorityConfig[openPlan.priority]?.color}`}>
                    Prioridade: {priorityConfig[openPlan.priority]?.label}
                  </Badge>
                  {openPlan.due_date && (
                    <Badge variant="secondary" className="text-[10px]">
                      Prazo: {new Date(openPlan.due_date).toLocaleDateString("pt-BR")}
                    </Badge>
                  )}
                  {isAdmin && (
                    <Badge variant="secondary" className="text-[10px] gap-1">
                      <User className="h-3 w-3" />
                      {openPlan.user_id === user?.id ? "Você" : leaderNameById(openPlan.user_id)}
                    </Badge>
                  )}
                </div>

                {openPlan.description && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Descrição</Label>
                    <p className="text-sm whitespace-pre-wrap mt-1">{openPlan.description}</p>
                  </div>
                )}

                <div>
                  <Label className="text-xs">Status</Label>
                  <Select value={statusDraft} onValueChange={setStatusDraft}>
                    <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="em_andamento">Em andamento</SelectItem>
                      <SelectItem value="concluido">Concluído</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">Acompanhamento / Notas de execução</Label>
                  <Textarea
                    value={notesDraft}
                    onChange={(e) => setNotesDraft(e.target.value)}
                    className="text-sm min-h-[120px]"
                    placeholder="Registre o que foi feito, dificuldades, próximos passos..."
                  />
                </div>
              </div>
              <DialogFooter className="gap-2 sm:gap-2">
                {isAdmin && (
                  <Button
                    variant="ghost"
                    className="text-destructive hover:bg-destructive/10 mr-auto"
                    onClick={() => deletePlan.mutate(openPlan.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Excluir
                  </Button>
                )}
                <Button variant="outline" onClick={() => setOpenPlan(null)}>Fechar</Button>
                <Button
                  onClick={() =>
                    updatePlan.mutate(
                      { id: openPlan.id, status: statusDraft, progress_notes: notesDraft },
                      { onSuccess: () => setOpenPlan(null) }
                    )
                  }
                  disabled={updatePlan.isPending}
                >
                  Salvar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
