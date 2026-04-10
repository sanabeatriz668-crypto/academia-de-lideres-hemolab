import { AppLayout } from "@/components/AppLayout";
import { StatCard } from "@/components/StatCard";
import { Users, TrendingUp, CheckCircle2, Trophy, BookOpen, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function Dashboard() {
  return (
    <AppLayout title="Dashboard" subtitle="Visão geral do programa">
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Users} title="Líderes Ativos" value="0" change="Nenhum cadastrado" changeType="neutral" gradient="gradient-primary" />
          <StatCard icon={TrendingUp} title="Evolução Média" value="0%" change="Sem dados" changeType="neutral" />
          <StatCard icon={CheckCircle2} title="Tarefas Concluídas" value="0" change="Sem tarefas" changeType="neutral" />
          <StatCard icon={Trophy} title="Pontos Totais" value="0" change="Meta: 2.000" changeType="neutral" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-warning" /> Top Líderes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground py-8 text-center">Nenhum líder cadastrado ainda.</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card className="shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4 text-info" /> Atividades Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground py-8 text-center">Nenhuma atividade registrada.</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}
