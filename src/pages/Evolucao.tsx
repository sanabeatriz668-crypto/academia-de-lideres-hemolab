import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarCheck, Plus, Sparkles, AlertTriangle, Target } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

export default function Evolucao() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [strengths, setStrengths] = useState("");
  const [improvements, setImprovements] = useState("");
  const [actionPlan, setActionPlan] = useState("");
  const [meetingDate, setMeetingDate] = useState(new Date().toISOString().split("T")[0]);

  const { data: checkins = [] } = useQuery({
    queryKey: ["evolution_checkins", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("evolution_checkins").select("*").eq("user_id", user!.id).order("meeting_date", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const createCheckin = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("evolution_checkins").insert({
        user_id: user!.id,
        strengths,
        improvements,
        action_plan: actionPlan,
        meeting_date: meetingDate,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evolution_checkins"] });
      toast.success("Check-in registrado!");
      setShowForm(false);
      setStrengths("");
      setImprovements("");
      setActionPlan("");
    },
  });

  return (
    <AppLayout title="Check-in de Evolução" subtitle="Reuniões quinzenais de acompanhamento">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">Registre pontos fortes, melhorias e planos de ação.</p>
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-1" /> Novo Check-in
          </Button>
        </div>

        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="shadow-card border-primary/30">
              <CardContent className="p-4 space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs">Data da reunião</Label>
                  <Input type="date" value={meetingDate} onChange={(e) => setMeetingDate(e.target.value)} className="text-sm" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs flex items-center gap-1"><Sparkles className="h-3 w-3 text-success" /> Pontos Fortes</Label>
                  <Textarea placeholder="O que está indo bem..." value={strengths} onChange={(e) => setStrengths(e.target.value)} className="text-sm min-h-[60px]" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs flex items-center gap-1"><AlertTriangle className="h-3 w-3 text-warning" /> Pontos de Melhoria</Label>
                  <Textarea placeholder="O que pode melhorar..." value={improvements} onChange={(e) => setImprovements(e.target.value)} className="text-sm min-h-[60px]" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs flex items-center gap-1"><Target className="h-3 w-3 text-primary" /> Plano de Ação</Label>
                  <Textarea placeholder="Próximos passos..." value={actionPlan} onChange={(e) => setActionPlan(e.target.value)} className="text-sm min-h-[60px]" />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => createCheckin.mutate()} disabled={createCheckin.isPending}>
                    {createCheckin.isPending ? "Salvando..." : "Salvar Check-in"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {checkins.length === 0 && !showForm ? (
          <Card className="shadow-card">
            <CardContent className="p-8">
              <p className="text-sm text-muted-foreground text-center">Nenhum check-in registrado ainda.</p>
            </CardContent>
          </Card>
        ) : (
          checkins.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="shadow-card">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <CalendarCheck className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm">{new Date(c.meeting_date).toLocaleDateString("pt-BR")}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {c.strengths && (
                    <div>
                      <p className="text-[10px] font-medium text-success uppercase tracking-widest mb-1">Pontos Fortes</p>
                      <p className="text-sm text-foreground">{c.strengths}</p>
                    </div>
                  )}
                  {c.improvements && (
                    <div>
                      <p className="text-[10px] font-medium text-warning uppercase tracking-widest mb-1">Melhorias</p>
                      <p className="text-sm text-foreground">{c.improvements}</p>
                    </div>
                  )}
                  {c.action_plan && (
                    <div>
                      <p className="text-[10px] font-medium text-primary uppercase tracking-widest mb-1">Plano de Ação</p>
                      <p className="text-sm text-foreground">{c.action_plan}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </AppLayout>
  );
}
