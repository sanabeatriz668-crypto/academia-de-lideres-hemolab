import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { FileText, Video, BookOpen, Search, Download, Upload, Trash2, File as FileIcon } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

function iconFor(type?: string | null) {
  if (!type) return FileIcon;
  if (type.startsWith("video/")) return Video;
  if (type === "application/pdf") return FileText;
  return BookOpen;
}

export default function Biblioteca() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("role").eq("user_id", user!.id).maybeSingle();
      return data;
    },
  });
  const isAdmin = profile?.role === "admin";

  const { data: files = [] } = useQuery({
    queryKey: ["library_files"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("library_files")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const uploadFile = async () => {
    if (!file || !title.trim() || !user) {
      toast.error("Informe título e selecione um arquivo");
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: upErr } = await supabase.storage.from("library").upload(path, file, {
        contentType: file.type,
        upsert: false,
      });
      if (upErr) throw upErr;
      const { error: insErr } = await supabase.from("library_files").insert({
        title: title.trim(),
        description: description.trim() || null,
        category: category.trim() || null,
        file_path: path,
        file_type: file.type,
        file_size: file.size,
        uploaded_by: user.id,
      });
      if (insErr) throw insErr;
      toast.success("Arquivo enviado!");
      queryClient.invalidateQueries({ queryKey: ["library_files"] });
      setOpen(false);
      setTitle(""); setDescription(""); setCategory(""); setFile(null);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = useMutation({
    mutationFn: async (item: any) => {
      const { error: stErr } = await supabase.storage.from("library").remove([item.file_path]);
      if (stErr) throw stErr;
      const { error } = await supabase.from("library_files").delete().eq("id", item.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Arquivo removido");
      queryClient.invalidateQueries({ queryKey: ["library_files"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleDownload = async (item: any) => {
    // Garante extensão correta (especialmente .pdf) no nome baixado
    const origExt = item.file_path.split(".").pop()?.split("?")[0] || "";
    const titleHasExt = /\.[a-z0-9]{1,5}$/i.test(item.title);
    const filename = titleHasExt || !origExt ? item.title : `${item.title}.${origExt}`;

    const { data, error } = await supabase.storage
      .from("library")
      .createSignedUrl(item.file_path, 60, { download: filename });
    if (error || !data?.signedUrl) {
      toast.error("Erro ao gerar link de download");
      return;
    }
    try {
      const resp = await fetch(data.signedUrl);
      if (!resp.ok) throw new Error("fail");
      const blob = await resp.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(data.signedUrl, "_blank");
    }
  };

  const filtered = files.filter(
    (c: any) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      (c.category || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout title="Biblioteca de Conteúdos" subtitle="Materiais de apoio">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar conteúdos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          {isAdmin && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm"><Upload className="h-4 w-4 mr-1.5" /> Enviar</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Enviar arquivo para a biblioteca</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs">Título *</Label>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">Categoria / Módulo</Label>
                    <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Ex: Módulo 1" />
                  </div>
                  <div>
                    <Label className="text-xs">Descrição</Label>
                    <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">Arquivo *</Label>
                    <Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={uploadFile} disabled={uploading}>
                    {uploading ? "Enviando..." : "Enviar"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {filtered.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              Nenhum arquivo na biblioteca ainda.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((c: any, i: number) => {
              const Icon = iconFor(c.file_type);
              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="shadow-card hover:shadow-elevated transition-shadow h-full">
                    <CardContent className="p-4 space-y-3 flex flex-col h-full">
                      <div className="flex items-start justify-between">
                        <div className="rounded-lg p-2 bg-primary/10 text-primary">
                          <Icon className="h-4 w-4" />
                        </div>
                        {c.category && <Badge variant="outline" className="text-[10px]">{c.category}</Badge>}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-foreground">{c.title}</h3>
                        {c.description && <p className="text-xs text-muted-foreground mt-1">{c.description}</p>}
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t">
                        <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => handleDownload(c)}>
                          <Download className="h-3.5 w-3.5 mr-1" /> Baixar
                        </Button>
                        {isAdmin && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-destructive hover:bg-destructive/10"
                            onClick={() => deleteFile.mutate(c)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
