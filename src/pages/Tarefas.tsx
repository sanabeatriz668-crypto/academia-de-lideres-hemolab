import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Clock, Calendar, Send, Users } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

export default function Tarefas() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: meProfile } = useQuery({
    queryKey: ["me-role-tarefas", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("role").eq("user_id", user!.id).maybeSingle();
      return data;
    },
  });
  const isAdmin = meProfile?.role === "admin";
  const isLeader = meProfile?.role === "lider";
  const isManager = isAdmin || isLeader;

  const [viewUserId, setViewUserId] = useState<string>("");

  const { data: participants = [] } = useQuery({
    queryKey: ["tarefas-participants", user?.id, isAdmin, isLeader],
    enabled: isManager && !!user,
    queryFn: async () => {
      let q = supabase.from("profiles").select("user_id, full_name, leader_id, role").order("full_name");
      if (isLeader && !isAdmin) q = q.eq("leader_id", user!.id);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });

  const targetUserId = viewUserId || user?.id;
  const viewingOther = isManager && !!viewUserId && viewUserId !== user?.id;

  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data, error } = await supabase.from("tasks").select("*").order("created_at");
      if (error) throw error;
      return data;
    },
  });

  const { data: completions = [] } = useQuery({
    queryKey: ["task_completions", targetUserId],
    queryFn: async () => {
      const { data, error } = await supabase.from("task_completions").select("*").eq("user_id", targetUserId!);
      if (error) throw error;
      return data;
    },
    enabled: !!targetUserId,
  });

  const upsertCompletion = useMutation({
    mutationFn: async ({ taskId, done, reflection }: { taskId: string; done: boolean; reflection?: string }) => {
      const { error } = await supabase.from("task_completions").upsert(
        {
          user_id: user!.id,
          task_id: taskId,
          done,
          reflection: reflection || null,
          completed_at: done ? new Date().toISOString() : null,
        },
        { onConflict: "user_id,task_id" }
      );
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["task_completions"] }),
  });

  const getCompletion = (taskId: string) => completions.find((c) => c.task_id === taskId);
  const completedCount = completions.filter((c) => c.done).length;
  const viewedName = participants.find((p: any) => p.user_id === viewUserId)?.full_name;

  return (
    <AppLayout title="Gestão de Tarefas" subtitle="Suas tarefas semanais">
      <div className="max-w-3xl mx-auto space-y-6">
        {isManager && (
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" /> Ver respostas de participante
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={viewUserId || "self"} onValueChange={(v) => setViewUserId(v === "self" ? "" : v)}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Selecionar participante" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="self">Minhas tarefas</SelectItem>
                  {participants
                    .filter((p: any) => p.user_id !== user?.id)
                    .map((p: any) => (
                      <SelectItem key={p.user_id} value={p.user_id}>
                        {p.full_name} {p.role ? `(${p.role})` : ""}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {viewingOther && (
                <p className="text-xs text-muted-foreground mt-2">
                  Visualizando respostas de <span className="font-medium text-foreground">{viewedName}</span> (somente leitura).
                </p>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="shadow-card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2"><CheckCircle2 className="h-4 w-4 text-primary" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Concluídas</p>
                <p className="text-lg font-bold text-foreground">{completedCount}/{tasks.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-lg bg-warning/10 p-2"><Clock className="h-4 w-4 text-warning" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Pendentes</p>
                <p className="text-lg font-bold text-foreground">{tasks.length - completedCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-lg gradient-accent p-2"><Calendar className="h-4 w-4 text-accent-foreground" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Pontos Possíveis</p>
                <p className="text-lg font-bold text-foreground">{tasks.reduce((s, t) => s + t.points, 0)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {tasks.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="p-8">
              <p className="text-sm text-muted-foreground text-center">Nenhuma tarefa atribuída ainda.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {tasks.map((task, i) => {
              const comp = getCompletion(task.id);
              const done = comp?.done || false;
              return (
                <motion.div key={task.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                  <TaskCard
                    task={task}
                    done={done}
                    reflection={comp?.reflection || ""}
                    readOnly={viewingOther}
                    targetUserId={targetUserId!}
                    onToggle={() => upsertCompletion.mutate({ taskId: task.id, done: !done, reflection: comp?.reflection || "" })}
                    onSaveReflection={(r) => {
                      upsertCompletion.mutate({ taskId: task.id, done: true, reflection: r });
                      toast.success("Reflexão salva!");
                    }}
                  />
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function TaskCard({ task, done, reflection, readOnly, targetUserId, onToggle, onSaveReflection }: {
  task: any; done: boolean; reflection: string; readOnly: boolean; targetUserId: string;
  onToggle: () => void; onSaveReflection: (r: string) => void;
}) {
  const queryClient = useQueryClient();
  const [text, setText] = useState(reflection);

  const { data: questions = [] } = useQuery({
    queryKey: ["task_questions", task.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("task_questions")
        .select("*")
        .eq("task_id", task.id)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const { data: answers = [] } = useQuery({
    queryKey: ["task_question_answers", task.id, targetUserId],
    enabled: !!targetUserId && questions.length > 0,
    queryFn: async () => {
      const ids = questions.map((q: any) => q.id);
      const { data, error } = await supabase
        .from("task_question_answers")
        .select("*")
        .eq("user_id", targetUserId)
        .in("question_id", ids);
      if (error) throw error;
      return data;
    },
  });

  const saveAnswer = useMutation({
    mutationFn: async ({ questionId, answer }: { questionId: string; answer: string }) => {
      const { error } = await supabase.from("task_question_answers").upsert(
        { question_id: questionId, user_id: targetUserId, answer_text: answer },
        { onConflict: "question_id,user_id" }
      );
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Resposta salva!");
      queryClient.invalidateQueries({ queryKey: ["task_question_answers", task.id, targetUserId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Card className={`shadow-card transition-all ${done ? "border-success/30 bg-success/5" : ""}`}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          <Checkbox checked={done} onCheckedChange={readOnly ? undefined : onToggle} disabled={readOnly} className="mt-1" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className={`text-sm font-medium ${done ? "line-through text-muted-foreground" : "text-foreground"}`}>{task.title}</h3>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge variant="outline" className="text-[10px]">{task.week}</Badge>
                <Badge variant="secondary" className="text-[10px]">+{task.points} pts</Badge>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
            {task.due_date && (
              <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Prazo: {new Date(task.due_date).toLocaleDateString("pt-BR")}
              </p>
            )}
          </div>
        </div>
        {task.case_study && (
          <div className="ml-7 rounded-lg border bg-muted/40 p-3">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-1.5">Estudo de caso</p>
            <p className="text-xs whitespace-pre-wrap leading-relaxed">{task.case_study}</p>
          </div>
        )}
        {questions.length > 0 && (
          <div className="ml-7 space-y-3 pt-2 border-t">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
              {readOnly ? "Respostas do participante" : "Perguntas"}
            </p>
            {questions.map((q: any, idx: number) => (
              <QuestionField
                key={q.id}
                index={idx}
                question={q}
                initial={answers.find((a: any) => a.question_id === q.id)?.answer_text || ""}
                readOnly={readOnly}
                onSave={(a) => saveAnswer.mutate({ questionId: q.id, answer: a })}
              />
            ))}
          </div>
        )}
        {done && (
          <div className="ml-7 space-y-2">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
              {readOnly ? "Reflexão do participante" : "O que você aplicou na prática?"}
            </p>
            {readOnly ? (
              <p className="text-xs whitespace-pre-wrap p-2 rounded border bg-muted/30 min-h-[40px]">
                {reflection || <span className="italic text-muted-foreground">Sem reflexão registrada.</span>}
              </p>
            ) : (
              <div className="flex gap-2">
                <Textarea placeholder="Descreva sua experiência..." value={text} onChange={(e) => setText(e.target.value)} className="text-xs min-h-[60px]" />
                <Button size="icon" variant="ghost" className="flex-shrink-0 self-end" onClick={() => onSaveReflection(text)}>
                  <Send className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function QuestionField({ index, question, initial, readOnly, onSave }: { index: number; question: any; initial: string; readOnly: boolean; onSave: (a: string) => void }) {
  const [val, setVal] = useState(initial);
  return (
    <div className="space-y-1.5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-foreground flex-1">{index + 1}. {question.question_text}</p>
        {question.points > 0 && <Badge variant="secondary" className="text-[10px] flex-shrink-0">{question.points} pts</Badge>}
      </div>
      {readOnly ? (
        <p className="text-xs whitespace-pre-wrap p-2 rounded border bg-muted/30 min-h-[40px]">
          {initial || <span className="italic text-muted-foreground">Sem resposta.</span>}
        </p>
      ) : (
        <div className="flex gap-2">
          <Textarea value={val} onChange={(e) => setVal(e.target.value)} placeholder="Sua resposta..." className="text-xs min-h-[50px]" />
          <Button size="icon" variant="ghost" className="self-end" onClick={() => onSave(val)}>
            <Send className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
}
