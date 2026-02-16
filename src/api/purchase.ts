import api from "@/lib/axios";
import { TireCondition } from "@/types/tire";

export interface PurchaseAPI {
  id: string;
  valor: number;
  marca: string;
  medida: string;
  aro: string;
  condicao: TireCondition;
  detalhes: string;
  data: string;
}

export interface CreatePurchaseDTO {
  valor: number;
  marca: string;
  medida: string;
  aro: string;
  condicao: TireCondition;
  detalhes: string;
}

export const purchaseService = {
  fetchPurchases: async (): Promise<PurchaseAPI[]> => {
    const response = await api.get("/purchases/");
    return response.data;
  },

  createPurchase: async (data: CreatePurchaseDTO): Promise<PurchaseAPI> => {
    const response = await api.post("/purchases/", data);
    return response.data;
  },

  deletePurchase: async (id: string): Promise<void> => {
    await api.delete(`/purchases/${id}`);
  },
};