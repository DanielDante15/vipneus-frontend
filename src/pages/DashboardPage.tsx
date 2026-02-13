import { useTires } from "@/contexts/TireContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, TrendingUp, TrendingDown, DollarSign, ShoppingCart, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function DashboardPage() {
  const { tires, sales, purchases } = useTires();

  const totalTires = tires.filter(t => !t.vendido).length;
  const totalSold = sales.length;
  const totalPurchased = purchases.length;
  const totalEntrada = purchases.reduce((s, p) => s + p.valor, 0);
  const totalSaida = sales.reduce((s, p) => s + p.valor, 0);

  // Pneus por condição
  const conditionData = ["novo", "seminovo", "recapado", "meia-vida"].map(c => ({
    name: c.charAt(0).toUpperCase() + c.slice(1),
    value: tires.filter(t => !t.vendido && t.condicao === c).length,
  })).filter(d => d.value > 0);

  // Marcas mais vendidas
  const brandCounts: Record<string, number> = {};
  sales.forEach(s => { brandCounts[s.marca] = (brandCounts[s.marca] || 0) + 1; });
  const topBrands = Object.entries(brandCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));

  // Vendas por mês
  const monthlyData: Record<string, { vendas: number; compras: number }> = {};
  sales.forEach(s => {
    const month = s.data.slice(0, 7);
    if (!monthlyData[month]) monthlyData[month] = { vendas: 0, compras: 0 };
    monthlyData[month].vendas += s.valor;
  });
  purchases.forEach(p => {
    const month = p.data.slice(0, 7);
    if (!monthlyData[month]) monthlyData[month] = { vendas: 0, compras: 0 };
    monthlyData[month].compras += p.valor;
  });
  const chartData = Object.entries(monthlyData)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, data]) => ({ month: month.split("-").reverse().join("/"), ...data }));

  const COLORS = ["hsl(38,92%,50%)", "hsl(142,71%,45%)", "hsl(200,80%,55%)", "hsl(280,65%,55%)"];

  const stats = [
    { label: "Em Estoque", value: totalTires, icon: Package, color: "text-primary" },
    { label: "Vendidos", value: totalSold, icon: TrendingUp, color: "text-success" },
    { label: "Comprados", value: totalPurchased, icon: ShoppingCart, color: "text-chart-3" },
    { label: "Valor Entrada", value: `R$ ${totalEntrada.toFixed(2)}`, icon: TrendingDown, color: "text-destructive" },
    { label: "Valor Saída", value: `R$ ${totalSaida.toFixed(2)}`, icon: DollarSign, color: "text-success" },
    { label: "Lucro", value: `R$ ${(totalSaida - totalEntrada).toFixed(2)}`, icon: BarChart3, color: "text-primary" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-foreground mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {stats.map(s => (
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
          <CardHeader><CardTitle className="text-base font-display">Vendas vs Compras (mensal)</CardTitle></CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-12">Sem dados ainda</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,14%,20%)" />
                  <XAxis dataKey="month" stroke="hsl(220,10%,55%)" fontSize={12} />
                  <YAxis stroke="hsl(220,10%,55%)" fontSize={12} />
                  <Tooltip contentStyle={{ background: "hsl(220,18%,13%)", border: "1px solid hsl(220,14%,20%)", borderRadius: "8px", color: "hsl(40,20%,95%)" }} />
                  <Bar dataKey="vendas" fill="hsl(142,71%,45%)" radius={[4, 4, 0, 0]} name="Vendas" />
                  <Bar dataKey="compras" fill="hsl(38,92%,50%)" radius={[4, 4, 0, 0]} name="Compras" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base font-display">Pneus por Condição</CardTitle></CardHeader>
          <CardContent>
            {conditionData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-12">Sem dados ainda</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={conditionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                    {conditionData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(220,18%,13%)", border: "1px solid hsl(220,14%,20%)", borderRadius: "8px", color: "hsl(40,20%,95%)" }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader><CardTitle className="text-base font-display">Marcas Mais Vendidas</CardTitle></CardHeader>
          <CardContent>
            {topBrands.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Nenhuma venda registrada</p>
            ) : (
              <div className="space-y-3">
                {topBrands.map((b, i) => (
                  <div key={b.name} className="flex items-center gap-3">
                    <span className="text-sm font-bold text-primary w-6">{i + 1}º</span>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{b.name}</span>
                        <span className="text-sm text-muted-foreground">{b.value} vendas</span>
                      </div>
                      <div className="h-2 rounded-full bg-secondary overflow-hidden">
                        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(b.value / topBrands[0].value) * 100}%` }} />
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
