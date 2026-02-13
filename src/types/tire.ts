export type TireCondition = "novo" | "seminovo" | "recapado" | "meia-vida";

export interface Tire {
  id: string;
  marca: string;
  medida: string;
  aro: string;
  condicao: TireCondition;
  dataEntrada: string;
  dataSaida?: string;
  detalhes?: string;
  vendido: boolean;
}

export interface Sale {
  id: string;
  tireId?: string;
  data: string;
  valor: number;
  marca: string;
  medida: string;
}

export interface Purchase {
  id: string;
  data: string;
  valor: number;
  marca: string;
  medida: string;
  aro: string;
  condicao: TireCondition;
  detalhes?: string;
}
