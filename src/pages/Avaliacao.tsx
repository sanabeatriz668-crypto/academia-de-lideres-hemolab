import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend,
} from "recharts";
import { useState } from "react";
import { toast } from "sonner";
import { ClipboardList, Plus, Trash2, Eye, Send, FileText } from "lucide-react";

const skillLabels: Record<string, string> = {
  comunicacao: "Comunicação",
  organizacao: "Organização",
  lideranca: "Liderança",
  resolucao_problemas: "Resolução de Problemas",
  empatia: "Empatia",
  proatividade: "Proatividade",
};

type Question = {
  id: string;
  form_id: string;
  question_text: string;
  question_type: "text" | "scale" | "choice";
  options: string[] | null;
  sort_order: number;
};

export default function Avaliacao() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: me } = useQuery({
    queryKey: ["me-role", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("role").eq("user_id", user!.id).maybeSingle();
      return data;
    },
    enabled: !!user,
  });
  const isAdmin = me?.role === "admin";

  // ---- 360 data ----
  const { data: evaluations = [] } = useQuery({
    queryKey: ["evaluations", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("evaluations").select("*").eq("evaluated_id", user!.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: feedbacks = [] } = useQuery({
    queryKey: ["feedbacks", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("feedbacks").select("*").eq("target_id", user!.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const hasEvaluations = evaluations.length > 0;
  const avgScores = hasEvaluations
    ? Object.keys(skillLabels).map((key) => {
        const avg = evaluations.reduce((sum, e: any) => sum + Number(e[key]), 0) / evaluations.length;
        return { skill: skillLabels[key], equipe: Math.round(avg * 10) / 10 };
      })
    : [];

  // ---- Forms ----
  const { data: forms = [] } = useQuery({
    queryKey: ["evaluation_forms"],
    queryFn: async () => {
      const { data, error } = await supabase.from("evaluation_forms").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Create form
  const [fTitle, setFTitle] = useState("");
  const [fDesc, setFDesc] = useState("");
  const createForm = useMutation({
    mutationFn: async () => {
      if (!fTitle.trim()) throw new Error("Título é obrigatório");
      const { error } = await supabase.from("evaluation_forms").insert({
        title: fTitle.trim(),
        description: fDesc.trim() || null,
        created_by: user!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Formulário criado!");
      setFTitle(""); setFDesc("");
      queryClient.invalidateQueries({ queryKey: ["evaluation_forms"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteForm = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("evaluation_forms").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Formulário excluído");
      queryClient.invalidateQueries({ queryKey: ["evaluation_forms"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from("evaluation_forms").update({ active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["evaluation_forms"] }),
  });

  // Dialogs
  const [manageForm, setManageForm] = useState<any | null>(null);
  const [answerForm, setAnswerForm] = useState<any | null>(null);
  const [resultsForm, setResultsForm] = useState<any | null>(null);

  return (
    <AppLayout title="Avaliação 360°" subtitle="Feedback da equipe e formulários personalizados">
      <div className="max-w-5xl mx-auto">
        <Tabs defaultValue="competencias" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 gap-1 h-auto">
            <TabsTrigger value="competencias" className="text-xs gap-1.5">
              <FileText className="h-3.5 w-3.5" /> Competências
            </TabsTrigger>
            <TabsTrigger value="formularios" className="text-xs gap-1.5">
              <ClipboardList className="h-3.5 w-3.5" /> Formulários
            </TabsTrigger>
          </TabsList>

          {/* ---- Competências (existente) ---- */}
          <TabsContent value="competencias" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="shadow-card h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold">Gráfico de Competências</CardTitle>
                    <p className="text-xs text-muted-foreground">Avaliação média da equipe</p>
                  </CardHeader>
                  <CardContent>
                    {hasEvaluations ? (
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart data={avgScores}>
                            <PolarGrid stroke="hsl(214,25%,90%)" />
                            <PolarAngleAxis dataKey="skill" tick={{ fontSize: 10 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fontSize: 10 }} />
                            <Radar name="Equipe" dataKey="equipe" stroke="hsl(170,60%,45%)" fill="hsl(170,60%,45%)" fillOpacity={0.3} />
                            <Legend wrapperStyle={{ fontSize: 11 }} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground py-12 text-center">Nenhuma avaliação realizada ainda.</p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card className="shadow-card h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold">Scores por Competência</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {hasEvaluations ? avgScores.map((d) => (
                      <div key={d.skill} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-foreground font-medium">{d.skill}</span>
                          <span className="text-muted-foreground">{d.equipe}/5.0</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full gradient-primary transition-all duration-500" style={{ width: `${(d.equipe / 5) * 100}%` }} />
                        </div>
                      </div>
                    )) : (
                      <p className="text-sm text-muted-foreground py-12 text-center">Sem dados de competências.</p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <Card className="shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Feedbacks Recentes (Anônimos)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {feedbacks.length > 0 ? feedbacks.map((f) => (
                  <div key={f.id} className="p-3 rounded-lg bg-muted/50 border">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-medium text-primary uppercase tracking-widest">{f.area}</span>
                      <span className="text-[10px] text-muted-foreground">{new Date(f.created_at).toLocaleDateString("pt-BR")}</span>
                    </div>
                    <p className="text-sm text-foreground italic">"{f.message}"</p>
                  </div>
                )) : (
                  <p className="text-sm text-muted-foreground py-8 text-center">Nenhum feedback recebido ainda.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ---- Formulários ---- */}
          <TabsContent value="formularios" className="space-y-4">
            {isAdmin && (
              <Card className="shadow-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Plus className="h-4 w-4 text-primary" /> Criar Formulário
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={(e) => { e.preventDefault(); createForm.mutate(); }} className="space-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Título *</Label>
                      <Input value={fTitle} onChange={(e) => setFTitle(e.target.value)} className="text-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Descrição</Label>
                      <Textarea value={fDesc} onChange={(e) => setFDesc(e.target.value)} className="text-sm min-h-[60px]" />
                    </div>
                    <Button type="submit" size="sm" disabled={createForm.isPending}>
                      <Plus className="h-3.5 w-3.5 mr-1.5" />
                      {createForm.isPending ? "Criando..." : "Criar Formulário"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-primary" /> Formulários ({forms.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {forms.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">Nenhum formulário disponível.</p>
                ) : (
                  <div className="space-y-2">
                    {forms.map((f: any) => (
                      <div key={f.id} className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 rounded-lg border bg-card">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-medium truncate">{f.title}</p>
                            <Badge variant={f.active ? "default" : "outline"} className="text-[10px]">
                              {f.active ? "Ativo" : "Inativo"}
                            </Badge>
                          </div>
                          {f.description && <p className="text-[11px] text-muted-foreground line-clamp-2">{f.description}</p>}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {!isAdmin && f.active && (
                            <Button size="sm" variant="default" onClick={() => setAnswerForm(f)}>
                              <Send className="h-3.5 w-3.5 mr-1.5" /> Responder
                            </Button>
                          )}
                          {isAdmin && (
                            <>
                              <Button size="sm" variant="outline" onClick={() => setManageForm(f)}>
                                <Plus className="h-3.5 w-3.5 mr-1.5" /> Perguntas
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setResultsForm(f)}>
                                <Eye className="h-3.5 w-3.5 mr-1.5" /> Respostas
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => toggleActive.mutate({ id: f.id, active: !f.active })}>
                                {f.active ? "Desativar" : "Ativar"}
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10">
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Excluir formulário?</AlertDialogTitle>
                                    <AlertDialogDescription>Todas as perguntas e respostas serão removidas.</AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => deleteForm.mutate(f.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )}
                          {!isAdmin && (
                            <Button size="sm" variant="outline" onClick={() => setResultsForm(f)}>
                              <Eye className="h-3.5 w-3.5 mr-1.5" /> Resultados
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {manageForm && (
        <ManageQuestionsDialog form={manageForm} onClose={() => setManageForm(null)} />
      )}
      {answerForm && (
        <AnswerFormDialog form={answerForm} onClose={() => setAnswerForm(null)} userId={user!.id} />
      )}
      {resultsForm && (
        <ResultsDialog form={resultsForm} onClose={() => setResultsForm(null)} />
      )}
    </AppLayout>
  );
}

// ---------- Dialogs ----------

function ManageQuestionsDialog({ form, onClose }: { form: any; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const [type, setType] = useState<"text" | "scale" | "choice">("text");
  const [optionsRaw, setOptionsRaw] = useState("");
  const [correct, setCorrect] = useState("");

  const { data: questions = [] } = useQuery({
    queryKey: ["form_questions", form.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("form_questions").select("*").eq("form_id", form.id).order("sort_order");
      if (error) throw error;
      return data as any[];
    },
  });

  const addQuestion = useMutation({
    mutationFn: async () => {
      if (!text.trim()) throw new Error("Pergunta obrigatória");
      const options = type === "choice"
        ? optionsRaw.split(",").map((s) => s.trim()).filter(Boolean)
        : null;
      if (type === "choice" && (!options || options.length < 2)) throw new Error("Adicione ao menos 2 opções (separadas por vírgula)");
      if (type === "choice" && correct.trim() && !options!.includes(correct.trim())) {
        throw new Error("A alternativa correta precisa ser igual a uma das opções");
      }
      const { error } = await supabase.from("form_questions").insert({
        form_id: form.id,
        question_text: text.trim(),
        question_type: type,
        options,
        correct_answer: type === "choice" && correct.trim() ? correct.trim() : null,
        sort_order: questions.length,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Pergunta adicionada");
      setText(""); setOptionsRaw(""); setType("text"); setCorrect("");
      queryClient.invalidateQueries({ queryKey: ["form_questions", form.id] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeQuestion = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("form_questions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["form_questions", form.id] }),
  });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{form.title}</DialogTitle>
          <DialogDescription>Adicione e gerencie as perguntas do formulário.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 border rounded-lg p-3 bg-muted/30">
          <div className="space-y-1.5">
            <Label className="text-xs">Pergunta</Label>
            <Input value={text} onChange={(e) => setText(e.target.value)} className="text-sm" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Tipo</Label>
              <Select value={type} onValueChange={(v) => setType(v as any)}>
                <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Texto livre</SelectItem>
                  <SelectItem value="scale">Escala (1 a 5)</SelectItem>
                  <SelectItem value="choice">Múltipla escolha</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {type === "choice" && (
              <div className="space-y-1.5">
                <Label className="text-xs">Opções (separe por vírgula)</Label>
                <Input value={optionsRaw} onChange={(e) => setOptionsRaw(e.target.value)} placeholder="Sim, Não, Talvez" className="text-sm" />
              </div>
            )}
          </div>
          {type === "choice" && (
            <div className="space-y-1.5">
              <Label className="text-xs">Alternativa correta (opcional — deixe em branco para questão sem gabarito)</Label>
              <Select value={correct || "__none"} onValueChange={(v) => setCorrect(v === "__none" ? "" : v)}>
                <SelectTrigger className="text-sm"><SelectValue placeholder="Selecione a alternativa correta" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none">Sem gabarito</SelectItem>
                  {optionsRaw.split(",").map((s) => s.trim()).filter(Boolean).map((op) => (
                    <SelectItem key={op} value={op}>{op}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <Button size="sm" onClick={() => addQuestion.mutate()} disabled={addQuestion.isPending}>
            <Plus className="h-3.5 w-3.5 mr-1.5" /> Adicionar pergunta
          </Button>
        </div>

        <div className="space-y-2">
          {questions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Sem perguntas ainda.</p>
          ) : questions.map((q, i) => (
            <div key={q.id} className="flex items-start gap-2 p-2 rounded-lg border bg-card">
              <div className="h-6 w-6 rounded bg-primary/10 text-primary text-xs flex items-center justify-center flex-shrink-0">{i + 1}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{q.question_text}</p>
                <p className="text-[10px] text-muted-foreground">
                  {q.question_type === "text" ? "Texto livre" : q.question_type === "scale" ? "Escala 1-5" : `Opções: ${(q.options ?? []).join(", ")}`}
                </p>
                {q.correct_answer && (
                  <p className="text-[10px] text-success font-medium mt-0.5">✓ Correta: {q.correct_answer}</p>
                )}
              </div>
              <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => removeQuestion.mutate(q.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AnswerFormDialog({ form, onClose, userId }: { form: any; onClose: () => void; userId: string }) {
  const queryClient = useQueryClient();
  const [answers, setAnswers] = useState<Record<string, { text?: string; number?: number }>>({});

  const { data: questions = [] } = useQuery({
    queryKey: ["form_questions", form.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("form_questions").select("*").eq("form_id", form.id).order("sort_order");
      if (error) throw error;
      return data as Question[];
    },
  });

  const submit = useMutation({
    mutationFn: async () => {
      if (questions.length === 0) throw new Error("Formulário sem perguntas");
      const { data: response, error } = await supabase
        .from("form_responses")
        .insert({ form_id: form.id, respondent_id: userId })
        .select()
        .single();
      if (error) throw error;
      const payload = questions.map((q) => ({
        response_id: response.id,
        question_id: q.id,
        answer_text: answers[q.id]?.text ?? null,
        answer_number: answers[q.id]?.number ?? null,
      }));
      const { error: e2 } = await supabase.from("form_answers").insert(payload);
      if (e2) throw e2;
    },
    onSuccess: () => {
      toast.success("Resposta enviada!");
      queryClient.invalidateQueries({ queryKey: ["form_responses"] });
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{form.title}</DialogTitle>
          {form.description && <DialogDescription>{form.description}</DialogDescription>}
        </DialogHeader>

        <div className="space-y-4">
          {questions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Este formulário ainda não tem perguntas.</p>
          ) : questions.map((q, i) => (
            <div key={q.id} className="space-y-2">
              <Label className="text-sm font-medium">{i + 1}. {q.question_text}</Label>
              {q.question_type === "text" && (
                <Textarea
                  className="text-sm"
                  value={answers[q.id]?.text ?? ""}
                  onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: { text: e.target.value } }))}
                />
              )}
              {q.question_type === "scale" && (
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Button
                      key={n}
                      type="button"
                      size="sm"
                      variant={answers[q.id]?.number === n ? "default" : "outline"}
                      onClick={() => setAnswers((a) => ({ ...a, [q.id]: { number: n } }))}
                    >
                      {n}
                    </Button>
                  ))}
                </div>
              )}
              {q.question_type === "choice" && (
                <Select
                  value={answers[q.id]?.text ?? ""}
                  onValueChange={(v) => setAnswers((a) => ({ ...a, [q.id]: { text: v } }))}
                >
                  <SelectTrigger className="text-sm"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {(q.options ?? []).map((op) => (
                      <SelectItem key={op} value={op}>{op}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => submit.mutate()} disabled={submit.isPending || questions.length === 0}>
            <Send className="h-3.5 w-3.5 mr-1.5" />
            {submit.isPending ? "Enviando..." : "Enviar respostas"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ResultsDialog({ form, onClose }: { form: any; onClose: () => void }) {
  const { data: questions = [] } = useQuery({
    queryKey: ["form_questions", form.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("form_questions").select("*").eq("form_id", form.id).order("sort_order");
      if (error) throw error;
      return data as Question[];
    },
  });

  const { data: responses = [] } = useQuery({
    queryKey: ["form_responses", form.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("form_responses").select("*").eq("form_id", form.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: answers = [] } = useQuery({
    queryKey: ["form_answers", form.id, responses.map((r: any) => r.id).join(",")],
    queryFn: async () => {
      if (responses.length === 0) return [];
      const { data, error } = await supabase
        .from("form_answers")
        .select("*")
        .in("response_id", responses.map((r: any) => r.id));
      if (error) throw error;
      return data;
    },
    enabled: responses.length > 0,
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ["profiles-min"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("user_id, full_name");
      if (error) throw error;
      return data;
    },
  });
  const nameByUser = Object.fromEntries(profiles.map((p: any) => [p.user_id, p.full_name]));

  const questionById = Object.fromEntries(questions.map((q) => [q.id, q]));

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Respostas — {form.title}</DialogTitle>
          <DialogDescription>{responses.length} resposta(s) recebida(s).</DialogDescription>
        </DialogHeader>

        {responses.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Nenhuma resposta ainda.</p>
        ) : (
          <div className="space-y-4">
            {responses.map((r: any) => {
              const ras = answers.filter((a: any) => a.response_id === r.id);
              return (
                <div key={r.id} className="border rounded-lg p-3 bg-card space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{nameByUser[r.respondent_id] ?? "Participante"}</p>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(r.created_at).toLocaleString("pt-BR")}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {ras.map((a: any) => {
                      const q = questionById[a.question_id];
                      const isChoice = q?.question_type === "choice" && q?.correct_answer;
                      const isCorrect = isChoice && a.answer_text === q.correct_answer;
                      return (
                        <div key={a.id} className="text-xs">
                          <p className="text-muted-foreground">{q?.question_text ?? "Pergunta"}</p>
                          <p className="text-foreground font-medium">
                            {a.answer_number ?? a.answer_text ?? "—"}
                            {isChoice && (
                              <span className={`ml-2 text-[10px] font-semibold ${isCorrect ? "text-success" : "text-destructive"}`}>
                                {isCorrect ? "✓ Correta" : `✗ (correta: ${q.correct_answer})`}
                              </span>
                            )}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
