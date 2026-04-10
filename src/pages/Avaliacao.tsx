import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
} from "recharts";

const radarData = [
  { skill: "Comunicação", autoavaliacao: 4, equipe: 3.5 },
  { skill: "Organização", autoavaliacao: 3.5, equipe: 4 },
  { skill: "Liderança", autoavaliacao: 4.5, equipe: 3.8 },
  { skill: "Resolução de Problemas", autoavaliacao: 3.8, equipe: 3.2 },
  { skill: "Empatia", autoavaliacao: 4.2, equipe: 4.5 },
  { skill: "Proatividade", autoavaliacao: 3.5, equipe: 3.7 },
];

const feedbacks = [
  { id: 1, text: "Líder muito acessível, mas poderia ser mais direto nas reuniões.", date: "05/04/2026", area: "Comunicação" },
  { id: 2, text: "Sempre organizado e respeita prazos. Excelente!", date: "03/04/2026", area: "Organização" },
  { id: 3, text: "Gostaria de receber feedback mais frequente sobre meu desempenho.", date: "01/04/2026", area: "Liderança" },
];

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
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="hsl(214,25%,90%)" />
                      <PolarAngleAxis dataKey="skill" tick={{ fontSize: 10 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fontSize: 10 }} />
                      <Radar name="Autoavaliação" dataKey="autoavaliacao" stroke="hsl(217,91%,50%)" fill="hsl(217,91%,50%)" fillOpacity={0.2} />
                      <Radar name="Equipe" dataKey="equipe" stroke="hsl(170,60%,45%)" fill="hsl(170,60%,45%)" fillOpacity={0.2} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="shadow-card h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Scores por Competência</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {radarData.map((d) => (
                  <div key={d.skill} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-foreground font-medium">{d.skill}</span>
                      <span className="text-muted-foreground">{d.equipe}/5.0</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full gradient-primary transition-all duration-500"
                        style={{ width: `${(d.equipe / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
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
              {feedbacks.map((f) => (
                <div key={f.id} className="p-3 rounded-lg bg-muted/50 border">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-medium text-primary uppercase tracking-widest">{f.area}</span>
                    <span className="text-[10px] text-muted-foreground">{f.date}</span>
                  </div>
                  <p className="text-sm text-foreground italic">"{f.text}"</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );
}
