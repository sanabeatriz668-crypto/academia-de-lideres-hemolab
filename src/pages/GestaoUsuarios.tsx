import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Users, Trash2, ShieldCheck } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { signupClient } from "@/integrations/supabase/signup-client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";

const ROLE_LABEL: Record<string, string> = {
  admin: "Admin",
  lider: "Líder",
  participante: "Participante",
};

const ROLE_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  admin: "default",
  lider: "secondary",
  participante: "outline",
};

export default function GestaoUsuarios() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("participante");
  const [leaderId, setLeaderId] = useState<string>("none");
  const [loading, setLoading] = useState(false);

  const { data: me } = useQuery({
    queryKey: ["me-role", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("role").eq("user_id", user!.id).maybeSingle();
      return data;
    },
    enabled: !!user,
  });
  const isAdmin = me?.role === "admin";

  const { data: profiles = [] } = useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const leaders = profiles.filter((p: any) => p.role === "lider" || p.role === "admin");
  const leaderById = Object.fromEntries(leaders.map((l: any) => [l.user_id, l.full_name]));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) { toast.error("Apenas admins podem cadastrar."); return; }
    if (!name.trim() || !email.trim() || !password.trim()) { toast.error("Preencha todos os campos"); return; }
    if (password.length < 6) { toast.error("Senha deve ter no mínimo 6 caracteres"); return; }
    setLoading(true);
    // Usa um cliente separado que NÃO persiste sessão, para não deslogar o admin
    const { data, error } = await signupClient.auth.signUp({
      email, password,
      options: { data: { full_name: name } },
    });
    if (error) { setLoading(false); toast.error(error.message); return; }

    // Atualiza role + leader_id após o trigger criar o perfil (executado pelo admin atual)
    if (data.user) {
      await new Promise((r) => setTimeout(r, 700));
      await supabase.from("profiles").update({
        role,
        leader_id: leaderId !== "none" ? leaderId : null,
      }).eq("user_id", data.user.id);
    }
    // Encerra qualquer sessão criada no cliente auxiliar (não afeta o admin)
    await signupClient.auth.signOut();

    setLoading(false);
    toast.success("Usuário cadastrado!");
    setName(""); setEmail(""); setPassword(""); setRole("participante"); setLeaderId("none");
    queryClient.invalidateQueries({ queryKey: ["profiles"] });
  };

  const updateRole = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      const { error } = await supabase.from("profiles").update({ role }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Permissão atualizada"); queryClient.invalidateQueries({ queryKey: ["profiles"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateLeader = useMutation({
    mutationFn: async ({ id, leader_id }: { id: string; leader_id: string | null }) => {
      const { error } = await supabase.from("profiles").update({ leader_id }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Líder vinculado"); queryClient.invalidateQueries({ queryKey: ["profiles"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteUser = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("profiles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Usuário excluído"); queryClient.invalidateQueries({ queryKey: ["profiles"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AppLayout title="Gestão de Usuários" subtitle="Cadastre participantes, atribua líderes e gerencie permissões">
      <div className="max-w-5xl mx-auto space-y-6">
        {isAdmin && (
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-primary" /> Cadastrar Usuário
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Nome completo</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} className="text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">E-mail</Label>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Senha inicial</Label>
                    <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="text-sm" placeholder="Mín. 6 caracteres" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Perfil</Label>
                    <Select value={role} onValueChange={setRole}>
                      <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="participante">Participante</SelectItem>
                        <SelectItem value="lider">Líder</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Líder responsável</Label>
                    <Select value={leaderId} onValueChange={setLeaderId}>
                      <SelectTrigger className="text-sm"><SelectValue placeholder="Nenhum" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Nenhum</SelectItem>
                        {leaders.map((l: any) => (
                          <SelectItem key={l.user_id} value={l.user_id}>{l.full_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit" size="sm" disabled={loading}>
                  <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                  {loading ? "Cadastrando..." : "Cadastrar Usuário"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" /> Usuários ({profiles.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {profiles.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Nenhum usuário cadastrado.</p>
            ) : (
              <div className="space-y-2">
                {profiles.map((p: any, i: number) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border bg-card"
                  >
                    <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground flex-shrink-0">
                      {p.full_name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium truncate">{p.full_name}</p>
                        <Badge variant={ROLE_VARIANT[p.role] ?? "outline"} className="text-[10px]">
                          {ROLE_LABEL[p.role] ?? p.role}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        {p.leader_id && leaderById[p.leader_id] ? `Líder: ${leaderById[p.leader_id]}` : "Sem líder vinculado"}
                      </p>
                    </div>

                    {isAdmin && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <Select value={p.role} onValueChange={(role) => updateRole.mutate({ id: p.id, role })}>
                          <SelectTrigger className="h-8 w-[120px] text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="participante">Participante</SelectItem>
                            <SelectItem value="lider">Líder</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>

                        <Select
                          value={p.leader_id ?? "none"}
                          onValueChange={(v) => updateLeader.mutate({ id: p.id, leader_id: v === "none" ? null : v })}
                        >
                          <SelectTrigger className="h-8 w-[150px] text-xs"><SelectValue placeholder="Líder" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Sem líder</SelectItem>
                            {leaders.filter((l: any) => l.user_id !== p.user_id).map((l: any) => (
                              <SelectItem key={l.user_id} value={l.user_id}>{l.full_name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:bg-destructive/10">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir usuário?</AlertDialogTitle>
                              <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteUser.mutate(p.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {!isAdmin && (
          <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" />
            Apenas administradores podem cadastrar usuários e alterar permissões.
          </p>
        )}
      </div>
    </AppLayout>
  );
}
