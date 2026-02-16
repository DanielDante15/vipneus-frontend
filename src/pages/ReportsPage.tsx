// src/pages/ReportsPage.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, TrendingDown } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { reportsService } from "@/api/report";

export default function ReportsPage() {
  const [selectedMonth, setSelectedMonth] = useState<string>("");

  // Buscar meses disponíveis
  const { data: monthsData, isLoading: loadingMonths } = useQuery({
    queryKey: ["reports-months"],
    queryFn: reportsService.fetchAvailableMonths,
  });

  // Buscar relatório do mês selecionado
  const { data: report, isLoading: loadingReport } = useQuery({
    queryKey: ["monthly-report", selectedMonth],
    queryFn: () => reportsService.fetchMonthlyReport(selectedMonth),
    enabled: !!selectedMonth,
  });

  // Selecionar o primeiro mês automaticamente
  useEffect(() => {
    if (monthsData?.months && monthsData.months.length > 0 && !selectedMonth) {
      setSelectedMonth(monthsData.months[0]);
    }
  }, [monthsData, selectedMonth]);

  const formatMonth = (m: string) => {
    const [year, month] = m.split("-");
    const names = [
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Mai",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez",
    ];
    return `${names[parseInt(month) - 1]} ${year}`;
  };

  if (loadingMonths) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const months = monthsData?.months || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Relatório Mensal
          </h1>
          <p className="text-sm text-muted-foreground">
            Resumo de vendas e compras por mês
          </p>
        </div>
        {months.length > 0 && (
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((m) => (
                <SelectItem key={m} value={m}>
                  {formatMonth(m)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {months.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhum dado disponível. Registre vendas e compras para gerar
            relatórios.
          </CardContent>
        </Card>
      ) : loadingReport ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : report ? (
        <>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">
                  Total Vendido
                </p>
                <p className="text-2xl font-bold font-display text-success">
                  R$ {report.total_vendas.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {report.sales_count} vendas
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">
                  Total Comprado
                </p>
                <p className="text-2xl font-bold font-display text-destructive">
                  R$ {report.total_compras.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {report.purchases_count} compras
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Lucro</p>
                <p
                  className={`text-2xl font-bold font-display ${
                    report.lucro >= 0 ? "text-success" : "text-destructive"
                  }`}
                >
                  R$ {report.lucro.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {report.lucro >= 0 ? "Lucro" : "Prejuízo"}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-display">
                  Vendas - {formatMonth(selectedMonth)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Marca</TableHead>
                      <TableHead>Medida</TableHead>
                      <TableHead className="text-right">Custo</TableHead>
                      <TableHead className="text-right">Venda</TableHead>
                      <TableHead className="text-right">Lucro</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.sales.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center py-6 text-muted-foreground"
                        >
                          Nenhuma venda
                        </TableCell>
                      </TableRow>
                    ) : (
                      report.sales.map((s) => {
                        const lucroCalculado =
                          s.custo !== null ? (s.lucro || 0) : s.valor;
                        return (
                          <TableRow key={s.id}>
                            <TableCell>
                              {new Date(s.data).toLocaleDateString("pt-BR")}
                            </TableCell>
                            <TableCell>{s.marca}</TableCell>
                            <TableCell>{s.medida}</TableCell>
                            <TableCell className="text-right text-muted-foreground text-sm">
                              {s.custo !== null
                                ? `R$ ${s.custo.toFixed(2)}`
                                : "—"}
                            </TableCell>
                            <TableCell className="text-right text-success">
                              R$ {s.valor.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right">
                              <span
                                className={`flex items-center justify-end gap-1 ${
                                  lucroCalculado >= 0
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {lucroCalculado >= 0 ? (
                                  <TrendingUp className="h-3 w-3" />
                                ) : (
                                  <TrendingDown className="h-3 w-3" />
                                )}
                                R$ {lucroCalculado.toFixed(2)}
                              </span>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-display">
                  Compras - {formatMonth(selectedMonth)}
                </CardTitle>
              </CardHeader>
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
                    {report.purchases.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-center py-6 text-muted-foreground"
                        >
                          Nenhuma compra
                        </TableCell>
                      </TableRow>
                    ) : (
                      report.purchases.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell>
                            {new Date(p.data).toLocaleDateString("pt-BR")}
                          </TableCell>
                          <TableCell>{p.marca}</TableCell>
                          <TableCell>{p.medida}</TableCell>
                          <TableCell className="text-right text-destructive">
                            R$ {p.valor.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
}