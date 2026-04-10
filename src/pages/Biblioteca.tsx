import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FileText, Video, BookOpen, Search, Download } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

type ContentType = "pdf" | "video" | "guia";

interface Content {
  id: number;
  title: string;
  description: string;
  type: ContentType;
  module: string;
  duration?: string;
}

const contents: Content[] = [
  { id: 1, title: "Os 5 Estilos de Liderança", type: "pdf", module: "Módulo 1", description: "Entenda os diferentes estilos e quando aplicar cada um." },
  { id: 2, title: "Comunicação Assertiva na Prática", type: "video", module: "Módulo 2", description: "Vídeo com exemplos práticos de comunicação efetiva.", duration: "12 min" },
  { id: 3, title: "Guia Rápido: Mediação de Conflitos", type: "guia", module: "Módulo 3", description: "Passo a passo para resolver conflitos no dia a dia." },
  { id: 4, title: "Template: Feedback 1-on-1", type: "pdf", module: "Módulo 4", description: "Modelo pronto para suas reuniões de feedback." },
  { id: 5, title: "Gestão do Tempo: Matriz Eisenhower", type: "video", module: "Módulo 5", description: "Como priorizar tarefas usando a Matriz Eisenhower.", duration: "8 min" },
  { id: 6, title: "Checklist: Reunião Produtiva", type: "guia", module: "Geral", description: "Checklist para garantir reuniões eficientes." },
];

const typeConfig: Record<ContentType, { icon: typeof FileText; label: string; color: string }> = {
  pdf: { icon: FileText, label: "PDF", color: "bg-destructive/10 text-destructive" },
  video: { icon: Video, label: "Vídeo", color: "bg-primary/10 text-primary" },
  guia: { icon: BookOpen, label: "Guia", color: "bg-success/10 text-success" },
};

export default function Biblioteca() {
  const [search, setSearch] = useState("");
  const filtered = contents.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.module.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout title="Biblioteca de Conteúdos" subtitle="Materiais de apoio">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar conteúdos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c, i) => {
            const tc = typeConfig[c.type];
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="shadow-card hover:shadow-elevated transition-shadow cursor-pointer group h-full">
                  <CardContent className="p-4 space-y-3 flex flex-col h-full">
                    <div className="flex items-start justify-between">
                      <div className={`rounded-lg p-2 ${tc.color}`}>
                        <tc.icon className="h-4 w-4" />
                      </div>
                      <Badge variant="outline" className="text-[10px]">{c.module}</Badge>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-foreground">{c.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{c.description}</p>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <Badge variant="secondary" className="text-[10px]">{tc.label}{c.duration ? ` • ${c.duration}` : ""}</Badge>
                      <Download className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
