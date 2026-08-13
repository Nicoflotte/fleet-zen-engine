import { useMemo } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight, Car, Check, Receipt, Sparkle, Users, Wrench } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  aiSuggestions,
  availableYears,
  currency,
  expenseTypeLabels,
  monthLabels,
  number,
  shortDate,
  type ExpenseType,
} from "@/lib/fleet-data";
import { alertTone, buildAlerts } from "@/lib/fleet-alerts";
import { useFleet } from "@/lib/fleet-store";

type DashboardSearch = { month: number; year: number; entity: string };

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): DashboardSearch => ({
    month: Number(search.month) >= 1 && Number(search.month) <= 12 ? Number(search.month) : 8,
    year: availableYears.includes(Number(search.year)) ? Number(search.year) : 2026,
    entity: typeof search.entity === "string" && search.entity ? search.entity : "all",
  }),
  head: () => ({
    meta: [
      { title: "Tableau de bord flotte — FleetManager AI" },
      {
        name: "description",
        content:
          "Vision temps réel de la flotte par mois, année et société : KPI cliquables, alertes prioritaires, dépenses et recommandations IA.",
      },
      { property: "og:title", content: "Tableau de bord flotte — FleetManager AI" },
      {
        property: "og:description",
        content: "KPI par société et par mois, alertes et recommandations IA pour piloter votre flotte.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { month, year, entity } = Route.useSearch();
  const navigate = useNavigate({ from: "/" });
  const {
    entities,
    vehicles,
    drivers,
    rentals,
    leases,
    expenses,
    claims,
    fines,
    insurancePolicies,
    entityIdOfAgency,
  } = useFleet();

  const monthKey = `${year}-${String(month).padStart(2, "0")}`;
  const inEntity = (entityId: string) => entity === "all" || entityId === entity;

  const activeVehicles = useMemo(
    () => vehicles.filter((v) => !v.archived && inEntity(entityIdOfAgency(v.agencyId))),
    [vehicles, entity, entityIdOfAgency],
  );

  const activeDrivers = useMemo(
    () => drivers.filter((d) => !d.archived && inEntity(entityIdOfAgency(d.agencyId))),
    [drivers, entity, entityIdOfAgency],
  );

  const alerts = useMemo(
    () =>
      buildAlerts({ vehicles, drivers, leases, entityIdOfAgency }).filter((alert) =>
        inEntity(alert.entityId),
      ),
    [vehicles, drivers, leases, entityIdOfAgency, entity],
  );

  const monthExpenses = useMemo(
    () => expenses.filter((e) => e.month === monthKey && inEntity(e.entityId)),
    [expenses, monthKey, entity],
  );

  const previousMonthKey = month === 1 ? `${year - 1}-12` : `${year}-${String(month - 1).padStart(2, "0")}`;
  const previousTotal = expenses
    .filter((e) => e.month === previousMonthKey && inEntity(e.entityId))
    .reduce((sum, e) => sum + e.amount, 0);

  const totalExpenses = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const delta = previousTotal ? ((totalExpenses - previousTotal) / previousTotal) * 100 : 0;

  const byType = (Object.keys(expenseTypeLabels) as ExpenseType[]).map((type) => {
    const amount = monthExpenses.filter((e) => e.type === type).reduce((sum, e) => sum + e.amount, 0);
    return { type, amount, share: totalExpenses ? Math.round((amount / totalExpenses) * 100) : 0 };
  });

  const maintenanceAlerts = alerts.filter(
    (a) => a.owner === "Maintenance" || a.kind === "controle_technique" || a.kind === "controle_pollution",
  );
  const rentalVp = rentals.filter(
    (r) => !r.archived && r.category === "VP" && inEntity(entityIdOfAgency(r.agencyId)),
  );
  const openClaims = claims.filter((c) => !c.archived && c.status !== "clos" && inEntity(entityIdOfAgency(c.agencyId)));
  const finesToDesignate = fines.filter((f) => !f.archived && f.status === "a_designer");
  const policies = insurancePolicies.filter((p) => !p.archived && inEntity(p.entityId));

  const kpiCards = [
    {
      label: "Véhicules du parc",
      value: number(activeVehicles.length),
      hint: `${activeVehicles.filter((v) => v.status === "en_service").length} en service · hors locations`,
      icon: Car,
      to: "/vehicules" as const,
    },
    {
      label: "Maintenance & contrôles",
      value: number(maintenanceAlerts.length),
      hint: `${maintenanceAlerts.filter((a) => a.inProgress).length} en cours · ${maintenanceAlerts.filter((a) => !a.inProgress).length} à effectuer`,
      icon: Wrench,
      to: "/alertes" as const,
    },
    {
      label: "Conducteurs",
      value: number(activeDrivers.length),
      hint: `${activeDrivers.filter((d) => d.vehicleId).length} avec véhicule affecté`,
      icon: Users,
      to: "/conducteurs" as const,
    },
    {
      label: "Dépenses du mois",
      value: currency(totalExpenses),
      hint: `${delta >= 0 ? "+" : ""}${delta.toFixed(1)} % vs M-1`,
      icon: Receipt,
      to: "/depenses" as const,
    },
  ];

  const setSearch = (patch: Partial<DashboardSearch>) =>
    navigate({ search: (prev) => ({ ...prev, ...patch }) });

  return (
    <>
      <PageHeader
        title="Tableau de bord flotte"
        subtitle={`${monthLabels[month - 1]} ${year} · ${
          entity === "all" ? "toutes les sociétés" : entities.find((e) => e.id === entity)?.name
        }`}
        actions={
          <>
            <Select value={String(month)} onValueChange={(value) => setSearch({ month: Number(value) })}>
              <SelectTrigger className="w-36" aria-label="Mois">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {monthLabels.map((label, index) => (
                  <SelectItem key={label} value={String(index + 1)}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={String(year)} onValueChange={(value) => setSearch({ year: Number(value) })}>
              <SelectTrigger className="w-24" aria-label="Année">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableYears.map((item) => (
                  <SelectItem key={item} value={String(item)}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={entity} onValueChange={(value) => setSearch({ entity: value })}>
              <SelectTrigger className="w-52" aria-label="Société">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les sociétés</SelectItem>
                {entities.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.code} — {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        }
      />

      <main className="flex-1 space-y-6 px-4 py-6 md:px-8">
        <section aria-label="Indicateurs clés" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpiCards.map((kpi) => (
            <Link
              key={kpi.label}
              to={kpi.to}
              search={kpi.to === "/depenses" ? { month, year, entity } : { entity }}
              className="panel kpi-sheen group p-5 transition-colors hover:border-accent/50"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{kpi.label}</p>
                <kpi.icon className="size-4 text-accent" />
              </div>
              <p className="text-display tabular mt-3 text-2xl font-semibold">{kpi.value}</p>
              <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                {kpi.hint}
                <ArrowRight className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
              </p>
            </Link>
          ))}
        </section>

        <section aria-label="Indicateurs liés" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MiniCard to="/locations" label="Locations VP en cours" value={number(rentalVp.length)} hint="hors parc véhicules" />
          <MiniCard to="/sinistres" label="Sinistres ouverts" value={number(openClaims.length)} hint="expertise / réparation" />
          <MiniCard to="/contraventions" label="Contraventions à désigner" value={number(finesToDesignate.length)} hint="désignation ANTAI" />
          <MiniCard to="/assurances" label="Contrats d'assurance" value={number(policies.length)} hint={`${currency(policies.reduce((s, p) => s + p.annualPremium, 0))} / an`} />
        </section>

        <div className="grid gap-6 xl:grid-cols-3">
          <section className="panel xl:col-span-2">
            <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold">Recommandations IA</h2>
                <p className="text-xs text-muted-foreground">
                  L'IA propose, vous validez. Aucune action n'est appliquée automatiquement.
                </p>
              </div>
              <Badge variant="secondary" className="gap-1">
                <Sparkle className="size-3" />
                {aiSuggestions.length} à traiter
              </Badge>
            </div>
            <ul className="divide-y divide-border">
              {aiSuggestions.map((suggestion) => (
                <li key={suggestion.title} className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold">{suggestion.title}</h3>
                      <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                        {suggestion.detail}
                      </p>
                    </div>
                    <Badge variant="outline" className="shrink-0 border-accent/40 text-accent">
                      Confiance {Math.round(suggestion.confidence * 100)} %
                    </Badge>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="tabular rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                      Impact estimé : {suggestion.impact}
                    </span>
                    <span className="flex-1" />
                    <Button variant="ghost" size="sm">
                      Ignorer
                    </Button>
                    <Button size="sm">
                      <Check /> Valider
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="panel">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-sm font-semibold">Alertes prioritaires</h2>
              <Button asChild variant="ghost" size="sm">
                <Link to="/alertes" search={{ entity }}>
                  Tout voir <ArrowRight />
                </Link>
              </Button>
            </div>
            <ul className="divide-y divide-border">
              {alerts.slice(0, 7).map((alert) => (
                <li key={alert.id} className="flex items-start gap-3 px-5 py-3.5">
                  <span
                    className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-md border ${alertTone[alert.level]}`}
                  >
                    <AlertTriangle className="size-3.5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm leading-snug">{alert.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {alert.owner} · {alert.dueDate === "—" ? "en cours" : shortDate(alert.dueDate)}
                    </p>
                  </div>
                </li>
              ))}
              {alerts.length === 0 && (
                <li className="px-5 py-8 text-center text-sm text-muted-foreground">
                  Aucune alerte sur ce périmètre.
                </li>
              )}
            </ul>
          </section>
        </div>

        <section className="panel">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold">Dépenses par types</h2>
              <p className="tabular text-xs text-muted-foreground">
                {currency(totalExpenses)} — {monthLabels[month - 1]} {year}
              </p>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link to="/depenses" search={{ month, year, entity }}>
                Ouvrir les dépenses <ArrowRight />
              </Link>
            </Button>
          </div>
          <ul className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3">
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
        </section>
      </main>
    </>
  );
}

function MiniCard({
  to,
  label,
  value,
  hint,
}: {
  to: "/locations" | "/sinistres" | "/contraventions" | "/assurances";
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <Link to={to} className="panel group flex items-center justify-between gap-3 p-4 hover:border-accent/50">
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
        <p className="tabular mt-1 text-lg font-semibold">{value}</p>
        <p className="truncate text-xs text-muted-foreground">{hint}</p>
      </div>
      <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
