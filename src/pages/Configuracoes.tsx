import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { User, Lock } from "lucide-react";

export default function Configuracoes() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || "");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) { toast.error("Nome é obrigatório"); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ data: { full_name: fullName.trim() } });
    if (!error) {
      await supabase.from("profiles").update({ full_name: fullName.trim() }).eq("user_id", user!.id);
      toast.success("Perfil atualizado!");
    } else {
      toast.error(error.message);
    }
    setLoading(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) { toast.error("A senha deve ter no mínimo 6 caracteres"); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (!error) {
      toast.success("Senha atualizada!");
      setNewPassword("");
    } else {
      toast.error(error.message);
    }
    setLoading(false);
  };

  return (
    <AppLayout title="Configurações" subtitle="Gerencie sua conta">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <User className="h-4 w-4 text-primary" /> Dados do Perfil
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Nome completo</Label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">E-mail</Label>
                <Input value={user?.email || ""} disabled className="text-sm bg-muted" />
              </div>
              <Button type="submit" size="sm" disabled={loading}>Salvar Alterações</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" /> Alterar Senha
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Nova senha</Label>
                <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Mínimo 6 caracteres" className="text-sm" />
              </div>
              <Button type="submit" size="sm" disabled={loading}>Atualizar Senha</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
