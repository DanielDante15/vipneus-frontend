import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import StockPage from "@/pages/StockPage";
import DashboardPage from "@/pages/DashboardPage";
import PurchasesPage from "@/pages/PurchasesPage";
import SalesPage from "@/pages/SalesPage";
import ReportsPage from "@/pages/ReportsPage";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/AuthPage";
import { authService } from "./api/auth";
import { ProtectedRoute } from "./contexts/ProtectedRouteContext";

const queryClient = new QueryClient();

const App = () => {
  const isAuthenticated = authService.isAuthenticated();
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
 
          <BrowserRouter>
            <Routes>
              <Route 
                path="/login" 
                element={
                  isAuthenticated ? <Navigate to="/" replace /> : <AuthPage />
                } 
              />

              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/estoque" element={<StockPage />} />
                  <Route path="/compras" element={<PurchasesPage />} />
                  <Route path="/vendas" element={<SalesPage />} />
                  <Route path="/relatorios" element={<ReportsPage />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Route>
            </Routes>
          </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;