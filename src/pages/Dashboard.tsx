import { AppLayout } from "@/components/AppLayout";
import { StatCard } from "@/components/StatCard";
import { Users, TrendingUp, CheckCircle2, Trophy, BookOpen, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const barData = [
  { name: "Sem 1", concluidas: 12, pendentes: 3 },
  { name: "Sem 2", concluidas: 15, pendentes: 2 },
  { name: "Sem 3", concluidas: 10, pendentes: 5 },
  { name: "Sem 4", concluidas: 18, pendentes: 1 },
];

const pieData = [
  { name: "Concluído", value: 65 },
  { name: "Em andamento", value: 25 },
  { name: "Pendente", value: 10 },
];
const pieColors = ["hsl(152,60%,42%)", "hsl(217,91%,50%)", "hsl(215,15%,50%)"];

const leaders = [
  { name: "Ana Costa", progress: 85, points: 420 },
  { name: "Carlos Silva", progress: 72, points: 380 },
  { name: "Maria Lima", progress: 68, points: 340 },
  { name: "João Souza", progress: 55, points: 290 },
];

export default function Dashboard() {
  return (
    <AppLayout title="Dashboard" subtitle="Visão geral do programa">
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Users} title="Líderes Ativos" value="12" change="+2 este mês" changeType="positive" gradient="gradient-primary" />
          <StatCard icon={TrendingUp} title="Evolução Média" value="73%" change="+8% vs mês anterior" changeType="positive" />
          <StatCard icon={CheckCircle2} title="Tarefas Concluídas" value="55" change="92% de conclusão" changeType="positive" />
          <StatCard icon={Trophy} title="Pontos Totais" value="1.430" change="Meta: 2.000" changeType="neutral" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2">
            <Card className="shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Tarefas por Semana</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,25%,90%)" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="concluidas" fill="hsl(217,91%,50%)" radius={[4, 4, 0, 0]} name="Concluídas" />
                      <Bar dataKey="pendentes" fill="hsl(214,25%,90%)" radius={[4, 4, 0, 0]} name="Pendentes" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card className="shadow-card h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Progresso Geral</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center">
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" strokeWidth={2}>
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={pieColors[i]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex gap-4 mt-2">
                  {pieData.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-1.5 text-xs">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: pieColors[i] }} />
                      <span className="text-muted-foreground">{d.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-warning" /> Top Líderes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {leaders.map((l, i) => (
                  <div key={l.name} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
                    <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground flex-shrink-0">
                      {l.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{l.name}</p>
                      <Progress value={l.progress} className="h-1.5 mt-1" />
                    </div>
                    <span className="text-xs font-semibold text-primary">{l.points} pts</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Card className="shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4 text-info" /> Atividades Recentes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { text: "Ana Costa concluiu o Módulo 2", time: "2h atrás", icon: CheckCircle2 },
                  { text: "Novo módulo disponível: Gestão de Conflitos", time: "5h atrás", icon: BookOpen },
                  { text: "Carlos Silva recebeu feedback 360°", time: "1d atrás", icon: Users },
                  { text: "João Souza iniciou nova tarefa semanal", time: "1d atrás", icon: CheckCircle2 },
                ].map((a, i) => (
                  <div key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="rounded-full bg-primary/10 p-1.5 mt-0.5">
                      <a.icon className="h-3 w-3 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">{a.text}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{a.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}
