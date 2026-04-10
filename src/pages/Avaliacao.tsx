import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function Avaliacao() {
  return (
    <AppLayout title="Avaliação 360°" subtitle="Feedback anônimo da equipe">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="shadow-card h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Gráfico de Competências</CardTitle>
                <p className="text-xs text-muted-foreground">Autoavaliação vs. Avaliação da equipe</p>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground py-12 text-center">Nenhuma avaliação realizada ainda.</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="shadow-card h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Scores por Competência</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground py-12 text-center">Sem dados de competências.</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Feedbacks Recentes (Anônimos)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground py-8 text-center">Nenhum feedback recebido ainda.</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );
}
