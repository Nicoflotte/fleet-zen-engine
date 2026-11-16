import type { Expense, InsurancePolicy, Vehicle } from "@/lib/fleet-data";

export type VehicleCostBreakdown = {
  year: number;
  monthsElapsed: number;
  rent: number;
  insurance: number;
  annualPremium: number | null;
  fuel: number;
  maintenance: number;
  tolls: number;
  other: number;
  total: number;
  ytd: { fuel: number; maintenance: number; tolls: number; other: number };
};

/** Prime annuelle renseignée pour ce véhicule sur une police active (non archivée, non résiliée). */
export function vehiclePremium(policies: InsurancePolicy[], vehicleId: string): number | null {
  for (const p of policies) {
    if (p.archived || p.status === "resilie") continue;
    const value = p.vehiclePremiums?.[vehicleId];
    if (typeof value === "number" && value > 0) return value;
  }
  return null;
}

/** Coût moyen mensuel réel : loyer + prime/12 + dépenses de l'année / mois écoulés. */
export function computeVehicleCost(
  vehicle: Vehicle,
  expenses: Expense[],
  policies: InsurancePolicy[],
  now: Date = new Date(),
): VehicleCostBreakdown {
  const year = now.getFullYear();
  const monthsElapsed = now.getMonth() + 1;
  const ytd = { fuel: 0, maintenance: 0, tolls: 0, other: 0 };
  for (const e of expenses) {
    if (e.vehicleId !== vehicle.id || !e.month.startsWith(`${year}-`)) continue;
    if (e.type === "carburant") ytd.fuel += e.amount;
    else if (e.type === "entretien" || e.type === "pneumatiques") ytd.maintenance += e.amount;
    else if (e.type === "peages") ytd.tolls += e.amount;
    else if (e.type === "divers") ytd.other += e.amount;
  }
  const annualPremium = vehiclePremium(policies, vehicle.id);
  const rent = vehicle.monthlyCost || 0;
  const insurance = annualPremium ? annualPremium / 12 : 0;
  const fuel = ytd.fuel / monthsElapsed;
  const maintenance = ytd.maintenance / monthsElapsed;
  const tolls = ytd.tolls / monthsElapsed;
  const other = ytd.other / monthsElapsed;
  return {
    year, monthsElapsed, rent, insurance, annualPremium, fuel, maintenance, tolls, other,
    total: rent + insurance + fuel + maintenance + tolls + other, ytd,
  };
}
