import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Tire, Sale, Purchase, TireCondition } from "@/types/tire";

interface TireContextType {
  tires: Tire[];
  sales: Sale[];
  purchases: Purchase[];
  addTire: (tire: Omit<Tire, "id" | "vendido">) => void;
  removeTire: (id: string) => void;
  sellTire: (tireId: string, valor: number) => void;
  addSale: (sale: Omit<Sale, "id">) => void;
  addPurchase: (purchase: Omit<Purchase, "id">) => void;
}

const TireContext = createContext<TireContextType | undefined>(undefined);

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

export function TireProvider({ children }: { children: ReactNode }) {
  const [tires, setTires] = useState<Tire[]>(() => loadFromStorage("vipneus_tires", []));
  const [sales, setSales] = useState<Sale[]>(() => loadFromStorage("vipneus_sales", []));
  const [purchases, setPurchases] = useState<Purchase[]>(() => loadFromStorage("vipneus_purchases", []));

  useEffect(() => { localStorage.setItem("vipneus_tires", JSON.stringify(tires)); }, [tires]);
  useEffect(() => { localStorage.setItem("vipneus_sales", JSON.stringify(sales)); }, [sales]);
  useEffect(() => { localStorage.setItem("vipneus_purchases", JSON.stringify(purchases)); }, [purchases]);

  const addTire = (tire: Omit<Tire, "id" | "vendido">) => {
    setTires(prev => [...prev, { ...tire, id: generateId(), vendido: false }]);
  };

  const removeTire = (id: string) => {
    setTires(prev => prev.filter(t => t.id !== id));
  };

  const sellTire = (tireId: string, valor: number) => {
    const tire = tires.find(t => t.id === tireId);
    if (!tire) return;
    const dataSaida = new Date().toISOString().split("T")[0];
    setTires(prev => prev.map(t => t.id === tireId ? { ...t, vendido: true, dataSaida } : t));
    setSales(prev => [...prev, { id: generateId(), tireId, data: dataSaida, valor, marca: tire.marca, medida: tire.medida }]);
  };

  const addSale = (sale: Omit<Sale, "id">) => {
    setSales(prev => [...prev, { ...sale, id: generateId() }]);
  };

  const addPurchase = (purchase: Omit<Purchase, "id">) => {
    const newTire: Tire = {
      id: generateId(),
      marca: purchase.marca,
      medida: purchase.medida,
      aro: purchase.aro,
      condicao: purchase.condicao,
      dataEntrada: purchase.data,
      detalhes: purchase.detalhes,
      vendido: false,
    };
    setTires(prev => [...prev, newTire]);
    setPurchases(prev => [...prev, { ...purchase, id: generateId() }]);
  };

  return (
    <TireContext.Provider value={{ tires, sales, purchases, addTire, removeTire, sellTire, addSale, addPurchase }}>
      {children}
    </TireContext.Provider>
  );
}

export function useTires() {
  const ctx = useContext(TireContext);
  if (!ctx) throw new Error("useTires must be used within TireProvider");
  return ctx;
}
