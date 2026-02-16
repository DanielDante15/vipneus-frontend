import api from "@/lib/axios";

export interface DashboardStats {
  total_tires: number;
  total_sold: number;
  total_purchased: number;
  total_entrada: number;
  total_saida: number;
  lucro: number;
}

export interface ConditionData {
  name: string;
  value: number;
}

export interface BrandData {
  name: string;
  value: number;
}

export interface MonthlyData {
  month: string;
  vendas: number;
  compras: number;
}

export interface DashboardResponse {
  stats: DashboardStats;
  condition_data: ConditionData[];
  top_brands: BrandData[];
  monthly_data: MonthlyData[];
}

export const dashboardService = {
  fetchDashboardData: async (): Promise<DashboardResponse> => {
    const response = await api.get("/dashboard");
    return response.data;
  },
};