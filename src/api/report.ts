// src/services/reportsService.ts
import api from "@/lib/axios";

export interface MonthOption {
  value: string;
  label: string;
}

export interface SaleReport {
  id: string;
  data: string;
  marca: string;
  medida: string;
  aro: string;
  valor: number;
  custo: number | null;
  lucro: number | null;
}

export interface PurchaseReport {
  id: string;
  data: string;
  marca: string;
  medida: string;
  aro: string;
  valor: number;
}

export interface MonthlyReportResponse {
  month: string;
  total_vendas: number;
  total_compras: number;
  lucro: number;
  sales_count: number;
  purchases_count: number;
  sales: SaleReport[];
  purchases: PurchaseReport[];
}

export interface AvailableMonthsResponse {
  months: string[];
}

export const reportsService = {
  fetchAvailableMonths: async (): Promise<AvailableMonthsResponse> => {
    const response = await api.get("/reports/months");
    return response.data;
  },

  fetchMonthlyReport: async (month: string): Promise<MonthlyReportResponse> => {
    const response = await api.get(`/reports/monthly/${month}`);
    return response.data;
  },
};