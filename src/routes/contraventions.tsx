import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Archive, ArchiveRestore, Download } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { RecordFormDialog } from "@/components/record-form-dialog";
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
import { currency, shortDate, type Fine } from "@/lib/fleet-data";
import { useFleet } from "@/lib/fleet-store";

const statusLabel = {
  a_designer: "À désigner",
  designe: "Désigné",
  payee: "Payée",
  contestee: "Contestée",
} as const;

export const Route = createFileRoute("/contraventions")({
  head: () => ({
    meta: [
      { title: "Contraventions — FleetManager AI" },
      {
        name: "description",
        content:
          "Suivi des contraventions : désignation du conducteur ANTAI, montants, contestations et paiements.",
      },
      { property: "og:title", content: "Contraventions — FleetManager AI" },
      {
        property: "og:description",
        content: "Désignations ANTAI, montants et statuts des contraventions de la flotte.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FinesPage,
});

function FinesPage() {
  const { fines, drivers, agencies, agencyCode, addFine, updateFine, toggleFineArchive } = useFleet();
  const [showArchived, setShowArchived] = useState(false);

  const rows = fines.filter((f) => (showArchived ? f.archived : !f.archived));
  const active = fines.filter((f) => !f.archived);
  const toDesignate = active.filter((f) => f.status === "a_designer").length;
  const activeDrivers = drivers.filter((d) => !d.archived);

  return (
    <>
      <PageHeader
        title="Contraventions"
        subtitle={`${active.length} avis · ${toDesignate} à désigner · ${currency(
          active.reduce((sum, f) => sum + f.amount, 0),
        )}`}
        actions={
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                exportCsv(
                  "contraventions",
                  rows.map((f) => ({
                    Avis: f.id,
                    "Référence ANTAI": f.antaiReference,
                    Date: f.date,
                    Immatriculation: f.plate,
                    Conducteur: f.driverName ?? "",
                    Agence: agencyCode(f.agencyId),
                    Nature: f.nature,
                    Montant: f.amount,
                    Statut: statusLabel[f.status],
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
              triggerLabel="Nouvel avis"
              title="Nouvel avis de contravention"
              description="Enregistrez l'avis reçu ; la désignation ANTAI se fait ensuite dans le tableau."
              fields={[
                {
                  key: "antaiReference",
                  label: "Référence ANTAI",
                  required: true,
                  placeholder: "ANTAI-2026-778120",
                },
                { key: "date", label: "Date de l'infraction", type: "date", required: true },
                { key: "plate", label: "Immatriculation", required: true, placeholder: "FT-208-QW" },
                {
                  key: "agencyId",
                  label: "Agence",
                  type: "select",
                  options: agencies.map((a) => ({ value: a.id, label: a.name })),
                },
                {
                  key: "driverName",
                  label: "Conducteur désigné (facultatif)",
                  type: "select",
                  options: [
                    { value: "__none__", label: "À désigner" },
                    ...activeDrivers.map((d) => ({
                      value: `${d.firstName} ${d.lastName}`,
                      label: `${d.firstName} ${d.lastName}`,
                    })),
                  ],
                },
                { key: "nature", label: "Nature de l'infraction", required: true, full: true },
                { key: "amount", label: "Montant (€)", type: "number", required: true },
                {
                  key: "status",
                  label: "Statut",
                  type: "select",
                  options: Object.entries(statusLabel).map(([value, label]) => ({ value, label })),
                },
              ]}
              onSubmit={(values) => {
                const raw = values["driverName"]?.trim() ?? "";
                const driverName = raw && raw !== "__none__" ? raw : null;
                const fine = addFine({
                  antaiReference: values["antaiReference"]!,
                  date: values["date"]!,
                  plate: values["plate"]!.toUpperCase(),
                  driverName,
                  agencyId: values["agencyId"]!,
                  nature: values["nature"]!,
                  amount: Number(values["amount"] ?? 0),
                  status: (values["status"] ?? (driverName ? "designe" : "a_designer")) as Fine["status"],
                });
                toast.success(`Avis ${fine.id} enregistré`);
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
                  <TableHead>Référence ANTAI</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Immat.</TableHead>
                  <TableHead>Désignation ANTAI</TableHead>
                  <TableHead>Adresse du conducteur</TableHead>
                  <TableHead>Agence</TableHead>
                  <TableHead>Nature</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((fine) => {
                  const designated = activeDrivers.find(
                    (d) => `${d.firstName} ${d.lastName}` === fine.driverName,
                  );
                  return (
                    <TableRow key={fine.id}>
                      <TableCell className="tabular font-medium">{fine.antaiReference}</TableCell>
                      <TableCell className="tabular">{shortDate(fine.date)}</TableCell>
                      <TableCell className="tabular">{fine.plate}</TableCell>
                      <TableCell>
                        <Select
                          value={fine.driverName ?? "__none__"}
                          onValueChange={(value) => {
                            if (value === "__none__") {
                              updateFine(fine.id, { driverName: null, status: "a_designer" });
                              toast.success(`Avis ${fine.id} — désignation retirée`);
                              return;
                            }
                            updateFine(fine.id, {
                              driverName: value,
                              status: fine.status === "a_designer" ? "designe" : fine.status,
                            });
                            toast.success(`Avis ${fine.id} désigné à ${value}`);
                          }}
                        >
                          <SelectTrigger className="h-8 w-[180px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__">À désigner</SelectItem>
                            {activeDrivers.map((d) => (
                              <SelectItem key={d.id} value={`${d.firstName} ${d.lastName}`}>
                                {d.firstName} {d.lastName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {designated
                          ? `${designated.street}, ${designated.postalCode} ${designated.city}`
                          : "—"}
                      </TableCell>
                      <TableCell>{agencyCode(fine.agencyId)}</TableCell>
                      <TableCell>{fine.nature}</TableCell>
                      <TableCell className="tabular text-right">{currency(fine.amount)}</TableCell>
                      <TableCell>
                        <Select
                          value={fine.status}
                          onValueChange={(value) => {
                            updateFine(fine.id, { status: value as Fine["status"] });
                            toast.success(
                              `Avis ${fine.id} — ${statusLabel[value as Fine["status"]]}`,
                            );
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
                            toggleFineArchive(fine.id);
                            toast.success(fine.archived ? "Avis réactivé" : "Avis archivé");
                          }}
                        >
                          {fine.archived ? <ArchiveRestore /> : <Archive />}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="py-10 text-center text-sm text-muted-foreground">
                      Aucune contravention {showArchived ? "archivée" : "active"}.
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
