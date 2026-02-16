// src/pages/SalesPage.tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, DollarSign, Loader2, TrendingUp, TrendingDown } from "lucide-react";
import { useState, useMemo } from "react";
import { TireCondition } from "@/types/tire";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { salesService, CreateSaleDTO } from "@/api/sale";
import { tiresService } from "@/api/tires";

const conditionLabels: Record<TireCondition, string> = {
  novo: "Novo",
  seminovo: "Seminovo",
  recapado: "Recapado",
  "meia-vida": "Meia-vida",
};

export default function SalesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  // Filtros para selecionar pneu do estoque
  const [filterMarca, setFilterMarca] = useState("");
  const [filterMedida, setFilterMedida] = useState("");
  const [filterCondicao, setFilterCondicao] = useState("todas");

  // Venda
  const [selectedTireId, setSelectedTireId] = useState("");
  const [valor, setValor] = useState("");

  // Query para buscar vendas
  const { data: sales = [], isLoading: loadingSales } = useQuery({
    queryKey: ["sales"],
    queryFn: salesService.fetchSales,
  });

  // Query para buscar pneus disponíveis (SOMENTE para a modal de criar venda)
  const { data: tires = [], isLoading: loadingTires } = useQuery({
    queryKey: ["tires"],
    queryFn: tiresService.fetchTires,
    enabled: open, // ← SÓ BUSCA quando a modal estiver aberta
  });

  // Mutation para criar venda
  const sellMutation = useMutation({
    mutationFn: salesService.createSale,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["tires"] });
      toast({
        title: "Venda registrada!",
        description: "Pneu vendido com sucesso.",
      });
      resetForm();
      setOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Pneus disponíveis (não vendidos) - APENAS para a modal
  const availableTires = tires.filter((t) => !t.vendido);

  const marcas = useMemo(
    () => Array.from(new Set(availableTires.map((t) => t.marca))).sort(),
    [availableTires]
  );
  const medidas = useMemo(
    () => Array.from(new Set(availableTires.map((t) => t.medida))).sort(),
    [availableTires]
  );

  const filteredTires = useMemo(() => {
    return availableTires.filter((t) => {
      if (filterMarca && t.marca !== filterMarca) return false;
      if (filterMedida && t.medida !== filterMedida) return false;
      if (filterCondicao !== "todas" && t.condicao !== filterCondicao)
        return false;
      return true;
    });
  }, [availableTires, filterMarca, filterMedida, filterCondicao]);

  const handleSell = () => {
    if (!selectedTireId || !valor) {
      toast({
        title: "Campos obrigatórios",
        description: "Selecione um pneu e informe o valor.",
        variant: "destructive",
      });
      return;
    }

    const saleData: CreateSaleDTO = {
      tire_id: selectedTireId,
      valor: parseFloat(valor),
    };

    sellMutation.mutate(saleData);
  };

  const resetForm = () => {
    setFilterMarca("");
    setFilterMedida("");
    setFilterCondicao("todas");
    setSelectedTireId("");
    setValor("");
  };

  // ✅ LÓGICA CORRIGIDA: Se custo é null, lucro = valor da venda
  const totalVendas = sales.reduce((s, p) => s + p.valor, 0);
  const totalCusto = sales.reduce((s, p) => s + (p.custo || 0), 0);
  const totalLucro = sales.reduce((s, p) => {
    // Se custo é null, todo o valor da venda é lucro
    const lucro = p.custo !== null ? (p.lucro || 0) : p.valor;
    return s + lucro;
  }, 0);

  if (loadingSales) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Vendas
          </h1>
          <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
            <span>{sales.length} vendas</span>
            <span>•</span>
            <span>Total Vendas: R$ {totalVendas.toFixed(2)}</span>
            <span>•</span>
            <span>Total Custo: R$ {totalCusto.toFixed(2)}</span>
            <span>•</span>
            <span className={totalLucro >= 0 ? "text-green-600" : "text-red-600"}>
              Lucro: R$ {totalLucro.toFixed(2)}
            </span>
          </div>
        </div>
        <Dialog
          open={open}
          onOpenChange={(v) => {
            setOpen(v);
            if (!v) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Venda
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Registrar Venda do Estoque</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {loadingTires ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  {/* Filtros */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-xs">Marca</Label>
                      <Select
                        value={filterMarca || "todas_marcas"}
                        onValueChange={(v) => {
                          setFilterMarca(v === "todas_marcas" ? "" : v);
                          setSelectedTireId("");
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Todas" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todas_marcas">Todas</SelectItem>
                          {marcas.map((m) => (
                            <SelectItem key={m} value={m}>
                              {m}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Medida</Label>
                      <Select
                        value={filterMedida || "todas_medidas"}
                        onValueChange={(v) => {
                          setFilterMedida(v === "todas_medidas" ? "" : v);
                          setSelectedTireId("");
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Todas" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todas_medidas">Todas</SelectItem>
                          {medidas.map((m) => (
                            <SelectItem key={m} value={m}>
                              {m}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Condição</Label>
                      <Select
                        value={filterCondicao}
                        onValueChange={(v) => {
                          setFilterCondicao(v);
                          setSelectedTireId("");
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todas">Todas</SelectItem>
                          {Object.entries(conditionLabels).map(([k, v]) => (
                            <SelectItem key={k} value={k}>
                              {v}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Tabela de pneus disponíveis */}
                  <div className="rounded-xl border border-border overflow-hidden max-h-52 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-secondary/50">
                          <TableHead className="w-10"></TableHead>
                          <TableHead>Marca</TableHead>
                          <TableHead>Medida</TableHead>
                          <TableHead>Aro</TableHead>
                          <TableHead>Condição</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTires.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={5}
                              className="text-center py-8 text-muted-foreground"
                            >
                              Nenhum pneu disponível
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredTires.map((t) => (
                            <TableRow
                              key={t.id}
                              className={`cursor-pointer transition-colors ${
                                selectedTireId === t.id
                                  ? "bg-primary/10"
                                  : "hover:bg-secondary/50"
                              }`}
                              onClick={() => setSelectedTireId(t.id)}
                            >
                              <TableCell>
                                <div
                                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                    selectedTireId === t.id
                                      ? "border-primary"
                                      : "border-muted-foreground/30"
                                  }`}
                                >
                                  {selectedTireId === t.id && (
                                    <div className="w-2 h-2 rounded-full bg-primary" />
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="font-medium">
                                {t.marca}
                              </TableCell>
                              <TableCell>{t.medida}</TableCell>
                              <TableCell>{t.aro}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    t.condicao === "novo" ? "default" : "secondary"
                                  }
                                >
                                  {conditionLabels[t.condicao]}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    {filteredTires.length} pneu(s) disponível(is)
                  </p>

                  {/* Valor */}
                  <div>
                    <Label>Valor de Venda (R$) *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={valor}
                      onChange={(e) => setValor(e.target.value)}
                      placeholder="0,00"
                    />
                  </div>

                  <Button
                    onClick={handleSell}
                    disabled={!selectedTireId || !valor || sellMutation.isPending}
                  >
                    {sellMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <DollarSign className="h-4 w-4 mr-2" />
                        Confirmar Venda
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50">
              <TableHead>Data Venda</TableHead>
              <TableHead>Marca</TableHead>
              <TableHead>Medida</TableHead>
              <TableHead>Aro</TableHead>
              <TableHead>Condição</TableHead>
              <TableHead className="text-right">Custo</TableHead>
              <TableHead className="text-right">Venda</TableHead>
              <TableHead className="text-right">Lucro</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-12 text-muted-foreground"
                >
                  Nenhuma venda registrada
                </TableCell>
              </TableRow>
            ) : (
              [...sales].reverse().map((s) => {
                // ✅ LÓGICA CORRIGIDA: Se custo null, lucro = valor venda
                const lucroCalculado = s.custo !== null ? (s.lucro || 0) : s.valor;
                
                return (
                  <TableRow key={s.id}>
                    <TableCell>
                      {new Date(s.data).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="font-medium">{s.marca}</TableCell>
                    <TableCell>{s.medida}</TableCell>
                    <TableCell>{s.aro}</TableCell>
                    <TableCell>
                      <Badge
                        variant={s.condicao === "novo" ? "default" : "secondary"}
                      >
                        {conditionLabels[s.condicao]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {s.custo !== null ? `R$ ${s.custo.toFixed(2)}` : "—"}
                    </TableCell>
                    <TableCell className="text-right font-medium text-green-600">
                      R$ {s.valor.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      <span
                        className={`flex items-center justify-end gap-1 ${
                          lucroCalculado >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {lucroCalculado >= 0 ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
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
      </div>
    </div>
  );
}