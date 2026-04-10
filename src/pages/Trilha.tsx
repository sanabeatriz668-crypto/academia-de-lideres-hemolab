import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ListChecks } from "lucide-react";

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
            <p className="text-xs text-muted-foreground">0 de 0 módulos concluídos</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">0%</p>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="shadow-card">
            <CardContent className="p-8">
              <p className="text-sm text-muted-foreground text-center">Nenhum módulo disponível ainda.</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );
}
