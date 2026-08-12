import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarClock,
  FileText,
  Fuel,
  Gauge,
  MapPin,
  Pencil,
  Sparkle,
  User,
  Wrench,
} from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  currency,
  number,
  shortDate,
  statusLabels,
  statusTone,
  vehicles,
} from "@/lib/fleet-data";
import { equipmentLabels, useFleet } from "@/lib/fleet-store";

export const Route = createFileRoute("/vehicules/$vehicleId")({
  loader: ({ params }) => {
    const vehicle = vehicles.find((item) => item.id === params.vehicleId);
    if (!vehicle) throw notFound();
    return { vehicle };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Véhicule indisponible — FleetManager AI" }, { name: "robots", content: "noindex" }],
      };
    }
    const { vehicle } = loaderData;
    const title = `${vehicle.brand} ${vehicle.model} (${vehicle.plate}) — FleetManager AI`;
    const description = `Fiche véhicule ${vehicle.plate} : statut, affectation, coûts, échéances et documents.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: VehicleDetail,
});

const historyEntries = [
  {
    date: "2026-08-04",
    user: "Nicolas Raclet",
    action: "Statut modifié",
    from: "En service",
    to: "En atelier",
  },
  {
    date: "2026-07-28",
    user: "IA — analyse documentaire",
    action: "Facture maintenance classée",
    from: "Non classé",
    to: "Maintenance / 2026",
  },
  {
    date: "2026-06-12",
    user: "Sophie Lemaire",
    action: "Relevé kilométrique",
    from: "88 400 km",
    to: "91 455 km",
  },
];

const documents = [
  { name: "Carte grise", status: "Validé", date: "2024-03-11" },
  { name: "Contrat LLD", status: "Validé", date: "2024-03-11" },
  { name: "Constat sinistre", status: "À valider", date: "2026-07-24" },
  { name: "Facture pneumatiques", status: "Classé par l'IA", date: "2026-06-30" },
];

function VehicleDetail() {
  const { vehicle: seed } = Route.useLoaderData();
  const { vehicles, drivers, equipments } = useFleet();
  const vehicle = vehicles.find((item) => item.id === seed.id) ?? seed;
  const linkedDriver = drivers.find((d) => d.vehicleId === vehicle.id) ?? null;
  const linkedEquipments = equipments.filter((e) => e.vehicleId === vehicle.id);

  const facts = [
    { icon: MapPin, label: "Agence", value: vehicle.agency },
    { icon: User, label: "Conducteur", value: vehicle.driver ?? "Non affecté" },
    { icon: Gauge, label: "Kilométrage", value: `${number(vehicle.km)} km` },
    { icon: Fuel, label: "Énergie", value: vehicle.energy },
    { icon: CalendarClock, label: "Fin de contrat", value: shortDate(vehicle.contractEnd) },
    { icon: Wrench, label: "Prochain contrôle", value: shortDate(vehicle.nextControl) },
  ];

  return (
    <>
      <PageHeader
        breadcrumb={
          <Link to="/vehicules" className="inline-flex items-center gap-1 hover:text-foreground">
            <ArrowLeft className="size-3" /> Parc véhicules
          </Link>
        }
        title={`${vehicle.brand} ${vehicle.model}`}
        subtitle={`${vehicle.plate} · ${vehicle.id} · ${vehicle.category}`}
        actions={
          <>
            <Badge variant="outline" className={statusTone[vehicle.status]}>
              {statusLabels[vehicle.status]}
            </Badge>
            <Button variant="outline" size="sm">
              <FileText /> Documents
            </Button>
            <Button size="sm">
              <Pencil /> Modifier
            </Button>
          </>
        }
      />

      <main className="flex-1 space-y-6 px-4 py-6 md:px-8">
        {vehicle.alerts.length > 0 && (
          <section className="panel border-warning/40 bg-warning/10 p-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <AlertTriangle className="size-4" /> {vehicle.alerts.length} point
              {vehicle.alerts.length > 1 ? "s" : ""} d'attention
            </h2>
            <ul className="mt-2 space-y-1 text-sm text-warning-foreground">
              {vehicle.alerts.map((alert) => (
                <li key={alert}>• {alert}</li>
              ))}
            </ul>
          </section>
        )}

        <section className="panel space-y-2 p-5">
          <p className="text-sm font-semibold">Affectation liée</p>
          <p className="text-sm text-muted-foreground">
            Conducteur :{" "}
            {linkedDriver ? (
              <Link
                to="/conducteurs/$driverId"
                params={{ driverId: linkedDriver.id }}
                className="font-medium text-foreground hover:text-accent"
              >
                {linkedDriver.firstName} {linkedDriver.lastName}
              </Link>
            ) : (
              "non affecté"
            )}
          </p>
          <p className="text-sm text-muted-foreground">
            Équipements :{" "}
            {linkedEquipments.length
              ? linkedEquipments.map((e) => `${equipmentLabels[e.type]} ${e.reference}`).join(" · ")
              : "aucun"}
          </p>
          <Button variant="outline" size="sm" asChild>
            <Link to="/affectations">Gérer l'affectation</Link>
          </Button>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {facts.map((fact) => (
            <article key={fact.label} className="panel flex items-center gap-3 p-4">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-secondary text-secondary-foreground">
                <fact.icon className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.1em] text-muted-foreground">{fact.label}</p>
                <p className="tabular truncate text-sm font-medium">{fact.value}</p>
              </div>
            </article>
          ))}
        </section>

        <Tabs defaultValue="couts">
          <TabsList>
            <TabsTrigger value="couts">Coûts</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="historique">Historique</TabsTrigger>
            <TabsTrigger value="ia">Analyse IA</TabsTrigger>
          </TabsList>

          <TabsContent value="couts" className="mt-4">
            <div className="panel divide-y divide-border">
              {[
                { label: "Loyer mensuel", value: vehicle.monthlyCost },
                { label: "Carburant / énergie (mois)", value: Math.round(vehicle.monthlyCost * 0.32) },
                { label: "Maintenance (12 mois)", value: Math.round(vehicle.monthlyCost * 2.1) },
                { label: "Pneumatiques (12 mois)", value: Math.round(vehicle.monthlyCost * 0.7) },
              ].map((line) => (
                <div key={line.label} className="flex items-center justify-between px-5 py-3.5 text-sm">
                  <span>{line.label}</span>
                  <span className="tabular font-medium">{line.value ? currency(line.value) : "—"}</span>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="documents" className="mt-4">
            <ul className="panel divide-y divide-border">
              {documents.map((doc) => (
                <li key={doc.name} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                  <FileText className="size-4 text-muted-foreground" />
                  <span className="flex-1 text-sm">{doc.name}</span>
                  <Badge
                    variant="outline"
                    className={
                      doc.status === "À valider"
                        ? "border-warning/40 bg-warning/15 text-warning-foreground"
                        : "border-border text-muted-foreground"
                    }
                  >
                    {doc.status}
                  </Badge>
                  <span className="tabular text-xs text-muted-foreground">{shortDate(doc.date)}</span>
                </li>
              ))}
            </ul>
          </TabsContent>

          <TabsContent value="historique" className="mt-4">
            <ol className="panel divide-y divide-border">
              {historyEntries.map((entry) => (
                <li key={entry.date + entry.action} className="px-5 py-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-sm font-medium">{entry.action}</p>
                    <p className="tabular text-xs text-muted-foreground">
                      {shortDate(entry.date)} · {entry.user}
                    </p>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {entry.from} <span aria-hidden>→</span> {entry.to}
                  </p>
                </li>
              ))}
            </ol>
          </TabsContent>

          <TabsContent value="ia" className="mt-4">
            <section className="panel p-5">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <Sparkle className="size-4 text-accent" /> Lecture IA du véhicule
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                Le coût d'usage de ce véhicule est {vehicle.km > 150000 ? "supérieur" : "conforme"} à la
                moyenne de sa catégorie. {vehicle.alerts.length > 0
                  ? "Des échéances proches nécessitent une décision de votre part."
                  : "Aucune anomalie détectée sur les 6 derniers mois."}
              </p>
              <Separator className="my-4" />
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm">
                  Demander une explication
                </Button>
                <Button size="sm">Générer une proposition</Button>
              </div>
            </section>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
