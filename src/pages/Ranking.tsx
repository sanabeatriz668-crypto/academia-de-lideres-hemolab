import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function Ranking() {
  return (
    <AppLayout title="Ranking & Gamificação" subtitle="Competição saudável entre líderes">
      <div className="max-w-4xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Classificação</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground py-12 text-center">Nenhum líder no ranking ainda.</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Conquistas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground py-8 text-center">Nenhuma conquista desbloqueada.</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );
}
