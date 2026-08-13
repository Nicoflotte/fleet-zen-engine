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
    ],
  }),
  component: ClaimsPage,
});

function ClaimsPage() {
  const { claims, agencyCode } = useFleet();
  const active = claims.filter((c) => !c.archived);
  const total = active.reduce((sum, c) => sum + c.cost, 0);

  return (
    <>
      <PageHeader
        title="Sinistres"
        subtitle={`${active.length} dossiers en cours · ${currency(total)} de coûts constatés`}
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {active.map((claim) => (
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
                      <Badge variant="outline">{statusLabel[claim.status]}</Badge>
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
