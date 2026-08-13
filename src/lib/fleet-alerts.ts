import { daysUntil, type Lease, type Vehicle } from "@/lib/fleet-data";
import type { Driver } from "@/lib/fleet-store";

export type AlertLevel = "critique" | "eleve" | "moyen";

export type AlertKind =
  | "controle_technique"
  | "controle_pollution"
  | "fin_garantie"
  | "fin_credit_bail"
  | "carte_grise"
  | "permis"
  | "atelier";

export type FleetAlert = {
  id: string;
  kind: AlertKind;
  level: AlertLevel;
  label: string;
  target: string;
  owner: string;
  dueDate: string;
  days: number | null;
  agencyId: string;
  entityId: string;
  inProgress: boolean;
};

export const alertKindLabels: Record<AlertKind, string> = {
  controle_technique: "Contrôle technique",
  controle_pollution: "Contrôle pollution",
  fin_garantie: "Fin de garantie",
  fin_credit_bail: "Fin de crédit-bail / LOA",
  carte_grise: "Nouvelle carte grise",
  permis: "Permis de conduire",
  atelier: "Immobilisation atelier",
};

const level = (days: number | null): AlertLevel => {
  if (days === null) return "moyen";
  if (days <= 15) return "critique";
  if (days <= 45) return "eleve";
  return "moyen";
};

export function buildAlerts({
  vehicles,
  drivers,
  leases,
  entityIdOfAgency,
}: {
  vehicles: Vehicle[];
  drivers: Driver[];
  leases: Lease[];
  entityIdOfAgency: (agencyId: string) => string;
}): FleetAlert[] {
  const alerts: FleetAlert[] = [];

  vehicles
    .filter((vehicle) => !vehicle.archived)
    .forEach((vehicle) => {
      const entityId = entityIdOfAgency(vehicle.agencyId);
      const push = (kind: AlertKind, date: string, label: string, owner: string, inProgress = false) => {
        const days = daysUntil(date);
        if (days === null || days > 90) return;
        alerts.push({
          id: `${vehicle.id}-${kind}`,
          kind,
          level: level(days),
          label,
          target: vehicle.plate,
          owner,
          dueDate: date,
          days,
          agencyId: vehicle.agencyId,
          entityId,
          inProgress,
        });
      };

      push(
        "controle_technique",
        vehicle.nextControl,
        `Contrôle technique ${vehicle.plate} à programmer`,
        "Maintenance",
      );
      if (vehicle.nextPollution !== vehicle.nextControl) {
        push(
          "controle_pollution",
          vehicle.nextPollution,
          `Contrôle pollution ${vehicle.plate} à programmer`,
          "Maintenance",
        );
      }
      push("fin_garantie", vehicle.warrantyEnd, `Fin de garantie ${vehicle.plate}`, "Parc");

      if (vehicle.status === "atelier" || vehicle.status === "immobilise") {
        alerts.push({
          id: `${vehicle.id}-atelier`,
          kind: "atelier",
          level: vehicle.status === "immobilise" ? "critique" : "eleve",
          label: `${vehicle.plate} ${vehicle.status === "immobilise" ? "immobilisé" : "en atelier"} — intervention en cours`,
          target: vehicle.plate,
          owner: "Maintenance",
          dueDate: "—",
          days: null,
          agencyId: vehicle.agencyId,
          entityId,
          inProgress: true,
        });
      }
    });

  leases
    .filter((lease) => !lease.archived)
    .forEach((lease) => {
      const days = daysUntil(lease.end);
      if (days === null || days > 120) return;
      const vehicle = vehicles.find((v) => v.plate === lease.plate);
      const agencyId = vehicle?.agencyId ?? "";
      alerts.push({
        id: `${lease.id}-fin`,
        kind: "fin_credit_bail",
        level: level(days),
        label: `${lease.type === "loa" ? "Fin de LOA" : "Fin de crédit-bail"} ${lease.plate} (${lease.lender})`,
        target: lease.plate,
        owner: "Contrats",
        dueDate: lease.end,
        days,
        agencyId,
        entityId: lease.entityId,
        inProgress: false,
      });
      if (lease.type === "loa" && days <= 60) {
        alerts.push({
          id: `${lease.id}-cg`,
          kind: "carte_grise",
          level: "eleve",
          label: `Nouvelle carte grise à établir en fin de LOA — ${lease.plate}`,
          target: lease.plate,
          owner: "Parc",
          dueDate: lease.end,
          days,
          agencyId,
          entityId: lease.entityId,
          inProgress: false,
        });
      }
    });

  drivers
    .filter((driver) => !driver.archived)
    .forEach((driver) => {
      const days = daysUntil(driver.licenseExpiry);
      if (days === null || days > 90) return;
      alerts.push({
        id: `${driver.id}-permis`,
        kind: "permis",
        level: level(days),
        label: `Permis de ${driver.firstName} ${driver.lastName} à revalider`,
        target: driver.licenseNumber,
        owner: "Conducteurs",
        dueDate: driver.licenseExpiry,
        days,
        agencyId: driver.agencyId,
        entityId: entityIdOfAgency(driver.agencyId),
        inProgress: false,
      });
    });

  const order: Record<AlertLevel, number> = { critique: 0, eleve: 1, moyen: 2 };
  return alerts.sort((a, b) => order[a.level] - order[b.level] || (a.days ?? 999) - (b.days ?? 999));
}

export const alertTone: Record<AlertLevel, string> = {
  critique: "border-destructive/30 bg-destructive/10 text-destructive",
  eleve: "border-warning/40 bg-warning/15 text-warning-foreground",
  moyen: "border-border bg-muted text-muted-foreground",
};

export const alertLevelLabels: Record<AlertLevel, string> = {
  critique: "Critique",
  eleve: "Élevé",
  moyen: "Moyen",
};
