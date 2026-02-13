import { useTires } from "@/contexts/TireContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, DollarSign } from "lucide-react";
import { useState, useMemo } from "react";
import { TireCondition } from "@/types/tire";

const conditionLabels: Record<TireCondition, string> = {
  novo: "Novo",
  seminovo: "Seminovo",
  recapado: "Recapado",
  "meia-vida": "Meia-vida",
};

export default function SalesPage() {
  const { tires, sales, sellTire } = useTires();
  const [open, setOpen] = useState(false);

  // Filtros para selecionar pneu do estoque
  const [filterMarca, setFilterMarca] = useState("");
  const [filterMedida, setFilterMedida] = useState("");
  const [filterCondicao, setFilterCondicao] = useState("todas");

  // Venda
  const [selectedTireId, setSelectedTireId] = useState("");
  const [valor, setValor] = useState("");

  const availableTires = tires.filter(t => !t.vendido);

  const marcas = useMemo(() => Array.from(new Set(availableTires.map(t => t.marca))).sort(), [availableTires]);
  const medidas = useMemo(() => Array.from(new Set(availableTires.map(t => t.medida))).sort(), [availableTires]);

  const filteredTires = useMemo(() => {
    return availableTires.filter(t => {
      if (filterMarca && t.marca !== filterMarca) return false;
      if (filterMedida && t.medida !== filterMedida) return false;
      if (filterCondicao !== "todas" && t.condicao !== filterCondicao) return false;
      return true;
    });
  }, [availableTires, filterMarca, filterMedida, filterCondicao]);

  const handleSell = () => {
    if (!selectedTireId || !valor) return;
    sellTire(selectedTireId, parseFloat(valor));
    resetForm();
    setOpen(false);
  };

  const resetForm = () => {
    setFilterMarca("");
    setFilterMedida("");
    setFilterCondicao("todas");
    setSelectedTireId("");
    setValor("");
  };

  const totalVendas = sales.reduce((s, p) => s + p.valor, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Vendas</h1>
          <p className="text-sm text-muted-foreground">{sales.length} vendas • Total: R$ {totalVendas.toFixed(2)}</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Nova Venda</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Registrar Venda do Estoque</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              {/* Filtros */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">Marca</Label>
                  <Select value={filterMarca || "todas_marcas"} onValueChange={v => { setFilterMarca(v === "todas_marcas" ? "" : v); setSelectedTireId(""); }}>
                    <SelectTrigger><SelectValue placeholder="Todas" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas_marcas">Todas</SelectItem>
                      {marcas.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Medida</Label>
                  <Select value={filterMedida || "todas_medidas"} onValueChange={v => { setFilterMedida(v === "todas_medidas" ? "" : v); setSelectedTireId(""); }}>
                    <SelectTrigger><SelectValue placeholder="Todas" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas_medidas">Todas</SelectItem>
                      {medidas.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Condição</Label>
                  <Select value={filterCondicao} onValueChange={v => { setFilterCondicao(v); setSelectedTireId(""); }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas</SelectItem>
                      {Object.entries(conditionLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
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
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Nenhum pneu encontrado</TableCell>
                      </TableRow>
                    ) : (
                      filteredTires.map(t => (
                        <TableRow
                          key={t.id}
                          className={`cursor-pointer transition-colors ${selectedTireId === t.id ? "bg-primary/10" : "hover:bg-secondary/50"}`}
                          onClick={() => setSelectedTireId(t.id)}
                        >
                          <TableCell>
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedTireId === t.id ? "border-primary" : "border-muted-foreground/30"}`}>
                              {selectedTireId === t.id && <div className="w-2 h-2 rounded-full bg-primary" />}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{t.marca}</TableCell>
                          <TableCell>{t.medida}</TableCell>
                          <TableCell>R{t.aro}</TableCell>
                          <TableCell><Badge variant={t.condicao === "novo" ? "default" : "secondary"}>{conditionLabels[t.condicao]}</Badge></TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <p className="text-xs text-muted-foreground">{filteredTires.length} pneu(s) disponível(is)</p>

              {/* Valor */}
              <div>
                <Label>Valor de Venda (R$)</Label>
                <Input type="number" value={valor} onChange={e => setValor(e.target.value)} placeholder="0,00" />
              </div>

              <Button onClick={handleSell} disabled={!selectedTireId || !valor}>
                <DollarSign className="h-4 w-4 mr-2" />Confirmar Venda
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50">
              <TableHead>Data</TableHead>
              <TableHead>Marca</TableHead>
              <TableHead>Medida</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">Nenhuma venda registrada</TableCell>
              </TableRow>
            ) : (
              [...sales].reverse().map(s => (
                <TableRow key={s.id}>
                  <TableCell>{new Date(s.data).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell className="font-medium">{s.marca}</TableCell>
                  <TableCell>{s.medida}</TableCell>
                  <TableCell className="text-right font-medium text-success">R$ {s.valor.toFixed(2)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
