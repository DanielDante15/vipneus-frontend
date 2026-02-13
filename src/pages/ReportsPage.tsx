import { useTires } from "@/contexts/TireContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState } from "react";

export default function ReportsPage() {
  const { sales, purchases } = useTires();

  const months = Array.from(new Set([
    ...sales.map(s => s.data.slice(0, 7)),
    ...purchases.map(p => p.data.slice(0, 7)),
  ])).sort().reverse();

  const [selectedMonth, setSelectedMonth] = useState(months[0] || "");

  const monthSales = sales.filter(s => s.data.startsWith(selectedMonth));
  const monthPurchases = purchases.filter(p => p.data.startsWith(selectedMonth));
  const totalVendas = monthSales.reduce((s, p) => s + p.valor, 0);
  const totalCompras = monthPurchases.reduce((s, p) => s + p.valor, 0);

  const formatMonth = (m: string) => {
    const [year, month] = m.split("-");
    const names = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    return `${names[parseInt(month) - 1]} ${year}`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Relatório Mensal</h1>
          <p className="text-sm text-muted-foreground">Resumo de vendas e compras por mês</p>
        </div>
        {months.length > 0 && (
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              {months.map(m => (
                <SelectItem key={m} value={m}>{formatMonth(m)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {months.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhum dado disponível. Registre vendas e compras para gerar relatórios.
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Total Vendido</p>
                <p className="text-2xl font-bold font-display text-success">R$ {totalVendas.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">{monthSales.length} vendas</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Total Comprado</p>
                <p className="text-2xl font-bold font-display text-destructive">R$ {totalCompras.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">{monthPurchases.length} compras</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Resultado</p>
                <p className={`text-2xl font-bold font-display ${totalVendas - totalCompras >= 0 ? "text-success" : "text-destructive"}`}>
                  R$ {(totalVendas - totalCompras).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">Lucro/Prejuízo</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-base font-display">Vendas - {formatMonth(selectedMonth)}</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Marca</TableHead>
                      <TableHead>Medida</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {monthSales.length === 0 ? (
                      <TableRow><TableCell colSpan={4} className="text-center py-6 text-muted-foreground">Nenhuma venda</TableCell></TableRow>
                    ) : monthSales.map(s => (
                      <TableRow key={s.id}>
                        <TableCell>{new Date(s.data).toLocaleDateString("pt-BR")}</TableCell>
                        <TableCell>{s.marca}</TableCell>
                        <TableCell>{s.medida}</TableCell>
                        <TableCell className="text-right text-success">R$ {s.valor.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base font-display">Compras - {formatMonth(selectedMonth)}</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Marca</TableHead>
                      <TableHead>Medida</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {monthPurchases.length === 0 ? (
                      <TableRow><TableCell colSpan={4} className="text-center py-6 text-muted-foreground">Nenhuma compra</TableCell></TableRow>
                    ) : monthPurchases.map(p => (
                      <TableRow key={p.id}>
                        <TableCell>{new Date(p.data).toLocaleDateString("pt-BR")}</TableCell>
                        <TableCell>{p.marca}</TableCell>
                        <TableCell>{p.medida}</TableCell>
                        <TableCell className="text-right text-destructive">R$ {p.valor.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
