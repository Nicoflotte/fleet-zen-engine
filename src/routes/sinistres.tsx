import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Archive, ArchiveRestore, Download } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { RecordFormDialog } from "@/components/record-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { currency, shortDate, type Claim } from "@/lib/fleet-data";
import { useFleet } from "@/lib/fleet-store";

const statusLabel = {
  declare: "Déclaré",
  expertise: "Expertise",
  reparation: "Réparation",
  clos: "Clos",
} as const;

const responsibilityLabel = {
  engagee: "Engagée",
  non_engagee: "Non engagée",
  en_cours: "En cours",
} as const;

export const Route = createFileRoute("/sinistres")({
  head: () => ({
    meta: [
      { title: "Sinistres — FleetManager AI" },
      {
        name: "description",
        content:
          "Suivi des sinistres de la flotte : nature, responsabilité, assureur, coût et avancement du dossier.",
      },
      { property: "og:title", content: "Sinistres — FleetManager AI" },
      {
        property: "og:description",
        content: "Déclarations, expertises et réparations des sinistres de la flotte.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ClaimsPage,
});

function ClaimsPage() {
  const { claims, agencies, agencyCode, addClaim, updateClaim, toggleClaimArchive } = useFleet();
  const [showArchived, setShowArchived] = useState(false);

  const rows = claims.filter((c) => (showArchived ? c.archived : !c.archived));
  const active = claims.filter((c) => !c.archived);
  const total = active.reduce((sum, c) => sum + c.cost, 0);

  return (
    <>
      <PageHeader
        title="Sinistres"
        subtitle={`${active.length} dossiers en cours · ${currency(total)} de coûts constatés`}
        actions={
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                exportCsv(
                  "sinistres",
                  rows.map((c) => ({
                    Dossier: c.id,
                    Date: c.date,
                    Immatriculation: c.plate,
                    Conducteur: c.driverName ?? "",
                    Agence: agencyCode(c.agencyId),
                    Nature: c.nature,
                    Responsabilité: responsibilityLabel[c.responsibility],
                    Assureur: c.insurer,
                    Coût: c.cost,
                    Statut: statusLabel[c.status],
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
              triggerLabel="Déclarer un sinistre"
              title="Déclaration de sinistre"
              description="Renseignez les éléments du sinistre ; le dossier sera historisé."
              fields={[
                { key: "date", label: "Date du sinistre", type: "date", required: true },
                { key: "plate", label: "Immatriculation", required: true },
                { key: "driverName", label: "Conducteur" },
                {
                  key: "agencyId",
                  label: "Agence",
                  type: "select",
                  options: agencies.map((a) => ({ value: a.id, label: a.name })),
                },
                { key: "nature", label: "Nature du sinistre", required: true, full: true },
                {
                  key: "responsibility",
                  label: "Responsabilité",
                  type: "select",
                  options: [
                    { value: "en_cours", label: "En cours d'analyse" },
                    { value: "engagee", label: "Engagée" },
                    { value: "non_engagee", label: "Non engagée" },
                  ],
                },
                { key: "insurer", label: "Assureur", required: true, placeholder: "AXA Flotte" },
                { key: "cost", label: "Coût estimé (€)", type: "number", required: true },
                {
                  key: "status",
                  label: "Statut",
                  type: "select",
                  options: [
                    { value: "declare", label: "Déclaré" },
                    { value: "expertise", label: "Expertise" },
                    { value: "reparation", label: "Réparation" },
                    { value: "clos", label: "Clos" },
                  ],
                },
              ]}
              onSubmit={(values) => {
                const claim = addClaim({
                  date: values["date"]!,
                  plate: values["plate"]!.toUpperCase(),
                  driverName: values["driverName"]?.trim() ? values["driverName"]! : null,
                  agencyId: values["agencyId"]!,
                  nature: values["nature"]!,
                  responsibility: (values["responsibility"] ?? "en_cours") as Claim["responsibility"],
                  cost: Number(values["cost"] ?? 0),
                  status: (values["status"] ?? "declare") as Claim["status"],
                  insurer: values["insurer"]!,
                });
                toast.success(`Sinistre ${claim.id} déclaré`);
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
                  <TableHead>Dossier</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Immat.</TableHead>
                  <TableHead>Conducteur</TableHead>
                  <TableHead>Agence</TableHead>
                  <TableHead>Nature</TableHead>
                  <TableHead>Responsabilité</TableHead>
                  <TableHead>Assureur</TableHead>
                  <TableHead className="text-right">Coût</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((claim) => (
                  <TableRow key={claim.id}>
                    <TableCell className="tabular font-medium">{claim.id}</TableCell>
                    <TableCell className="tabular">{shortDate(claim.date)}</TableCell>
                    <TableCell className="tabular">{claim.plate}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {claim.driverName ?? "—"}
                    </TableCell>
                    <TableCell>{agencyCode(claim.agencyId)}</TableCell>
                    <TableCell>{claim.nature}</TableCell>
                    <TableCell>{responsibilityLabel[claim.responsibility]}</TableCell>
                    <TableCell>{claim.insurer}</TableCell>
                    <TableCell className="tabular text-right">{currency(claim.cost)}</TableCell>
                    <TableCell>
                      <Select
                        value={claim.status}
                        onValueChange={(value) => {
                          updateClaim(claim.id, { status: value as Claim["status"] });
                          toast.success(`Dossier ${claim.id} — ${statusLabel[value as Claim["status"]]}`);
                        }}
                      >
                        <SelectTrigger className="h-8 w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(statusLabel).map(([value, label]) => (
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
                          toggleClaimArchive(claim.id);
                          toast.success(claim.archived ? "Dossier réactivé" : "Dossier archivé");
                        }}
                      >
                        {claim.archived ? <ArchiveRestore /> : <Archive />}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={11} className="py-10 text-center text-sm text-muted-foreground">
                      Aucun sinistre {showArchived ? "archivé" : "en cours"}.
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
