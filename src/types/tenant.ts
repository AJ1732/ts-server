export const BUSINESS_NATURE_OPTIONS = [
  "FMCG",
  "Pharmaceuticals",
  "Manufacturing",
  "Retail",
  "Logistics",
  "Agriculture",
  "Automotive",
  "Construction",
  "E-Commerce",
  "Other",
] as const;

export type BusinessNature = (typeof BUSINESS_NATURE_OPTIONS)[number];

export const INVENTORY_TYPE_OPTIONS = [
  "FMCG",
  "Pharmaceuticals",
  "Manufacturing",
  "Retail",
  "Logistics",
  "Agriculture",
  "Automotive",
  "Construction",
  "E-Commerce",
  "Other",
] as const;

export type InventoryTypes = (typeof INVENTORY_TYPE_OPTIONS)[number];
