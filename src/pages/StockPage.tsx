import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, DollarSign, Trash2, Search, Loader2 } from "lucide-react";
import { useState } from "react";
import { TireCondition } from "@/types/tire";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { CreateTireDTO, tiresService } from "@/api/tires";
import { CreateSaleDTO, salesService } from "@/api/sale";

const conditionLabels: Record<TireCondition, string> = {
  novo: "Novo",
  seminovo: "Seminovo",
  recapado: "Recapado",
  "meia-vida": "Meia-vida",
};

export default function StockPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [sellOpen, setSellOpen] = useState(false);
  const [sellId, setSellId] = useState("");
  const [sellValor, setSellValor] = useState("");
  const [form, setForm] = useState<CreateTireDTO>({
    marca: "",
    medida: "",
    aro: "",
    condicao: "novo",
    detalhes: "",
  });

  // Query para buscar os pneus
  const { data: tires = [], isLoading, isError } = useQuery({
    queryKey: ["tires"],
    queryFn: tiresService.fetchAvailableTires,
  });

  const addMutation = useMutation({
    mutationFn: tiresService.createTire,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tires"] });
      toast({
        title: "Sucesso!",
        description: "Pneu adicionado ao estoque.",
      });
      setForm({
        marca: "",
        medida: "",
        aro: "",
        condicao: "novo",
        detalhes: "",
      });
      setAddOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation para deletar pneu
  const deleteMutation = useMutation({
    mutationFn: tiresService.deleteTire,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tires"] });
      toast({
        title: "Sucesso!",
        description: "Pneu removido do estoque.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation para vender pneu
  const sellMutation = useMutation({
    mutationFn: salesService.createSale,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tires"] });
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      toast({
        title: "Venda registrada!",
        description: "Pneu vendido com sucesso.",
      });
      setSellId("");
      setSellValor("");
      setSellOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });



  

  const handleAdd = () => {
    if (!form.marca || !form.medida || !form.aro) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha marca, medida e aro.",
        variant: "destructive",
      });
      return;
    }
    addMutation.mutate(form);
  };

  const handleSell = () => {
    if (!sellId || !sellValor) {
      toast({
        title: "Campos obrigatórios",
        description: "Selecione um pneu e informe o valor.",
        variant: "destructive",
      });
      return;
    }

    const saleData: CreateSaleDTO = {
      tire_id: sellId,
      valor: parseFloat(sellValor),
    };

    sellMutation.mutate(saleData);
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Estoque de Pneus
          </h1>
          <p className="text-sm text-muted-foreground">
            {tires.length} pneus em estoque
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Pneu ao Estoque</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Marca *</Label>
                    <Input
                      value={form.marca}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, marca: e.target.value }))
                      }
                      placeholder="Ex: Pirelli"
                    />
                  </div>
                  <div>
                    <Label>Medida *</Label>
                    <Input
                      value={form.medida}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, medida: e.target.value }))
                      }
                      placeholder="Ex: 205/55"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Aro *</Label>
                    <Input
                      value={form.aro}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, aro: e.target.value }))
                      }
                      placeholder="Ex: R16"
                    />
                  </div>
                  <div>
                    <Label>Condição</Label>
                    <Select
                      value={form.condicao}
                      onValueChange={(v) =>
                        setForm((p) => ({ ...p, condicao: v as TireCondition }))
                      }
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
                  <Label>Detalhes</Label>
                  <Input
                    value={form.detalhes}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, detalhes: e.target.value }))
                    }
                    placeholder="Observações..."
                  />
                </div>
                <Button onClick={handleAdd} disabled={addMutation.isPending}>
                  {addMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Adicionando...
                    </>
                  ) : (
                    "Adicionar ao Estoque"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={sellOpen} onOpenChange={setSellOpen}>
            <DialogTrigger asChild>
              <Button variant="secondary">
                <DollarSign className="h-4 w-4 mr-2" />
                Vender
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar Venda</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <Label>Pneu *</Label>
                  <Select value={sellId} onValueChange={setSellId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um pneu" />
                    </SelectTrigger>
                    <SelectContent>
                      {tires.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.marca} - {t.medida} {t.aro}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Valor (R$) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={sellValor}
                    onChange={(e) => setSellValor(e.target.value)}
                    placeholder="0,00"
                  />
                </div>
                <Button onClick={handleSell} disabled={sellMutation.isPending}>
                  {sellMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    "Confirmar Venda"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-10"
          placeholder="Buscar por marca, medida, aro..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50">
              <TableHead>Marca</TableHead>
              <TableHead>Medida</TableHead>
              <TableHead>Aro</TableHead>
              <TableHead>Condição</TableHead>
              <TableHead>Data de Entrada</TableHead>
              <TableHead>Detalhes</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tires.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-12 text-muted-foreground"
                >
                  Nenhum pneu encontrado no estoque
                </TableCell>
              </TableRow>
            ) : (
              tires.map((tire) => (
                <TableRow key={tire.id}>
                  <TableCell className="font-medium">{tire.marca}</TableCell>
                  <TableCell>{tire.medida}</TableCell>
                  <TableCell>{tire.aro}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        tire.condicao === "novo" ? "default" : "secondary"
                      }
                    >
                      {conditionLabels[tire.condicao]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(tire.data_entrada).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {tire.detalhes || "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMutation.mutate(tire.id)}
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