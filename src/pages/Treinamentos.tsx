import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GraduationCap, FileText, Download, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function Treinamentos() {
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

  const download = async (doc: any) => {
    const ext = doc.file_path.split(".").pop()?.split("?")[0] || "";
    const titleHasExt = /\.[a-z0-9]{1,5}$/i.test(doc.title);
    const filename = titleHasExt || !ext ? doc.title : `${doc.title}.${ext}`;
    const { data, error } = await supabase.storage.from("library").createSignedUrl(doc.file_path, 60, { download: filename });
    if (error || !data?.signedUrl) {
      toast.error("Erro ao gerar link");
      return;
    }
    try {
      const resp = await fetch(data.signedUrl);
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = filename;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      window.open(data.signedUrl, "_blank");
    }
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
    </AppLayout>
  );
}
