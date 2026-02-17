// src/pages/DashboardPage.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, TrendingUp, TrendingDown, DollarSign, ShoppingCart, BarChart3, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/api/dashboard";

const COLORS = ["hsl(38,92%,50%)", "hsl(142,71%,45%)", "hsl(200,80%,55%)", "hsl(280,65%,55%)"];

export default function DashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard"],
    queryFn: dashboardService.fetchDashboardData,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Erro ao carregar dados do dashboard.</p>
      </div>
    );
  }

  const { stats, condition_data, top_brands, monthly_data } = data;

  const statsCards = [
    { label: "Em Estoque", value: stats.total_tires, icon: Package, color: "text-primary" },
    { label: "Vendidos", value: stats.total_sold, icon: TrendingUp, color: "text-success" },
    { label: "Comprados", value: stats.total_purchased, icon: ShoppingCart, color: "text-chart-3" },
    { label: "Compras", value: `R$ ${stats.total_entrada.toFixed(2)}`, icon: TrendingDown, color: "text-destructive" },
    { label: "Vendas", value: `R$ ${stats.total_saida.toFixed(2)}`, icon: DollarSign, color: "text-success" },
    { label: "Lucro", value: `R$ ${stats.lucro.toFixed(2)}`, icon: BarChart3, color: stats.lucro >= 0 ? "text-success" : "text-destructive" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-foreground mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {statsCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <s.icon className={`h-4 w-4 ${s.color}`} />
                <span className="text-xs text-muted-foreground">{s.label}</span>
              </div>
              <p className="text-xl font-bold font-display">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-display">Vendas vs Compras (mensal)</CardTitle>
          </CardHeader>
          <CardContent>
            {monthly_data.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-12">Sem dados ainda</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={monthly_data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,14%,20%)" />
                  <XAxis dataKey="month" stroke="hsl(220,10%,55%)" fontSize={12} />
                  <YAxis stroke="hsl(220,10%,55%)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(220,18%,13%)",
                      border: "1px solid hsl(220,14%,20%)",
                      borderRadius: "8px",
                      color: "hsl(40,20%,95%)",
                    }}
                  />
                  <Bar dataKey="vendas" fill="hsl(142,71%,45%)" radius={[4, 4, 0, 0]} name="Vendas" />
                  <Bar dataKey="compras" fill="hsl(38,92%,50%)" radius={[4, 4, 0, 0]} name="Compras" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-display">Pneus por Condição</CardTitle>
          </CardHeader>
          <CardContent>
            {condition_data.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-12">Sem dados ainda</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={condition_data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {condition_data.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "hsl(220,18%,13%)",
                      border: "1px solid hsl(220,14%,20%)",
                      borderRadius: "8px",
                      color: "hsl(40,20%,95%)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-display">Marcas Mais Vendidas</CardTitle>
          </CardHeader>
          <CardContent>
            {top_brands.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Nenhuma venda registrada</p>
            ) : (
              <div className="space-y-3">
                {top_brands.map((b, i) => (
                  <div key={b.name} className="flex items-center gap-3">
                    <span className="text-sm font-bold text-primary w-6">{i + 1}º</span>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{b.name}</span>
                        <span className="text-sm text-muted-foreground">{b.value} vendas</span>
                      </div>
                      <div className="h-2 rounded-full bg-secondary overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${(b.value / top_brands[0].value) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}