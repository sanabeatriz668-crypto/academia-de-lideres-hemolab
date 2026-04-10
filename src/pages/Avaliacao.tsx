import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend,
} from "recharts";

const skillLabels: Record<string, string> = {
  comunicacao: "Comunicação",
  organizacao: "Organização",
  lideranca: "Liderança",
  resolucao_problemas: "Resolução de Problemas",
  empatia: "Empatia",
  proatividade: "Proatividade",
};

export default function Avaliacao() {
  const { user } = useAuth();

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

  const radarData = avgScores.map((s) => ({ skill: s.skill, equipe: s.equipe }));

  return (
    <AppLayout title="Avaliação 360°" subtitle="Feedback anônimo da equipe">
      <div className="max-w-5xl mx-auto space-y-6">
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
                      <RadarChart data={radarData}>
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

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
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
        </motion.div>
      </div>
    </AppLayout>
  );
}
