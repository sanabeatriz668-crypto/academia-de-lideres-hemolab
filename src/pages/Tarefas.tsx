import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, Calendar, Send } from "lucide-react";
import { motion } from "framer-motion";

interface Task {
  id: number;
  title: string;
  description: string;
  week: string;
  done: boolean;
  reflection: string;
  dueDate: string;
  points: number;
}

const initialTasks: Task[] = [
  { id: 1, title: "Praticar escuta ativa em 3 reuniões", description: "Observe como você escuta sua equipe. Anote insights.", week: "Semana 5", done: true, reflection: "Percebi que interrompo muito. Vou trabalhar nisso.", dueDate: "07/04", points: 15 },
  { id: 2, title: "Dar feedback positivo para 2 membros", description: "Reconheça algo específico que cada pessoa fez bem.", week: "Semana 5", done: false, reflection: "", dueDate: "10/04", points: 20 },
  { id: 3, title: "Registrar um conflito e como resolveu", description: "Documente uma situação de conflito e a abordagem utilizada.", week: "Semana 5", done: false, reflection: "", dueDate: "12/04", points: 25 },
  { id: 4, title: "Criar plano de prioridades semanal", description: "Liste suas 5 principais prioridades e delegue pelo menos 2.", week: "Semana 6", done: false, reflection: "", dueDate: "17/04", points: 15 },
];

export default function Tarefas() {
  const [tasks, setTasks] = useState(initialTasks);

  const toggleTask = (id: number) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const updateReflection = (id: number, reflection: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, reflection } : t))
    );
  };

  const completed = tasks.filter((t) => t.done).length;

  return (
    <AppLayout title="Gestão de Tarefas" subtitle="Suas tarefas semanais">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="shadow-card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Concluídas</p>
                <p className="text-lg font-bold text-foreground">{completed}/{tasks.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-lg bg-warning/10 p-2">
                <Clock className="h-4 w-4 text-warning" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pendentes</p>
                <p className="text-lg font-bold text-foreground">{tasks.length - completed}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-lg gradient-accent p-2">
                <Calendar className="h-4 w-4 text-accent-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pontos Possíveis</p>
                <p className="text-lg font-bold text-foreground">{tasks.reduce((s, t) => s + t.points, 0)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-3">
          {tasks.map((task, i) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Card className={`shadow-card transition-all ${task.done ? "border-success/30 bg-success/5" : ""}`}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={task.done}
                      onCheckedChange={() => toggleTask(task.id)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className={`text-sm font-medium ${task.done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                          {task.title}
                        </h3>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge variant="outline" className="text-[10px]">{task.week}</Badge>
                          <Badge variant="secondary" className="text-[10px]">+{task.points} pts</Badge>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
                      <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> Prazo: {task.dueDate}
                      </p>
                    </div>
                  </div>

                  {task.done && (
                    <div className="ml-7 space-y-2">
                      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
                        O que você aplicou na prática?
                      </p>
                      <div className="flex gap-2">
                        <Textarea
                          placeholder="Descreva sua experiência..."
                          value={task.reflection}
                          onChange={(e) => updateReflection(task.id, e.target.value)}
                          className="text-xs min-h-[60px]"
                        />
                        <Button size="icon" variant="ghost" className="flex-shrink-0 self-end">
                          <Send className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
