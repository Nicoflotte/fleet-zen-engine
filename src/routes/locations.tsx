import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { currency, shortDate } from "@/lib/fleet-data";
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
    ],
  }),
  component: RentalsPage,
});

function RentalsPage() {
  const { rentals, agencyCode } = useFleet();
  const active = rentals.filter((r) => !r.archived);
  const monthly = active.reduce((sum, r) => sum + r.monthlyCost, 0);

  return (
    <>
      <PageHeader
        title="Locations"
        subtitle={`${active.length} contrats actifs · ${currency(monthly)} / mois`}
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {active.map((rental) => (
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
      </main>
    </>
  );
}
