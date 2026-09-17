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
import {
  currency,
  policyStatusLabels,
  shortDate,
  type InsurancePolicy,
  type PolicyStatus,
} from "@/lib/fleet-data";
import { useFleet } from "@/lib/fleet-store";

const tone: Record<PolicyStatus, string> = {
  active: "bg-success/15 text-success-foreground border-success/30",
  a_renouveler: "bg-warning/20 text-warning-foreground border-warning/40",
  resilie: "bg-destructive/12 text-destructive border-destructive/30",
  echeance: "bg-info/15 text-info border-info/30",
};

export const Route = createFileRoute("/assurances")({
  head: () => ({
    meta: [
      { title: "Assurances — FleetManager AI" },
      {
        name: "description",
        content:
          "Polices d'assurance flotte par société : assureur, périmètre couvert, nombre de véhicules, prime annuelle, échéance et statut.",
      },
      { property: "og:title", content: "Assurances — FleetManager AI" },
      {
        property: "og:description",
        content: "Polices, primes annuelles, statuts et renouvellements d'assurance de la flotte.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: InsurancePage,
});

function InsurancePage() {
  const {
    insurancePolicies,
    entities,
    entityName,
    addPolicy,
    updatePolicy,
    togglePolicyArchive,
  } = useFleet();
  const [showArchived, setShowArchived] = useState(false);

  const rows = insurancePolicies.filter((p) => (showArchived ? p.archived : !p.archived));
  const active = insurancePolicies.filter((p) => !p.archived);
  const premium = active.reduce((sum, p) => sum + p.annualPremium, 0);
  const toRenew = active.filter((p) => p.status === "a_renouveler" || p.status === "echeance").length;

  return (
    <>
      <PageHeader
        title="Assurances"
        subtitle={`${active.length} polices · ${currency(premium)} de primes annuelles · ${toRenew} à renouveler`}
        actions={
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                exportCsv(
                  "assurances",
                  rows.map((p) => ({
                    Police: p.policyNumber,
                    Assureur: p.insurer,
                    Société: entityName(p.entityId),
                    Périmètre: p.scope,
                    Véhicules: p.vehicles,
                    "Prime annuelle": p.annualPremium,
                    Renouvellement: p.renewal,
                    Statut: policyStatusLabels[p.status],
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
              triggerLabel="Nouvelle police"
              title="Nouvelle police d'assurance"
              description="Renseignez l'assureur, la société couverte (tiers), le périmètre et l'échéance."
              fields={[
                {
                  key: "insurer",
                  label: "Assureur",
                  required: true,
                  placeholder: "AXA Flotte",
                },
                {
                  key: "policyNumber",
                  label: "N° de police",
                  required: true,
                  placeholder: "AX-4471-882",
                },
                {
                  key: "entityId",
                  label: "Société (tiers)",
                  type: "select",
                  required: true,
                  options: entities.map((e) => ({ value: e.id, label: e.name })),
                },
                {
                  key: "scope",
                  label: "Périmètre couvert",
                  required: true,
                  placeholder: "Flotte VP + VU",
                },
                {
                  key: "vehicles",
                  label: "Nombre de véhicules",
                  type: "number",
                  required: true,
                },
                {
                  key: "annualPremium",
                  label: "Prime annuelle (€)",
                  type: "number",
                  required: true,
                },
                { key: "renewal", label: "Échéance de renouvellement", type: "date", required: true },
                {
                  key: "status",
                  label: "Statut",
                  type: "select",
                  options: Object.entries(policyStatusLabels).map(([value, label]) => ({
                    value,
                    label,
                  })),
                },
              ]}
              onSubmit={(values) => {
                const policy = addPolicy({
                  insurer: values["insurer"]!,
                  policyNumber: values["policyNumber"]!,
                  entityId: values["entityId"]!,
                  scope: values["scope"]!,
                  vehicles: Number(values["vehicles"] ?? 0),
                  annualPremium: Number(values["annualPremium"] ?? 0),
                  renewal: values["renewal"]!,
                  status: (values["status"] ?? "active") as PolicyStatus,
                });
                toast.success(`Police ${policy.policyNumber} enregistrée`);
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
                  <TableHead>Police</TableHead>
                  <TableHead>Assureur</TableHead>
                  <TableHead>Société (tiers)</TableHead>
                  <TableHead>Périmètre</TableHead>
                  <TableHead className="text-right">Véhicules</TableHead>
                  <TableHead className="text-right">Prime annuelle</TableHead>
                  <TableHead>Renouvellement</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((policy) => (
                  <TableRow key={policy.id}>
                    <TableCell className="tabular font-medium">{policy.policyNumber}</TableCell>
                    <TableCell>{policy.insurer}</TableCell>
                    <TableCell>
                      <Select
                        value={policy.entityId}
                        onValueChange={(value) => {
                          updatePolicy(policy.id, { entityId: value });
                          toast.success(`Police ${policy.policyNumber} — tiers : ${entityName(value)}`);
                        }}
                      >
                        <SelectTrigger className="h-8 w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {entities.map((e) => (
                            <SelectItem key={e.id} value={e.id}>
                              {e.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{policy.scope}</TableCell>
                    <TableCell className="tabular text-right">{policy.vehicles}</TableCell>
                    <TableCell className="tabular text-right">{currency(policy.annualPremium)}</TableCell>
                    <TableCell className="tabular">{shortDate(policy.renewal)}</TableCell>
                    <TableCell>
                      <Select
                        value={policy.status}
                        onValueChange={(value) => {
                          updatePolicy(policy.id, { status: value as PolicyStatus });
                          toast.success(
                            `Police ${policy.policyNumber} — ${policyStatusLabels[value as PolicyStatus]}`,
                          );
                        }}
                      >
                        <SelectTrigger className="h-8 w-[150px]">
                          <Badge variant="outline" className={tone[policy.status]}>
                            {policyStatusLabels[policy.status]}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(policyStatusLabels).map(([value, label]) => (
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
                          togglePolicyArchive(policy.id);
                          toast.success(policy.archived ? "Police réactivée" : "Police archivée");
                        }}
                      >
                        {policy.archived ? <ArchiveRestore /> : <Archive />}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="py-10 text-center text-sm text-muted-foreground">
                      Aucune police {showArchived ? "archivée" : "active"}.
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
