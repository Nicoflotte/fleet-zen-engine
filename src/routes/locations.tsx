import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Archive, ArchiveRestore, Download } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { RecordFormDialog } from "@/components/record-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { exportCsv } from "@/lib/export-csv";
import { currency, shortDate, type VehicleCategory } from "@/lib/fleet-data";
import { useFleet } from "@/lib/fleet-store";

const statusLabel = {
  en_cours: "En cours",
  a_restituer: "À restituer",
  terminee: "Terminée",
} as const;

export const Route = createFileRoute("/locations")({
  head: () => ({
    meta: [
      { title: "Locations — FleetManager AI" },
      {
        name: "description",
        content:
          "Suivi de toutes les locations courte et longue durée : loueur, agence, conducteur, coût mensuel et date de restitution.",
      },
      { property: "og:title", content: "Locations — FleetManager AI" },
      {
        property: "og:description",
        content: "Toutes les locations de la flotte, avec échéances de restitution et coûts mensuels.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RentalsPage,
});

function RentalsPage() {
  const { rentals, agencies, agencyCode, addRental, toggleRentalArchive } = useFleet();
  const [showArchived, setShowArchived] = useState(false);

  const rows = rentals.filter((r) => (showArchived ? r.archived : !r.archived));
  const active = rentals.filter((r) => !r.archived);
  const monthly = active.reduce((sum, r) => sum + r.monthlyCost, 0);

  return (
    <>
      <PageHeader
        title="Locations"
        subtitle={`${active.length} contrats actifs · ${currency(monthly)} / mois`}
        actions={
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                exportCsv(
                  "locations",
                  rows.map((r) => ({
                    Contrat: r.id,
                    Immatriculation: r.plate,
                    Véhicule: `${r.brand} ${r.model}`,
                    Catégorie: r.category,
                    Loueur: r.supplier,
                    Agence: agencyCode(r.agencyId),
                    Conducteur: r.driverName ?? "",
                    Début: r.start,
                    Fin: r.end,
                    "Coût mensuel": r.monthlyCost,
                    Statut: statusLabel[r.status],
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
              triggerLabel="Nouvelle location"
              title="Nouvelle location"
              description="Enregistrez un contrat de location courte ou longue durée."
              fields={[
                { key: "plate", label: "Immatriculation", required: true, placeholder: "GJ-410-WB" },
                { key: "brand", label: "Marque", required: true },
                { key: "model", label: "Modèle", required: true },
                {
                  key: "category",
                  label: "Catégorie",
                  type: "select",
                  options: [
                    { value: "VP", label: "VP — véhicule particulier" },
                    { value: "VU", label: "VU — utilitaire" },
                    { value: "2ROUES", label: "2 roues" },
                  ],
                },
                { key: "supplier", label: "Loueur", required: true, placeholder: "Ayvens" },
                {
                  key: "agencyId",
                  label: "Agence",
                  type: "select",
                  options: agencies.map((a) => ({ value: a.id, label: a.name })),
                },
                { key: "driverName", label: "Conducteur", placeholder: "Nom du conducteur" },
                { key: "start", label: "Début", type: "date", required: true },
                { key: "end", label: "Fin", type: "date", required: true },
                { key: "monthlyCost", label: "Coût mensuel (€)", type: "number", required: true },
                {
                  key: "status",
                  label: "Statut",
                  type: "select",
                  options: [
                    { value: "en_cours", label: "En cours" },
                    { value: "a_restituer", label: "À restituer" },
                    { value: "terminee", label: "Terminée" },
                  ],
                },
              ]}
              onSubmit={(values) => {
                const rental = addRental({
                  plate: values["plate"]!.toUpperCase(),
                  brand: values["brand"]!,
                  model: values["model"]!,
                  category: (values["category"] ?? "VP") as VehicleCategory,
                  supplier: values["supplier"]!,
                  agencyId: values["agencyId"]!,
                  driverName: values["driverName"]?.trim() ? values["driverName"]! : null,
                  start: values["start"]!,
                  end: values["end"]!,
                  monthlyCost: Number(values["monthlyCost"] ?? 0),
                  status: (values["status"] ?? "en_cours") as "en_cours" | "a_restituer" | "terminee",
                });
                toast.success(`Location ${rental.id} enregistrée`);
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
                  <TableHead>Véhicule</TableHead>
                  <TableHead>Immat.</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Loueur</TableHead>
                  <TableHead>Agence</TableHead>
                  <TableHead>Conducteur</TableHead>
                  <TableHead>Période</TableHead>
                  <TableHead className="text-right">Coût / mois</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((rental) => (
                  <TableRow key={rental.id}>
                    <TableCell className="font-medium">
                      {rental.brand} {rental.model}
                    </TableCell>
                    <TableCell className="tabular">{rental.plate}</TableCell>
                    <TableCell>{rental.category}</TableCell>
                    <TableCell>{rental.supplier}</TableCell>
                    <TableCell>{agencyCode(rental.agencyId)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {rental.driverName ?? "Non affecté"}
                    </TableCell>
                    <TableCell className="tabular text-xs">
                      {shortDate(rental.start)} → {shortDate(rental.end)}
                    </TableCell>
                    <TableCell className="tabular text-right">{currency(rental.monthlyCost)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{statusLabel[rental.status]}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          toggleRentalArchive(rental.id);
                          toast.success(rental.archived ? "Location réactivée" : "Location archivée");
                        }}
                      >
                        {rental.archived ? <ArchiveRestore /> : <Archive />}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="py-10 text-center text-sm text-muted-foreground">
                      Aucune location {showArchived ? "archivée" : "active"}.
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
