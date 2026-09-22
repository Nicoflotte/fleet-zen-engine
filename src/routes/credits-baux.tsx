import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Archive,
  ArchiveRestore,
  ArrowDown,
  ArrowUp,
  Download,
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

function LeasesPage() {
  const { leases, entities, entityName, addLease, updateLease, toggleLeaseArchive } = useFleet();
  const [showArchived, setShowArchived] = useState(false);

  const rows = leases.filter((l) => (showArchived ? l.archived : !l.archived));
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
      <main className="flex-1 px-4 py-6 md:px-8">
        <section className="panel overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contrat</TableHead>
                  <TableHead>Véhicule</TableHead>
                  <TableHead>Immat.</TableHead>
                  <TableHead>Organisme</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Société</TableHead>
                  <TableHead className="text-right">Loyer</TableHead>
                  <TableHead>Fin</TableHead>
                  <TableHead className="text-right">Restant</TableHead>
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
