import { useTires } from "@/contexts/TireContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useState } from "react";
import { TireCondition } from "@/types/tire";

const conditionLabels: Record<TireCondition, string> = {
  novo: "Novo",
  seminovo: "Seminovo",
  recapado: "Recapado",
  "meia-vida": "Meia-vida",
};

export default function PurchasesPage() {
  const { purchases, addPurchase } = useTires();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    data: new Date().toISOString().split("T")[0],
    valor: "",
    marca: "",
    medida: "",
    aro: "",
    condicao: "novo" as TireCondition,
    detalhes: "",
  });

  const handleSubmit = () => {
    if (!form.marca || !form.medida || !form.valor || !form.aro) return;
    addPurchase({ ...form, valor: parseFloat(form.valor) });
    setForm({ data: new Date().toISOString().split("T")[0], valor: "", marca: "", medida: "", aro: "", condicao: "novo", detalhes: "" });
    setOpen(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Compras</h1>
          <p className="text-sm text-muted-foreground">{purchases.length} compras registradas</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Nova Compra</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Registrar Compra</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Marca</Label><Input value={form.marca} onChange={e => setForm(p => ({ ...p, marca: e.target.value }))} placeholder="Ex: Goodyear" /></div>
                <div><Label>Medida</Label><Input value={form.medida} onChange={e => setForm(p => ({ ...p, medida: e.target.value }))} placeholder="Ex: 195/65" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Aro</Label><Input value={form.aro} onChange={e => setForm(p => ({ ...p, aro: e.target.value }))} placeholder="Ex: 15" /></div>
                <div>
                  <Label>Condição</Label>
                  <Select value={form.condicao} onValueChange={v => setForm(p => ({ ...p, condicao: v as TireCondition }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(conditionLabels).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Data</Label><Input type="date" value={form.data} onChange={e => setForm(p => ({ ...p, data: e.target.value }))} /></div>
                <div><Label>Valor (R$)</Label><Input type="number" value={form.valor} onChange={e => setForm(p => ({ ...p, valor: e.target.value }))} placeholder="0,00" /></div>
              </div>
              <div><Label>Detalhes</Label><Input value={form.detalhes} onChange={e => setForm(p => ({ ...p, detalhes: e.target.value }))} placeholder="Observações..." /></div>
              <Button onClick={handleSubmit}>Registrar Compra</Button>
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
              <TableHead>Aro</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchases.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">Nenhuma compra registrada</TableCell>
              </TableRow>
            ) : (
              [...purchases].reverse().map(p => (
                <TableRow key={p.id}>
                  <TableCell>{new Date(p.data).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell className="font-medium">{p.marca}</TableCell>
                  <TableCell>{p.medida}</TableCell>
                  <TableCell>R{p.aro}</TableCell>
                  <TableCell className="text-right font-medium text-destructive">R$ {p.valor.toFixed(2)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
