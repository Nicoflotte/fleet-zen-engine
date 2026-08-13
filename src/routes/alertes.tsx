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
import { shortDate } from "@/lib/fleet-data";
import { alertKindLabels, alertLevelLabels, alertTone, buildAlerts } from "@/lib/fleet-alerts";
import { useFleet } from "@/lib/fleet-store";

export const Route = createFileRoute("/alertes")({
  validateSearch: (search: Record<string, unknown>): { entity: string } => ({
    entity: typeof search["entity"] === "string" && search["entity"] ? search["entity"] : "all",
  }),
  head: () => ({
    meta: [
      { title: "Alertes prioritaires — FleetManager AI" },
      {
        name: "description",
        content:
          "Contrôles techniques, contrôles pollution, fins de garantie, fins de crédit-bail et permis à revalider : à effectuer et en cours.",
      },
      { property: "og:title", content: "Alertes prioritaires — FleetManager AI" },
      {
        property: "og:description",
        content: "Toutes les échéances de maintenance et de contrats de la flotte, triées par criticité.",
      },
    ],
  }),
  component: AlertsPage,
});

function AlertsPage() {
  const { entity } = Route.useSearch();
  const { vehicles, drivers, leases, entityIdOfAgency, agencyCode } = useFleet();

  const alerts = buildAlerts({ vehicles, drivers, leases, entityIdOfAgency }).filter(
    (alert) => entity === "all" || alert.entityId === entity,
  );
  const todo = alerts.filter((a) => !a.inProgress);
  const inProgress = alerts.filter((a) => a.inProgress);

  return (
    <>
      <PageHeader
        title="Alertes prioritaires"
        subtitle={`${todo.length} à effectuer · ${inProgress.length} en cours`}
      />
      <main className="flex-1 space-y-6 px-4 py-6 md:px-8">
        <AlertTable title="À effectuer" rows={todo} agencyCode={agencyCode} />
        <AlertTable title="En cours" rows={inProgress} agencyCode={agencyCode} />
      </main>
    </>
  );
}

function AlertTable({
  title,
  rows,
  agencyCode,
}: {
  title: string;
  rows: ReturnType<typeof buildAlerts>;
  agencyCode: (id: string) => string;
}) {
  return (
    <section className="panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <h2 className="text-sm font-semibold">{title}</h2>
        <span className="text-xs text-muted-foreground">{rows.length} alerte(s)</span>
      </div>
      {rows.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-muted-foreground">Rien à signaler.</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Alerte</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Cible</TableHead>
                <TableHead>Agence</TableHead>
                <TableHead>Échéance</TableHead>
                <TableHead>Criticité</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((alert) => (
                <TableRow key={alert.id}>
                  <TableCell className="font-medium">{alert.label}</TableCell>
                  <TableCell className="text-muted-foreground">{alertKindLabels[alert.kind]}</TableCell>
                  <TableCell className="tabular">{alert.target}</TableCell>
                  <TableCell>{alert.agencyId ? agencyCode(alert.agencyId) : "—"}</TableCell>
                  <TableCell className="tabular">
                    {shortDate(alert.dueDate)}
                    {alert.days !== null && (
                      <span className="block text-xs text-muted-foreground">
                        {alert.days >= 0 ? `dans ${alert.days} j` : `retard ${Math.abs(alert.days)} j`}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={alertTone[alert.level]}>
                      {alertLevelLabels[alert.level]}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  );
}
