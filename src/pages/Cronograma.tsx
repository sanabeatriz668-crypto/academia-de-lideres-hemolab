import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDays, Plus, Trash2, User, MapPin, Clock, Users, UserPlus, X } from "lucide-react";

import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type ScheduleEvent = {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  instructor: string | null;
  location: string | null;
  class_id: string | null;
};

type ClassRow = { id: string; name: string; description: string | null };
type Profile = { id: string; user_id: string; full_name: string; role: string };
type ClassMember = { id: string; class_id: string; user_id: string };

export default function Cronograma() {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    event_date: "",
    start_time: "",
    end_time: "",
    instructor: "",
    location: "",
    class_id: "",
  });

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
  });
  const isAdmin = profile?.role === "admin";

  const { data: classesList = [] } = useQuery({
    queryKey: ["classes"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("classes")
        .select("id, name")
        .order("name");
      if (error) throw error;
      return data as { id: string; name: string }[];
    },
  });


  const { data: events = [], isLoading } = useQuery({
    queryKey: ["schedule_events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("schedule_events")
        .select("*")
        .order("event_date", { ascending: true });
      if (error) throw error;
      return data as ScheduleEvent[];
    },
  });

  const createEvent = useMutation({
    mutationFn: async () => {
      const payload = {
        title: form.title,
        description: form.description || null,
        event_date: form.event_date,
        start_time: form.start_time || null,
        end_time: form.end_time || null,
        instructor: form.instructor || null,
        location: form.location || null,
        class_id: form.class_id || null,
      };
      const { error } = await (supabase as any).from("schedule_events").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Evento cadastrado com sucesso!" });
      qc.invalidateQueries({ queryKey: ["schedule_events"] });
      setOpen(false);
      setForm({
        title: "",
        description: "",
        event_date: "",
        start_time: "",
        end_time: "",
        instructor: "",
        location: "",
        class_id: "",
      });
    },
    onError: (e: any) =>
      toast({ title: "Erro ao cadastrar", description: e.message, variant: "destructive" }),
  });

  const deleteEvent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("schedule_events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Evento removido" });
      qc.invalidateQueries({ queryKey: ["schedule_events"] });
    },
    onError: (e: any) =>
      toast({ title: "Erro ao excluir", description: e.message, variant: "destructive" }),
  });

  return (
    <AppLayout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <CalendarDays className="h-7 w-7 text-primary" />
            Cronograma de Treinamentos
          </h1>
          <p className="text-muted-foreground">
            Datas, horários, ministrantes e turmas dos treinamentos.
          </p>
        </div>

        <Tabs defaultValue="eventos" className="space-y-4">
          <TabsList>
            <TabsTrigger value="eventos">
              <CalendarDays className="h-4 w-4 mr-2" /> Eventos
            </TabsTrigger>
            <TabsTrigger value="turmas">
              <Users className="h-4 w-4 mr-2" /> Turmas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="eventos" className="space-y-4">
            {isAdmin && (
              <div className="flex justify-end">
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Novo evento
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Cadastrar evento</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                      <div>
                        <Label>Título *</Label>
                        <Input
                          value={form.title}
                          onChange={(e) => setForm({ ...form, title: e.target.value })}
                          placeholder="Ex.: Treinamento de Liderança"
                        />
                      </div>
                      <div>
                        <Label>Descrição</Label>
                        <Textarea
                          value={form.description}
                          onChange={(e) => setForm({ ...form, description: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <Label>Data *</Label>
                          <Input
                            type="date"
                            value={form.event_date}
                            onChange={(e) => setForm({ ...form, event_date: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Início</Label>
                          <Input
                            type="time"
                            value={form.start_time}
                            onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Término</Label>
                          <Input
                            type="time"
                            value={form.end_time}
                            onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Ministrante</Label>
                        <Input
                          value={form.instructor}
                          onChange={(e) => setForm({ ...form, instructor: e.target.value })}
                          placeholder="Nome de quem irá ministrar"
                        />
                      </div>
                      <div>
                        <Label>Local</Label>
                        <Input
                          value={form.location}
                          onChange={(e) => setForm({ ...form, location: e.target.value })}
                          placeholder="Sala, link, endereço..."
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={() => createEvent.mutate()}
                        disabled={!form.title || !form.event_date || createEvent.isPending}
                      >
                        Salvar
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            )}

            {isLoading ? (
              <p className="text-muted-foreground">Carregando...</p>
            ) : events.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  Nenhum evento cadastrado ainda.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {events.map((ev) => (
                  <Card key={ev.id} className="hover:shadow-md transition">
                    <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
                      <div>
                        <CardTitle className="text-lg">{ev.title}</CardTitle>
                        <p className="text-sm text-primary font-medium mt-1">
                          {format(new Date(ev.event_date + "T00:00:00"), "EEEE, dd 'de' MMMM 'de' yyyy", {
                            locale: ptBR,
                          })}
                        </p>
                      </div>
                      {isAdmin && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir evento?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteEvent.mutate(ev.id)}>
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      {ev.description && (
                        <p className="text-muted-foreground">{ev.description}</p>
                      )}
                      {(ev.start_time || ev.end_time) && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>
                            {ev.start_time?.slice(0, 5)}
                            {ev.end_time ? ` - ${ev.end_time.slice(0, 5)}` : ""}
                          </span>
                        </div>
                      )}
                      {ev.instructor && (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-primary" />
                          <span className="font-medium">{ev.instructor}</span>
                        </div>
                      )}
                      {ev.location && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{ev.location}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="turmas">
            <TurmasSection isAdmin={isAdmin} />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

function TurmasSection({ isAdmin }: { isAdmin: boolean }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [openNew, setOpenNew] = useState(false);
  const [newClass, setNewClass] = useState({ name: "", description: "" });
  const [manageId, setManageId] = useState<string | null>(null);
  const [addUserId, setAddUserId] = useState("");

  const { data: classes = [] } = useQuery({
    queryKey: ["classes"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("classes")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ClassRow[];
    },
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ["profiles-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, user_id, full_name, role")
        .order("full_name");
      if (error) throw error;
      return data as Profile[];
    },
  });

  const { data: members = [] } = useQuery({
    queryKey: ["class_members"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("class_members").select("*");
      if (error) throw error;
      return data as ClassMember[];
    },
  });

  const createClass = useMutation({
    mutationFn: async () => {
      const { error } = await (supabase as any)
        .from("classes")
        .insert({ name: newClass.name, description: newClass.description || null });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Turma criada" });
      qc.invalidateQueries({ queryKey: ["classes"] });
      setOpenNew(false);
      setNewClass({ name: "", description: "" });
    },
    onError: (e: any) =>
      toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const deleteClass = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("classes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Turma excluída" });
      qc.invalidateQueries({ queryKey: ["classes"] });
      qc.invalidateQueries({ queryKey: ["class_members"] });
    },
  });

  const addMember = useMutation({
    mutationFn: async ({ class_id, user_id }: { class_id: string; user_id: string }) => {
      const { error } = await (supabase as any)
        .from("class_members")
        .insert({ class_id, user_id });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Participante adicionado" });
      qc.invalidateQueries({ queryKey: ["class_members"] });
      setAddUserId("");
    },
    onError: (e: any) =>
      toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const removeMember = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("class_members").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["class_members"] });
    },
  });

  const manageClass = classes.find((c) => c.id === manageId);
  const manageMembers = members.filter((m) => m.class_id === manageId);
  const profileByUserId = (uid: string) => profiles.find((p) => p.user_id === uid);
  const availableProfiles = profiles.filter(
    (p) => !manageMembers.some((m) => m.user_id === p.user_id)
  );

  return (
    <div className="space-y-4">
      {isAdmin && (
        <div className="flex justify-end">
          <Dialog open={openNew} onOpenChange={setOpenNew}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" /> Nova turma
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar turma</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label>Nome *</Label>
                  <Input
                    value={newClass.name}
                    onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                    placeholder="Ex.: Turma A - 2026"
                  />
                </div>
                <div>
                  <Label>Descrição</Label>
                  <Textarea
                    value={newClass.description}
                    onChange={(e) =>
                      setNewClass({ ...newClass, description: e.target.value })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={() => createClass.mutate()}
                  disabled={!newClass.name || createClass.isPending}
                >
                  Salvar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {classes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhuma turma cadastrada ainda.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {classes.map((c) => {
            const count = members.filter((m) => m.class_id === c.id).length;
            return (
              <Card key={c.id} className="hover:shadow-md transition">
                <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
                  <div>
                    <CardTitle className="text-lg">{c.name}</CardTitle>
                    {c.description && (
                      <p className="text-sm text-muted-foreground mt-1">{c.description}</p>
                    )}
                  </div>
                  {isAdmin && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir turma?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Os participantes serão desvinculados.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteClass.mutate(c.id)}>
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  <Badge variant="secondary">
                    <Users className="h-3 w-3 mr-1" /> {count} participante(s)
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setManageId(c.id)}
                  >
                    <UserPlus className="h-4 w-4 mr-2" /> Gerenciar participantes
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={!!manageId} onOpenChange={(o) => !o && setManageId(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Participantes — {manageClass?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {isAdmin && (
              <div className="flex gap-2">
                <Select value={addUserId} onValueChange={setAddUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um usuário..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableProfiles.map((p) => (
                      <SelectItem key={p.user_id} value={p.user_id}>
                        {p.full_name} ({p.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={() =>
                    addUserId &&
                    manageId &&
                    addMember.mutate({ class_id: manageId, user_id: addUserId })
                  }
                  disabled={!addUserId || addMember.isPending}
                >
                  Adicionar
                </Button>
              </div>
            )}

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {manageMembers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum participante na turma.
                </p>
              ) : (
                manageMembers.map((m) => {
                  const p = profileByUserId(m.user_id);
                  return (
                    <div
                      key={m.id}
                      className="flex items-center justify-between border rounded-md px-3 py-2"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {p?.full_name ?? "Usuário"}
                        </p>
                        <p className="text-xs text-muted-foreground">{p?.role}</p>
                      </div>
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeMember.mutate(m.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
