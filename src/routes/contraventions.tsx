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
    ],
  }),
  component: FinesPage,
});

function FinesPage() {
  const { fines, agencyCode } = useFleet();
  const active = fines.filter((f) => !f.archived);
  const toDesignate = active.filter((f) => f.status === "a_designer").length;

  return (
    <>
      <PageHeader
        title="Contraventions"
        subtitle={`${active.length} avis · ${toDesignate} à désigner · ${currency(
          active.reduce((sum, f) => sum + f.amount, 0),
        )}`}
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
                  <TableHead>Conducteur</TableHead>
                  <TableHead>Agence</TableHead>
                  <TableHead>Nature</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {active.map((fine) => (
                  <TableRow key={fine.id}>
                    <TableCell className="tabular font-medium">{fine.antaiReference}</TableCell>
                    <TableCell className="tabular">{shortDate(fine.date)}</TableCell>
                    <TableCell className="tabular">{fine.plate}</TableCell>
                    <TableCell className="text-muted-foreground">{fine.driverName ?? "—"}</TableCell>
                    <TableCell>{agencyCode(fine.agencyId)}</TableCell>
                    <TableCell>{fine.nature}</TableCell>
                    <TableCell className="tabular text-right">{currency(fine.amount)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{statusLabel[fine.status]}</Badge>
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
