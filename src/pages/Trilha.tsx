import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Clock, Lock, Play, FileText, ListChecks } from "lucide-react";
import { motion } from "framer-motion";

type ModuleStatus = "concluido" | "em_andamento" | "pendente";

interface Module {
  id: number;
  title: string;
  description: string;
  month: string;
  status: ModuleStatus;
  progress: number;
  lessons: number;
  activities: number;
}

const modules: Module[] = [
  { id: 1, title: "Autoconhecimento e Papel do Líder", description: "Entenda seu estilo de liderança e como ele impacta sua equipe.", month: "Mês 1", status: "concluido", progress: 100, lessons: 5, activities: 3 },
  { id: 2, title: "Comunicação Efetiva", description: "Técnicas de comunicação assertiva para líderes de equipe.", month: "Mês 1", status: "concluido", progress: 100, lessons: 4, activities: 2 },
  { id: 3, title: "Gestão de Conflitos", description: "Como mediar e resolver conflitos de forma construtiva.", month: "Mês 2", status: "em_andamento", progress: 60, lessons: 6, activities: 4 },
  { id: 4, title: "Feedback e Desenvolvimento", description: "A arte de dar e receber feedback de forma produtiva.", month: "Mês 2", status: "pendente", progress: 0, lessons: 4, activities: 3 },
  { id: 5, title: "Gestão do Tempo e Prioridades", description: "Organize sua rotina e priorize o que realmente importa.", month: "Mês 3", status: "pendente", progress: 0, lessons: 5, activities: 2 },
  { id: 6, title: "Liderança na Prática", description: "Projeto final: aplique tudo o que aprendeu em um desafio real.", month: "Mês 3", status: "pendente", progress: 0, lessons: 3, activities: 5 },
];

const statusConfig: Record<ModuleStatus, { label: string; variant: "default" | "secondary" | "outline"; icon: typeof CheckCircle2 }> = {
  concluido: { label: "Concluído", variant: "default", icon: CheckCircle2 },
  em_andamento: { label: "Em andamento", variant: "secondary", icon: Play },
  pendente: { label: "Pendente", variant: "outline", icon: Lock },
};

export default function Trilha() {
  return (
    <AppLayout title="Trilha de Desenvolvimento" subtitle="Seu programa de 3 meses">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4 p-4 rounded-xl bg-card border shadow-card">
          <div className="gradient-primary rounded-lg p-3">
            <ListChecks className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">Progresso Geral da Trilha</p>
            <p className="text-xs text-muted-foreground">2 de 6 módulos concluídos</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">33%</p>
          </div>
        </div>

        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border hidden md:block" />
          <div className="space-y-4">
            {modules.map((mod, i) => {
              const sc = statusConfig[mod.status];
              return (
                <motion.div
                  key={mod.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Card className={`shadow-card relative md:ml-12 ${
                    mod.status === "em_andamento" ? "border-primary/40 ring-1 ring-primary/20" : ""
                  } ${mod.status === "pendente" ? "opacity-60" : ""}`}>
                    <div className="absolute -left-[2.15rem] top-5 hidden md:flex h-5 w-5 rounded-full border-2 border-card items-center justify-center z-10"
                      style={{ backgroundColor: mod.status === "concluido" ? "hsl(152,60%,42%)" : mod.status === "em_andamento" ? "hsl(217,91%,50%)" : "hsl(215,15%,50%)" }}
                    >
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
                      {mod.status !== "pendente" && <Progress value={mod.progress} className="h-1.5" />}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
