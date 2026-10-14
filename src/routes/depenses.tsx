import { createFileRoute } from "@tanstack/react-router";

import { FuelInvoiceDialog } from "@/components/fuel-invoice-dialog";
import { PageHeader } from "@/components/page-header";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  availableYears,
  currency,
  expenseTypeLabels,
  monthLabels,
  type ExpenseType,
} from "@/lib/fleet-data";
import { useFleet } from "@/lib/fleet-store";

export const Route = createFileRoute("/depenses")({
  validateSearch: (search: Record<string, unknown>): { month: number; year: number; entity: string } => ({
    month: Number(search["month"]) >= 1 && Number(search["month"]) <= 12 ? Number(search["month"]) : 8,
    year: availableYears.includes(Number(search["year"])) ? Number(search["year"]) : 2026,
    entity: typeof search["entity"] === "string" && search["entity"] ? search["entity"] : "all",
  }),
  head: () => ({
    meta: [
      { title: "Dépenses par types — FleetManager AI" },
      {
        name: "description",
        content:
          "Dépenses de flotte par types : carburant, entretien, pneumatiques, péages et loyers de crédits-baux, par société et par mois.",
      },
      { property: "og:title", content: "Dépenses par types — FleetManager AI" },
      {
        property: "og:description",
        content: "Analyse des dépenses de flotte par type, société et période.",
      },
    ],
  }),
  component: ExpensesPage,
});

function ExpensesPage() {
  const { month, year, entity } = Route.useSearch();
  const { expenses, entities } = useFleet();

  const monthKey = `${year}-${String(month).padStart(2, "0")}`;
  const rows = expenses.filter((e) => e.month === monthKey && (entity === "all" || e.entityId === entity));
  const total = rows.reduce((sum, e) => sum + e.amount, 0);

  const byType = (Object.keys(expenseTypeLabels) as ExpenseType[]).map((type) => {
    const amount = rows.filter((e) => e.type === type).reduce((sum, e) => sum + e.amount, 0);
    return { type, amount, share: total ? Math.round((amount / total) * 100) : 0 };
  });

  const byEntity = entities
    .map((item) => ({
      entity: item,
      amount: rows.filter((e) => e.entityId === item.id).reduce((sum, e) => sum + e.amount, 0),
    }))
    .filter((row) => row.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  return (
    <>
      <PageHeader
        title="Dépenses par types"
        subtitle={`${currency(total)} — ${monthLabels[month - 1]} ${year} · ${
          entity === "all" ? "toutes les sociétés" : entities.find((e) => e.id === entity)?.name
        }`}
        actions={<FuelInvoiceDialog />}
      />
      <main className="flex-1 space-y-6 px-4 py-6 md:px-8">
        <section className="panel p-5">
          <h2 className="text-sm font-semibold">Répartition par type</h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {byType.map((item) => (
              <li key={item.type}>
                <div className="flex items-baseline justify-between gap-2 text-sm">
                  <span className="truncate">{expenseTypeLabels[item.type]}</span>
                  <span className="tabular font-medium">{currency(item.amount)}</span>
                </div>
                <Progress value={item.share} className="mt-2 h-1.5" />
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted-foreground">
            Assurances, locations, sinistres et contraventions sont suivis dans leurs modules dédiés ; les
            échéanciers de crédits-baux et LOA sont comptabilisés ici en « Loyers ».
          </p>
        </section>

        <section className="panel overflow-hidden">
          <div className="border-b border-border px-5 py-3">
            <h2 className="text-sm font-semibold">Dépenses par société</h2>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Société</TableHead>
                  {(Object.keys(expenseTypeLabels) as ExpenseType[]).map((type) => (
                    <TableHead key={type} className="text-right">
                      {expenseTypeLabels[type]}
                    </TableHead>
                  ))}
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {byEntity.map(({ entity: item, amount }) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    {(Object.keys(expenseTypeLabels) as ExpenseType[]).map((type) => (
                      <TableCell key={type} className="tabular text-right">
                        {currency(
                          rows
                            .filter((e) => e.entityId === item.id && e.type === type)
                            .reduce((sum, e) => sum + e.amount, 0),
                        )}
                      </TableCell>
                    ))}
                    <TableCell className="tabular text-right font-semibold">{currency(amount)}</TableCell>
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
