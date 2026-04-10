import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import Trilha from "./pages/Trilha";
import Tarefas from "./pages/Tarefas";
import Avaliacao from "./pages/Avaliacao";
import Ranking from "./pages/Ranking";
import Biblioteca from "./pages/Biblioteca";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/trilha" element={<Trilha />} />
          <Route path="/tarefas" element={<Tarefas />} />
          <Route path="/avaliacao" element={<Avaliacao />} />
          <Route path="/ranking" element={<Ranking />} />
          <Route path="/biblioteca" element={<Biblioteca />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
