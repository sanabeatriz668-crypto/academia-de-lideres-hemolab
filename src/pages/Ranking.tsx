import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Medal, Star, Flame, Target, Zap } from "lucide-react";
import { motion } from "framer-motion";

const leaders = [
  { name: "Ana Costa", role: "Líder de Produção", points: 520, streak: 8, level: "Ouro", progress: 92 },
  { name: "Carlos Silva", role: "Líder de Qualidade", points: 485, streak: 6, level: "Ouro", progress: 85 },
  { name: "Maria Lima", role: "Líder de Logística", points: 420, streak: 5, level: "Prata", progress: 78 },
  { name: "João Souza", role: "Líder de Manutenção", points: 380, streak: 3, level: "Prata", progress: 68 },
  { name: "Paula Reis", role: "Líder Administrativo", points: 340, streak: 4, level: "Bronze", progress: 60 },
  { name: "Ricardo Alves", role: "Líder de TI", points: 310, streak: 2, level: "Bronze", progress: 55 },
];

const levelColors: Record<string, string> = {
  Ouro: "bg-warning/10 text-warning border-warning/30",
  Prata: "bg-muted text-muted-foreground border-muted-foreground/20",
  Bronze: "bg-warning/5 text-warning/70 border-warning/20",
};

const badges = [
  { icon: Flame, label: "Sequência de 7 dias", earned: true },
  { icon: Target, label: "100% das tarefas", earned: true },
  { icon: Star, label: "Feedback 5 estrelas", earned: false },
  { icon: Zap, label: "Primeiro módulo", earned: true },
];

export default function Ranking() {
  return (
    <AppLayout title="Ranking & Gamificação" subtitle="Competição saudável entre líderes">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Podium */}
        <div className="grid grid-cols-3 gap-4 items-end">
          {[1, 0, 2].map((idx) => {
            const l = leaders[idx];
            const isFirst = idx === 0;
            return (
              <motion.div
                key={l.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className={`shadow-card text-center ${isFirst ? "border-warning/40 ring-1 ring-warning/20" : ""}`}>
                  <CardContent className={`p-4 ${isFirst ? "py-6" : ""}`}>
                    <div className="relative inline-block">
                      <div className={`h-14 w-14 mx-auto rounded-full gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground ${isFirst ? "h-16 w-16" : ""}`}>
                        {l.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      {isFirst && (
                        <Trophy className="absolute -top-2 -right-2 h-5 w-5 text-warning" />
                      )}
                    </div>
                    <p className="text-sm font-semibold text-foreground mt-2">{l.name}</p>
                    <p className="text-[10px] text-muted-foreground">{l.role}</p>
                    <p className="text-lg font-bold text-primary mt-1">{l.points}</p>
                    <p className="text-[10px] text-muted-foreground">pontos</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <Card className="shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Classificação Completa</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {leaders.map((l, i) => (
                  <motion.div
                    key={l.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <span className="text-sm font-bold text-muted-foreground w-5 text-center">
                      {i < 3 ? <Medal className={`h-4 w-4 ${i === 0 ? "text-warning" : i === 1 ? "text-muted-foreground" : "text-warning/60"}`} /> : i + 1}
                    </span>
                    <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground flex-shrink-0">
                      {l.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{l.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Progress value={l.progress} className="h-1 flex-1" />
                        <Badge variant="outline" className={`text-[9px] ${levelColors[l.level]}`}>{l.level}</Badge>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-primary">{l.points}</p>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <Flame className="h-3 w-3 text-warning" />{l.streak}d
                      </p>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Conquistas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {badges.map((b, i) => (
                <div key={b.label} className={`flex items-center gap-3 p-2 rounded-lg ${b.earned ? "" : "opacity-40"}`}>
                  <div className={`rounded-lg p-2 ${b.earned ? "gradient-primary" : "bg-muted"}`}>
                    <b.icon className={`h-4 w-4 ${b.earned ? "text-primary-foreground" : "text-muted-foreground"}`} />
                  </div>
                  <span className="text-xs font-medium text-foreground">{b.label}</span>
                  {b.earned && <Badge className="ml-auto text-[9px]">✓</Badge>}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
