import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Archive,
  ArchiveRestore,
  ArrowDown,
  ArrowUp,
  Download,
  RotateCcw,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { RecordFormDialog } from "@/components/record-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { exportCsv } from "@/lib/export-csv";
import {
  currency,
  leaseStatusLabels,
  shortDate,
  type LeaseStatus,
} from "@/lib/fleet-data";
import { useFleet } from "@/lib/fleet-store";

const tone: Record<LeaseStatus, string> = {
  en_cours: "bg-success/15 text-success-foreground border-success/30",
  a_terme: "bg-warning/20 text-warning-foreground border-warning/40",
  solde: "bg-info/15 text-info border-info/30",
  resilie: "bg-destructive/12 text-destructive border-destructive/30",
};

export const Route = createFileRoute("/credits-baux")({
  head: () => ({
    meta: [
      { title: "Crédits-baux & LOA — FleetManager AI" },
      {
        name: "description",
        content:
          "Suivi des crédits-baux et LOA : organisme, loyer mensuel, mois restants, valeur résiduelle et fin de contrat.",
      },
      { property: "og:title", content: "Crédits-baux & LOA — FleetManager AI" },
      {
        property: "og:description",
        content: "Loyers, échéances et valeurs résiduelles des financements de la flotte.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LeasesPage,
});

type SortKey = "vehicleLabel" | "entity" | "monthlyRent" | "end" | "remainingMonths";
type SortDir = "asc" | "desc";
type Prefs = {
  query: string;
  entity: string;
  vehicle: string;
  status: LeaseStatus | "all";
  due: "all" | "90" | "180" | "365" | "past";
  sortKey: SortKey;
  sortDir: SortDir;
};

const STORAGE_KEY = "fleet.leases.filters";
const defaultPrefs: Prefs = {
  query: "",
  entity: "all",
  vehicle: "all",
  status: "all",
  due: "all",
  sortKey: "end",
  sortDir: "asc",
};

const dueLabels: Record<Prefs["due"], string> = {
  all: "Toutes les échéances",
  "90": "Dans les 3 mois",
  "180": "Dans les 6 mois",
  "365": "Dans les 12 mois",
  past: "Échéance dépassée",
};

function LeasesPage() {
  const { leases, entities, entityName, addLease, updateLease, toggleLeaseArchive } = useFleet();
  const [showArchived, setShowArchived] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>(defaultPrefs);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setPrefs({ ...defaultPrefs, ...(JSON.parse(raw) as Partial<Prefs>) });
    } catch {
      /* préférences illisibles : on garde les valeurs par défaut */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      /* stockage indisponible */
    }
  }, [prefs, loaded]);

  const update = (patch: Partial<Prefs>) => setPrefs((p) => ({ ...p, ...patch }));
  const toggleSort = (key: SortKey) =>
    setPrefs((p) => ({
      ...p,
      sortKey: key,
      sortDir: p.sortKey === key && p.sortDir === "asc" ? "desc" : "asc",
    }));

  const vehicleOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const l of leases) {
      if (!map.has(l.plate)) map.set(l.plate, l.vehicleLabel);
    }
    return Array.from(map.entries())
      .sort((a, b) => a[1].localeCompare(b[1], "fr"))
      .map(([plate, label]) => ({ plate, label }));
  }, [leases]);

  const rows = useMemo(() => {
    const q = prefs.query.trim().toLowerCase();
    const now = Date.now();
    const filtered = leases.filter((l) => {
      if (showArchived ? !l.archived : l.archived) return false;
      if (
        q &&
        ![l.vehicleLabel, l.plate, l.lender, l.id].join(" ").toLowerCase().includes(q)
      )
        return false;
      if (prefs.entity !== "all" && l.entityId !== prefs.entity) return false;
      if (prefs.vehicle !== "all" && l.plate !== prefs.vehicle) return false;
      if (prefs.status !== "all" && l.status !== prefs.status) return false;
      if (prefs.due !== "all") {
        const diff = new Date(l.end).getTime() - now;
        if (prefs.due === "past") {
          if (diff >= 0) return false;
        } else {
          const max = Number(prefs.due) * 86_400_000;
          if (diff < 0 || diff > max) return false;
        }
      }
      return true;
    });

    const dir = prefs.sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      switch (prefs.sortKey) {
        case "monthlyRent":
          return (a.monthlyRent - b.monthlyRent) * dir;
        case "remainingMonths":
          return (a.remainingMonths - b.remainingMonths) * dir;
        case "end":
          return (new Date(a.end).getTime() - new Date(b.end).getTime()) * dir;
        case "entity":
          return entityName(a.entityId).localeCompare(entityName(b.entityId), "fr") * dir;
        default:
          return a.vehicleLabel.localeCompare(b.vehicleLabel, "fr") * dir;
      }
    });
  }, [leases, showArchived, prefs, entityName]);

  const SortButton = ({ label, sortKey }: { label: string; sortKey: SortKey }) => (
    <button
      type="button"
      onClick={() => toggleSort(sortKey)}
      className="inline-flex items-center gap-1 hover:text-accent"
    >
      {label}
      {prefs.sortKey === sortKey &&
        (prefs.sortDir === "asc" ? (
          <ArrowUp className="size-3.5" />
        ) : (
          <ArrowDown className="size-3.5" />
        ))}
    </button>
  );

  const active = leases.filter((l) => !l.archived);
  const monthly = active.reduce((sum, l) => sum + l.monthlyRent, 0);
  const endingSoon = active.filter((l) => l.status === "a_terme").length;

  return (
    <>
      <PageHeader
        title="Crédits-baux & LOA"
        subtitle={`${active.length} contrats · ${currency(monthly)} de loyers mensuels · ${endingSoon} arrivant à terme`}
        actions={
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                exportCsv(
                  "credits-baux",
                  rows.map((l) => ({
                    Contrat: l.id,
                    Véhicule: l.vehicleLabel,
                    Immatriculation: l.plate,
                    Organisme: l.lender,
                    Type: l.type === "loa" ? "LOA" : "Crédit-bail",
                    Société: entityName(l.entityId),
                    "Loyer mensuel": l.monthlyRent,
                    Début: l.start,
                    Fin: l.end,
                    "Mois restants": l.remainingMonths,
                    "Valeur résiduelle": l.residualValue,
                    Statut: leaseStatusLabels[l.status],
                  })),
                )
              }
            >
              <Download /> Export Excel
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowArchived((v) => !v)}>
              {showArchived ? "Voir les actifs" : "Voir les archives"}
            </Button>
            <RecordFormDialog
              triggerLabel="Nouveau contrat"
              title="Nouveau crédit-bail / LOA"
              description="Renseignez le véhicule, l'organisme financier, la société et les conditions du contrat."
              fields={[
                {
                  key: "vehicleLabel",
                  label: "Véhicule",
                  required: true,
                  placeholder: "Peugeot 308 SW",
                },
                {
                  key: "plate",
                  label: "Immatriculation",
                  required: true,
                  placeholder: "AB-123-CD",
                },
                {
                  key: "lender",
                  label: "Organisme financier",
                  required: true,
                  placeholder: "BNP Leasing",
                },
                {
                  key: "type",
                  label: "Type de contrat",
                  type: "select",
                  required: true,
                  options: [
                    { value: "loa", label: "LOA" },
                    { value: "credit_bail", label: "Crédit-bail" },
                  ],
                },
                {
                  key: "entityId",
                  label: "Société",
                  type: "select",
                  required: true,
                  options: entities.map((e) => ({ value: e.id, label: e.name })),
                },
                {
                  key: "monthlyRent",
                  label: "Loyer mensuel (€)",
                  type: "number",
                  required: true,
                },
                { key: "start", label: "Début du contrat", type: "date", required: true },
                { key: "end", label: "Fin du contrat", type: "date", required: true },
                {
                  key: "remainingMonths",
                  label: "Mois restants",
                  type: "number",
                  required: true,
                },
                {
                  key: "residualValue",
                  label: "Valeur résiduelle (€)",
                  type: "number",
                  required: true,
                },
                {
                  key: "status",
                  label: "Statut",
                  type: "select",
                  options: Object.entries(leaseStatusLabels).map(([value, label]) => ({
                    value,
                    label,
                  })),
                },
              ]}
              onSubmit={(values) => {
                const lease = addLease({
                  vehicleLabel: values["vehicleLabel"]!,
                  plate: values["plate"]!,
                  lender: values["lender"]!,
                  type: (values["type"] ?? "loa") as "loa" | "credit_bail",
                  entityId: values["entityId"]!,
                  monthlyRent: Number(values["monthlyRent"] ?? 0),
                  start: values["start"]!,
                  end: values["end"]!,
                  remainingMonths: Number(values["remainingMonths"] ?? 0),
                  residualValue: Number(values["residualValue"] ?? 0),
                  status: (values["status"] ?? "en_cours") as LeaseStatus,
                });
                toast.success(`Contrat ${lease.id} enregistré pour ${lease.vehicleLabel}`);
              }}
            />
          </>
        }
      />
      <main className="flex-1 space-y-5 px-4 py-6 md:px-8">
        <section className="panel flex flex-wrap items-center gap-3 p-4">
          <div className="relative min-w-56 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={prefs.query}
              onChange={(event) => update({ query: event.target.value })}
              placeholder="Véhicule, immatriculation, organisme…"
              className="pl-9"
              aria-label="Rechercher un contrat"
            />
          </div>

          <Select value={prefs.entity} onValueChange={(value) => update({ entity: value })}>
            <SelectTrigger className="w-48" aria-label="Filtrer par société">
              <SelectValue placeholder="Société" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les sociétés</SelectItem>
              {entities.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={prefs.vehicle}
            onValueChange={(value) => update({ vehicle: value })}
          >
            <SelectTrigger className="w-56" aria-label="Filtrer par véhicule">
              <SelectValue placeholder="Véhicule" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les véhicules</SelectItem>
              {vehicleOptions.map((v) => (
                <SelectItem key={v.plate} value={v.plate}>
                  {v.label} — {v.plate}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={prefs.status}
            onValueChange={(value) => update({ status: value as LeaseStatus | "all" })}
          >
            <SelectTrigger className="w-44" aria-label="Filtrer par statut">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              {Object.entries(leaseStatusLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={prefs.due}
            onValueChange={(value) => update({ due: value as Prefs["due"] })}
          >
            <SelectTrigger className="w-48" aria-label="Filtrer par échéance">
              <SelectValue placeholder="Échéance" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(dueLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            disabled={!hasActivePrefs}
            onClick={() => {
              setPrefs(defaultPrefs);
              toast.success("Recherche, filtres et tri réinitialisés");
            }}
          >
            <RotateCcw /> Réinitialiser
            {hasActivePrefs && (
              <Badge variant="secondary" className="ml-1 tabular">
                {activePrefsCount}
              </Badge>
            )}
          </Button>
        </section>

        <section className="panel overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3">
            <p className="text-sm font-semibold">
              {rows.length} contrat{rows.length > 1 ? "s" : ""}
            </p>
            <p className="text-xs text-muted-foreground">
              Filtres et tri conservés pour vos prochaines visites
            </p>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contrat</TableHead>
                  <TableHead>
                    <SortButton label="Véhicule" sortKey="vehicleLabel" />
                  </TableHead>
                  <TableHead>Immat.</TableHead>
                  <TableHead>Organisme</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>
                    <SortButton label="Société" sortKey="entity" />
                  </TableHead>
                  <TableHead className="text-right">
                    <SortButton label="Loyer" sortKey="monthlyRent" />
                  </TableHead>
                  <TableHead>
                    <SortButton label="Fin" sortKey="end" />
                  </TableHead>
                  <TableHead className="text-right">
                    <SortButton label="Restant" sortKey="remainingMonths" />
                  </TableHead>
                  <TableHead className="text-right">Valeur résiduelle</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((lease) => (
                  <TableRow key={lease.id}>
                    <TableCell className="tabular font-medium">{lease.id}</TableCell>
                    <TableCell>{lease.vehicleLabel}</TableCell>
                    <TableCell className="tabular">{lease.plate}</TableCell>
                    <TableCell>{lease.lender}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {lease.type === "loa" ? "LOA" : "Crédit-bail"}
                      </Badge>
                    </TableCell>
                    <TableCell>{entityName(lease.entityId)}</TableCell>
                    <TableCell className="tabular text-right">{currency(lease.monthlyRent)}</TableCell>
                    <TableCell className="tabular">{shortDate(lease.end)}</TableCell>
                    <TableCell className="tabular text-right">{lease.remainingMonths} mois</TableCell>
                    <TableCell className="tabular text-right">{currency(lease.residualValue)}</TableCell>
                    <TableCell>
                      <Select
                        value={lease.status}
                        onValueChange={(value) => {
                          updateLease(lease.id, { status: value as LeaseStatus });
                          toast.success(
                            `Contrat ${lease.id} — ${leaseStatusLabels[value as LeaseStatus]}`,
                          );
                        }}
                      >
                        <SelectTrigger className="h-8 w-[150px]">
                          <Badge variant="outline" className={tone[lease.status]}>
                            {leaseStatusLabels[lease.status]}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(leaseStatusLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          toggleLeaseArchive(lease.id);
                          toast.success(lease.archived ? "Contrat restauré" : "Contrat archivé");
                        }}
                      >
                        {lease.archived ? <ArchiveRestore /> : <Archive />}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={12} className="py-10 text-center text-sm text-muted-foreground">
                      Aucun contrat {showArchived ? "archivé" : "actif"}.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </section>
      </main>
    </>
  );
}
