import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Bell } from "lucide-react";

export default function Notificacoes() {
  return (
    <AppLayout title="Notificações" subtitle="Suas atualizações">
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-card">
          <CardContent className="p-8 flex flex-col items-center gap-3">
            <div className="rounded-full bg-muted p-4">
              <Bell className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground text-center">Nenhuma notificação no momento.</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
