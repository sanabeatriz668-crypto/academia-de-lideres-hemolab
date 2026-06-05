import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GraduationCap, FileText, Download, ExternalLink, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export default function Treinamentos() {
  const { user } = useAuth();
  const [viewer, setViewer] = useState<{ url: string; title: string; type?: string } | null>(null);

  const { data: trainings = [] } = useQuery({
    queryKey: ["trainings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("trainings").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: docs = [] } = useQuery({
    queryKey: ["training_documents_all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("training_documents").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const markProgress = async (trainingId: string) => {
    if (!user) return;
    await supabase.from("training_progress").upsert(
      { user_id: user.id, training_id: trainingId, status: "concluido", progress: 100 } as any,
      { onConflict: "user_id,training_id" } as any
    );
  };

  const openSignedUrl = async (doc: any, download = false) => {
    const ext = doc.file_path.split(".").pop()?.split("?")[0] || "";
    const titleHasExt = /\.[a-z0-9]{1,5}$/i.test(doc.title);
    const filename = titleHasExt || !ext ? doc.title : `${doc.title}.${ext}`;
    const opts = download ? { download: filename } : undefined;
    const { data, error } = await supabase.storage.from("library").createSignedUrl(doc.file_path, 3600, opts as any);
    if (error || !data?.signedUrl) {
      toast.error("Erro ao gerar link");
      return null;
    }
    return { signedUrl: data.signedUrl, filename, ext };
  };

  const view = async (doc: any) => {
    const r = await openSignedUrl(doc, false);
    if (!r) return;
    setViewer({ url: r.signedUrl, title: doc.title, type: doc.file_type });
    markProgress(doc.training_id);
  };

  const download = async (doc: any) => {
    const r = await openSignedUrl(doc, true);
    if (!r) return;
    try {
      const resp = await fetch(r.signedUrl);
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = r.filename;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      window.open(r.signedUrl, "_blank");
    }
    markProgress(doc.training_id);
  };

  const isViewableInIframe = (type?: string, url?: string) => {
    if (!type && !url) return true;
    const t = (type || "").toLowerCase();
    const u = (url || "").toLowerCase();
    return t.includes("pdf") || t.startsWith("image/") || t.startsWith("video/") || u.endsWith(".pdf");
  };

  return (
    <AppLayout title="Treinamentos" subtitle="Conteúdos e materiais de apoio">
      <div className="max-w-4xl mx-auto space-y-4">
        {trainings.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              Nenhum treinamento disponível ainda.
            </CardContent>
          </Card>
        ) : trainings.map((t: any, i: number) => {
          const tDocs = docs.filter((d: any) => d.training_id === t.id);
          return (
            <motion.div key={t.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="shadow-card">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-semibold">{t.title}</h3>
                        {t.category && <Badge variant="outline" className="text-[10px]">{t.category}</Badge>}
                      </div>
                      {t.description && <p className="text-xs text-muted-foreground mt-1">{t.description}</p>}
                      {t.link && (
                        <a href={t.link} target="_blank" rel="noreferrer" className="text-xs text-primary inline-flex items-center gap-1 mt-2">
                          <ExternalLink className="h-3 w-3" /> Abrir link do treinamento
                        </a>
                      )}
                    </div>
                  </div>
                  {tDocs.length > 0 && (
                    <div className="pt-2 border-t space-y-1.5">
                      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Documentos / Slides</p>
                      {tDocs.map((d: any) => (
                        <div key={d.id} className="flex items-center gap-2 p-2 rounded border bg-card">
                          <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                          <p className="flex-1 text-xs truncate">{d.title}</p>
                          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => view(d)}>
                            <Eye className="h-3.5 w-3.5 mr-1" /> Ver
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => download(d)}>
                            <Download className="h-3.5 w-3.5 mr-1" /> Baixar
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Dialog open={!!viewer} onOpenChange={(o) => !o && setViewer(null)}>
        <DialogContent className="max-w-5xl w-[95vw] h-[85vh] p-0 flex flex-col">
          <DialogHeader className="px-4 py-3 border-b">
            <DialogTitle className="text-sm">{viewer?.title}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden bg-muted">
            {viewer && (isViewableInIframe(viewer.type, viewer.url) ? (
              <iframe src={viewer.url} className="w-full h-full" title={viewer.title} />
            ) : (
              <iframe
                src={`https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(viewer.url)}`}
                className="w-full h-full"
                title={viewer.title}
              />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
