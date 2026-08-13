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
    ],
  }),
  component: LeasesPage,
});

function LeasesPage() {
  const { leases, entityName } = useFleet();
  const active = leases.filter((l) => !l.archived);
  const monthly = active.reduce((sum, l) => sum + l.monthlyRent, 0);

  return (
    <>
      <PageHeader
        title="Crédits-baux & LOA"
        subtitle={`${active.length} contrats · ${currency(monthly)} de loyers mensuels`}
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {active.map((lease) => (
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
