import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TireProvider } from "@/contexts/TireContext";
import { AppLayout } from "@/components/AppLayout";
import StockPage from "@/pages/StockPage";
import DashboardPage from "@/pages/DashboardPage";
import PurchasesPage from "@/pages/PurchasesPage";
import SalesPage from "@/pages/SalesPage";
import ReportsPage from "@/pages/ReportsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <TireProvider>
        <BrowserRouter>
          <AppLayout>
            <Routes>
              <Route path="/" element={<StockPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/compras" element={<PurchasesPage />} />
              <Route path="/vendas" element={<SalesPage />} />
              <Route path="/relatorios" element={<ReportsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </TireProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
