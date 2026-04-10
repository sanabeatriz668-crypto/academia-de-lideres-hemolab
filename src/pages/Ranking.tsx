import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Medal, Flame } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export default function Ranking() {
  const { data: profiles = [] } = useQuery({
    queryKey: ["ranking_profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("role", "lider");
      if (error) throw error;
      return data;
    },
  });

  const { data: completions = [] } = useQuery({
    queryKey: ["all_task_completions"],
    queryFn: async () => {
      // We can only see our own completions due to RLS, so ranking is limited
      const { data, error } = await supabase.from("task_completions").select("*").eq("done", true);
      if (error) throw error;
      return data || [];
    },
  });

  return (
    <AppLayout title="Ranking & Gamificação" subtitle="Competição saudável entre líderes">
      <div className="max-w-4xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Classificação</CardTitle>
            </CardHeader>
            <CardContent>
              {profiles.length > 0 ? (
                <div className="space-y-3">
                  {profiles.map((l, i) => (
                    <div key={l.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <span className="text-sm font-bold text-muted-foreground w-5 text-center">
                        {i < 3 ? <Medal className={`h-4 w-4 ${i === 0 ? "text-warning" : i === 1 ? "text-muted-foreground" : "text-warning/60"}`} /> : i + 1}
                      </span>
                      <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground flex-shrink-0">
                        {l.full_name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{l.full_name}</p>
                        <p className="text-[10px] text-muted-foreground">{l.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-12 text-center">Nenhum líder no ranking ainda.</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );
}
