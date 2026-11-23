"use client";
import { createContext, useContext, useMemo } from "react";
import { catalogHelpers, type Catalog, type CatalogHelpers } from "@/lib/catalog";

const Ctx = createContext<CatalogHelpers | null>(null);

export function CatalogProvider({ catalog, children }: { catalog: Catalog; children: React.ReactNode }) {
  const value = useMemo(() => catalogHelpers(catalog), [catalog]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCatalog() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCatalog must be used inside CatalogProvider");
  return c;
}
