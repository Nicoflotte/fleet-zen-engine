import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/page-header";
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

export const Route = createFileRoute("/assurances")({
  head: () => ({
    meta: [
      { title: "Assurances — FleetManager AI" },
      {
        name: "description",
        content:
          "Polices d'assurance flotte par société : assureur, périmètre couvert, nombre de véhicules, prime annuelle et échéance de renouvellement.",
      },
      { property: "og:title", content: "Assurances — FleetManager AI" },
      {
        property: "og:description",
        content: "Polices, primes annuelles et renouvellements d'assurance de la flotte.",
      },
    ],
  }),
  component: InsurancePage,
});

function InsurancePage() {
  const { insurancePolicies, entityName } = useFleet();
  const active = insurancePolicies.filter((p) => !p.archived);
  const premium = active.reduce((sum, p) => sum + p.annualPremium, 0);

  return (
    <>
      <PageHeader
        title="Assurances"
        subtitle={`${active.length} polices · ${currency(premium)} de primes annuelles`}
      />
      <main className="flex-1 px-4 py-6 md:px-8">
        <section className="panel overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Police</TableHead>
                  <TableHead>Assureur</TableHead>
                  <TableHead>Société</TableHead>
                  <TableHead>Périmètre</TableHead>
                  <TableHead className="text-right">Véhicules</TableHead>
                  <TableHead className="text-right">Prime annuelle</TableHead>
                  <TableHead>Renouvellement</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {active.map((policy) => (
                  <TableRow key={policy.id}>
                    <TableCell className="tabular font-medium">{policy.policyNumber}</TableCell>
                    <TableCell>{policy.insurer}</TableCell>
                    <TableCell>{entityName(policy.entityId)}</TableCell>
                    <TableCell className="text-muted-foreground">{policy.scope}</TableCell>
                    <TableCell className="tabular text-right">{policy.vehicles}</TableCell>
                    <TableCell className="tabular text-right">{currency(policy.annualPremium)}</TableCell>
                    <TableCell className="tabular">{shortDate(policy.renewal)}</TableCell>
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
