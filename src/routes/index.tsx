import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CircleAlert,
  Sparkle,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  aiSuggestions,
  alerts,
  costBreakdown,
  currency,
  kpis,
  shortDate,
  statusLabels,
  statusTone,
  vehicles,
} from "@/lib/fleet-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard flotte — FleetManager AI" },
      {
        name: "description",
        content:
          "Vision temps réel de la flotte : KPI, alertes prioritaires, coûts et recommandations IA à valider.",
      },
      { property: "og:title", content: "Dashboard flotte — FleetManager AI" },
      {
        property: "og:description",
        content: "KPI, alertes et recommandations IA pour piloter votre flotte au quotidien.",
      },
    ],
  }),
  component: Dashboard,
});

const alertTone = {
  critique: "border-destructive/30 bg-destructive/10 text-destructive",
  eleve: "border-warning/40 bg-warning/15 text-warning-foreground",
  moyen: "border-border bg-muted text-muted-foreground",
} as const;

function Dashboard() {
  const priorityVehicles = vehicles.filter((v) => v.alerts.length > 0).slice(0, 4);
  const totalCost = costBreakdown.reduce((sum, item) => sum + item.amount, 0);

  return (
    <>
      <PageHeader
        title="Dashboard flotte"
        subtitle="Vue consolidée — 182 véhicules, 6 agences"
        actions={
          <>
            <Button variant="outline" size="sm">
              Exporter
            </Button>
            <Button size="sm">Nouvelle action</Button>
          </>
        }
      />

      <main className="flex-1 space-y-6 px-4 py-6 md:px-8">
        <section aria-label="Indicateurs clés" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((kpi) => (
            <article key={kpi.label} className="panel kpi-sheen p-5">
              <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{kpi.label}</p>
              <p className="text-display tabular mt-3 text-2xl font-semibold">{kpi.value}</p>
              <p
                className={`mt-2 flex items-center gap-1.5 text-xs font-medium ${
                  kpi.tone === "positive"
                    ? "text-success"
                    : kpi.tone === "negative"
                      ? "text-destructive"
                      : "text-muted-foreground"
                }`}
              >
                {kpi.tone === "positive" ? (
                  <TrendingDown className="size-3.5" />
                ) : kpi.tone === "negative" ? (
                  <TrendingUp className="size-3.5" />
                ) : (
                  <Sparkle className="size-3.5" />
                )}
                {kpi.delta}
              </p>
            </article>
          ))}
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
                    <Button variant="outline" size="sm">
                      Voir l'analyse
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
              <Badge variant="outline" className="gap-1 border-destructive/30 text-destructive">
                <CircleAlert className="size-3" /> 1 critique
              </Badge>
            </div>
            <ul className="divide-y divide-border">
              {alerts.map((alert) => (
                <li key={alert.label} className="flex items-start gap-3 px-5 py-3.5">
                  <span
                    className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-md border ${alertTone[alert.level]}`}
                  >
                    <AlertTriangle className="size-3.5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm leading-snug">{alert.label}</p>
                    <p className="text-xs text-muted-foreground">{alert.owner}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <section className="panel xl:col-span-1">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-sm font-semibold">Répartition des coûts</h2>
              <p className="tabular text-xs text-muted-foreground">
                {currency(totalCost)} sur le mois en cours
              </p>
            </div>
            <ul className="space-y-4 p-5">
              {costBreakdown.map((item) => (
                <li key={item.label}>
                  <div className="flex items-baseline justify-between gap-2 text-sm">
                    <span className="truncate">{item.label}</span>
                    <span className="tabular font-medium">{currency(item.amount)}</span>
                  </div>
                  <Progress value={item.share} className="mt-2 h-1.5" />
                </li>
              ))}
            </ul>
          </section>

          <section className="panel xl:col-span-2">
            <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
              <h2 className="text-sm font-semibold">Véhicules à traiter en priorité</h2>
              <Button asChild variant="ghost" size="sm">
                <Link to="/vehicules">
                  Tout le parc <ArrowRight />
                </Link>
              </Button>
            </div>
            <ul className="divide-y divide-border">
              {priorityVehicles.map((vehicle) => (
                <li key={vehicle.id}>
                  <Link
                    to="/vehicules/$vehicleId"
                    params={{ vehicleId: vehicle.id }}
                    className="flex flex-wrap items-center gap-3 px-5 py-4 transition-colors hover:bg-muted/60"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">
                        {vehicle.brand} {vehicle.model}{" "}
                        <span className="tabular font-normal text-muted-foreground">
                          · {vehicle.plate}
                        </span>
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{vehicle.alerts[0]}</p>
                    </div>
                    <Badge variant="outline" className={statusTone[vehicle.status]}>
                      {statusLabels[vehicle.status]}
                    </Badge>
                    <span className="tabular hidden text-xs text-muted-foreground sm:inline">
                      CT {shortDate(vehicle.nextControl)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </>
  );
}
