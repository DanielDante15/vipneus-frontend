import api from "@/lib/axios";
import { TireCondition } from "@/types/tire";

export interface SaleAPI {
  id: string;
  tire_id: string;
  valor: number;
  data: string;
  marca: string;
  medida: string;
  aro: string;
  condicao: TireCondition;
  custo: number | null;
  lucro: number | null;
}

export interface CreateSaleDTO {
  tire_id: string;
  valor: number;
}

export const salesService = {
  fetchSales: async (): Promise<SaleAPI[]> => {
    const response = await api.get("/sales/");
    return response.data;
  },

  createSale: async (data: CreateSaleDTO): Promise<SaleAPI> => {
    const response = await api.post("/sales/", data);
    return response.data;
  },

  getSale: async (id: string): Promise<SaleAPI> => {
    const response = await api.get(`/sales/${id}`);
    return response.data;
  },
};