import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import { TireCondition } from "@/types/tire";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { CreatePurchaseDTO, purchaseService } from "@/api/purchase";

const conditionLabels: Record<TireCondition, string> = {
  novo: "Novo",
  seminovo: "Seminovo",
  recapado: "Recapado",
  "meia-vida": "Meia-vida",
};

export default function PurchasesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CreatePurchaseDTO>({
    valor: 0,
    marca: "",
    medida: "",
    aro: "",
    condicao: "novo",
    detalhes: "",
  });

  // Query para buscar compras
  const { data: purchases = [], isLoading, isError } = useQuery({
    queryKey: ["purchases"],
    queryFn: purchaseService.fetchPurchases,
  });

  const createMutation = useMutation({
    mutationFn: purchaseService.createPurchase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      toast({
        title: "Sucesso!",
        description: "Compra registrada com sucesso.",
      });
      setForm({
        valor: 0,
        marca: "",
        medida: "",
        aro: "",
        condicao: "novo",
        detalhes: "",
      });
      setOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation para deletar compra
  const deleteMutation = useMutation({
    mutationFn: purchaseService.deletePurchase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      toast({
        title: "Sucesso!",
        description: "Compra removida com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!form.marca || !form.medida || !form.valor || !form.aro) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    createMutation.mutate(form);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Erro ao carregar dados. Tente novamente.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Compras</h1>
          <p className="text-sm text-muted-foreground">{purchases.length} compras registradas</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Compra
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Compra</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Marca *</Label>
                  <Input
                    value={form.marca}
                    onChange={(e) => setForm((p) => ({ ...p, marca: e.target.value }))}
                    placeholder="Ex: Goodyear"
                  />
                </div>
                <div>
                  <Label>Medida *</Label>
                  <Input
                    value={form.medida}
                    onChange={(e) => setForm((p) => ({ ...p, medida: e.target.value }))}
                    placeholder="Ex: 195/65"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Aro *</Label>
                  <Input
                    value={form.aro}
                    onChange={(e) => setForm((p) => ({ ...p, aro: e.target.value }))}
                    placeholder="Ex: R15"
                  />
                </div>
                <div>
                  <Label>Condição</Label>
                  <Select
                    value={form.condicao}
                    onValueChange={(v) => setForm((p) => ({ ...p, condicao: v as TireCondition }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(conditionLabels).map(([k, v]) => (
                        <SelectItem key={k} value={k}>
                          {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Valor (R$) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.valor || ""}
                  onChange={(e) => setForm((p) => ({ ...p, valor: parseFloat(e.target.value) || 0 }))}
                  placeholder="0,00"
                />
              </div>
              <div>
                <Label>Detalhes</Label>
                <Input
                  value={form.detalhes}
                  onChange={(e) => setForm((p) => ({ ...p, detalhes: e.target.value }))}
                  placeholder="Observações..."
                />
              </div>
              <Button onClick={handleSubmit} disabled={createMutation.isPending}>
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  "Registrar Compra"
                )}
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
              <TableHead>Aro</TableHead>
              <TableHead>Condição</TableHead>
              <TableHead>Detalhes</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchases.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                  Nenhuma compra registrada
                </TableCell>
              </TableRow>
            ) : (
              [...purchases].reverse().map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{new Date(p.data).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell className="font-medium">{p.marca}</TableCell>
                  <TableCell>{p.medida}</TableCell>
                  <TableCell>{p.aro}</TableCell>
                  <TableCell>
                    <Badge variant={p.condicao === "novo" ? "default" : "secondary"}>
                      {conditionLabels[p.condicao]}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">{p.detalhes || "—"}</TableCell>
                  <TableCell className="text-right font-medium text-destructive">
                    R$ {p.valor.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMutation.mutate(p.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}