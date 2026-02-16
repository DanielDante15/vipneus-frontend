import api from "@/lib/axios";
import { TireCondition } from "@/types/tire";

export interface TireAPI {
  id: string;
  marca: string;
  medida: string;
  aro: string;
  condicao: TireCondition;
  detalhes: string;
  data_entrada: string;
  data_saida: string | null;
  vendido: boolean;
  purchase_id: string | null;
}

export interface CreateTireDTO {
  marca: string;
  medida: string;
  aro: string;
  condicao: TireCondition;
  detalhes: string;
}

export const tiresService = {
  fetchTires: async (): Promise<TireAPI[]> => {
    const response = await api.get("/tires");
    return response.data;
  },
  fetchAvailableTires: async (): Promise<TireAPI[]> => {
    const response = await api.get("/tires/available");
    return response.data;
  },

  createTire: async (data: CreateTireDTO): Promise<TireAPI> => {
    const response = await api.post("/tires", data);
    return response.data;
  },

  deleteTire: async (id: string): Promise<void> => {
    await api.delete(`/tires/${id}`);
  },

  sellTire: async (id: string, valor: number): Promise<TireAPI> => {
    const response = await api.patch(`/tires/${id}/sell`, { valor });
    return response.data;
  },
};