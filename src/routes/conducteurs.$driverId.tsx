import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowLeft,
  BadgeEuro,
  CalendarClock,
  CreditCard,
  IdCard,
  Mail,
  MapPin,
  Phone,
  ScanLine,
  Car,
} from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { shortDate } from "@/lib/fleet-data";
import {
  driverStatusLabels,
  driverStatusTone,
  equipmentLabels,
  useFleet,
} from "@/lib/fleet-store";

export const Route = createFileRoute("/conducteurs/$driverId")({
  head: () => ({
    meta: [
      { title: "Fiche conducteur — FleetManager AI" },
      {
        name: "description",
        content:
          "Fiche conducteur : identité, permis de conduire, adresse postale, véhicule et équipements affectés.",
      },
      { property: "og:title", content: "Fiche conducteur — FleetManager AI" },
      {
        property: "og:description",
        content: "Consultez et pilotez les informations d'un conducteur de la flotte.",
      },
    ],
  }),
  component: DriverDetail,
});

function DriverDetail() {
  const { driverId } = Route.useParams();
  const { drivers, equipments, history, agencyName, vehicleLabel, agencies } = useFleet();
  const driver = drivers.find((item) => item.id === driverId);

  if (!driver) {
    return (
      <>
        <PageHeader title="Conducteur introuvable" subtitle={driverId} />
        <main className="flex-1 px-4 py-10 md:px-8">
          <p className="text-sm text-muted-foreground">
            Cette fiche n'existe pas ou a été supprimée.{" "}
            <Link to="/conducteurs" className="underline">
              Revenir à la liste
            </Link>
          </p>
        </main>
      </>
    );
  }

  const agency = agencies.find((a) => a.id === driver.agencyId);
  const driverEquipments = equipments.filter((e) => e.driverId === driver.id);
  const driverHistory = history.filter(
    (entry) =>
      entry.detail.includes(driver.id) ||
      entry.detail.includes(`${driver.firstName} ${driver.lastName}`) ||
      (driver.vehicleId ? entry.detail.includes(driver.vehicleId) : false),
  );

  const facts = [
    { icon: MapPin, label: "Agence", value: agencyName(driver.agencyId) },
    { icon: Car, label: "Véhicule affecté", value: vehicleLabel(driver.vehicleId) },
    { icon: Phone, label: "Téléphone", value: driver.phone || "—" },
    { icon: Mail, label: "E-mail", value: driver.email || "—" },
    { icon: IdCard, label: "Permis", value: `${driver.licenseNumber} · ${driver.licenseCategories}` },
    { icon: CalendarClock, label: "Validité permis", value: shortDate(driver.licenseExpiry) },
  ];

  return (
    <>
      <PageHeader
        title={`${driver.firstName} ${driver.lastName}`}
        subtitle={`${driver.id} · ${agencyName(driver.agencyId)}`}
        breadcrumb={
          <Link to="/conducteurs" className="inline-flex items-center gap-1 hover:text-foreground">
            <ArrowLeft className="size-3" /> Conducteurs
          </Link>
        }
        actions={
          <>
            <Badge variant="outline" className={driverStatusTone[driver.status]}>
              {driverStatusLabels[driver.status]}
            </Badge>
            <Button size="sm" variant="outline" asChild>
              <Link to="/affectations">Gérer l'affectation</Link>
            </Button>
          </>
        }
      />

      <main className="flex-1 space-y-5 px-4 py-6 md:px-8">
        <section className="panel grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
          {facts.map((fact) => (
            <div key={fact.label} className="flex items-start gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
                <fact.icon className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{fact.label}</p>
                <p className="truncate text-sm font-medium">{fact.value}</p>
              </div>
            </div>
          ))}
        </section>

        <Tabs defaultValue="identite">
          <TabsList>
            <TabsTrigger value="identite">Identité & adresse</TabsTrigger>
            <TabsTrigger value="permis">Permis</TabsTrigger>
            <TabsTrigger value="equipements">Équipements</TabsTrigger>
            <TabsTrigger value="historique">Historique</TabsTrigger>
          </TabsList>

          <TabsContent value="identite" className="pt-4">
            <div className="panel grid gap-6 p-5 md:grid-cols-2">
              <div className="space-y-3">
                <p className="text-sm font-semibold">Identité</p>
                <Row label="Prénom" value={driver.firstName} />
                <Row label="Nom" value={driver.lastName} />
                <Row label="Date de naissance" value={shortDate(driver.birthDate)} />
                <Row
                  label="Origine de la fiche"
                  value={driver.source === "ocr_permis" ? "Reconnaissance du permis" : "Saisie manuelle"}
                />
              </div>
              <div className="space-y-3">
                <p className="text-sm font-semibold">Adresse postale</p>
                <Row label="Rue" value={driver.street || "—"} />
                <Row label="Code postal" value={driver.postalCode || "—"} />
                <Row label="Ville" value={driver.city || "—"} />
                <Row label="Pays" value={driver.country || "—"} />
                <Separator />
                <p className="text-xs text-muted-foreground">
                  Agence de rattachement : {agency?.name} — {agency?.postalCode} {agency?.city}
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="permis" className="pt-4">
            <div className="panel space-y-3 p-5">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <ScanLine className="size-4 text-accent" /> Données du permis de conduire
              </div>
              <Row label="Numéro" value={driver.licenseNumber} />
              <Row label="Catégories" value={driver.licenseCategories} />
              <Row label="Délivré le" value={shortDate(driver.licenseIssuedAt)} />
              <Row label="Valide jusqu'au" value={shortDate(driver.licenseExpiry)} />
              <p className="text-xs text-muted-foreground">
                Les champs issus de la reconnaissance documentaire restent modifiables : l'IA propose,
                le gestionnaire valide.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="equipements" className="pt-4">
            <div className="panel divide-y divide-border p-0">
              {driverEquipments.length === 0 ? (
                <p className="p-5 text-sm text-muted-foreground">
                  Aucun équipement rattaché. Utilisez le module Affectations pour attribuer une carte
                  DKV, TotalEnergies ou un badge Ulys.
                </p>
              ) : (
                driverEquipments.map((equipment) => (
                  <div key={equipment.id} className="flex items-center justify-between gap-3 p-4">
                    <div className="flex items-center gap-3">
                      <span className="grid size-9 place-items-center rounded-lg bg-muted text-muted-foreground">
                        {equipment.type === "badge_ulys" ? (
                          <BadgeEuro className="size-4" />
                        ) : (
                          <CreditCard className="size-4" />
                        )}
                      </span>
                      <div>
                        <p className="text-sm font-medium">{equipmentLabels[equipment.type]}</p>
                        <p className="text-xs text-muted-foreground">{equipment.reference}</p>
                      </div>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <p>Véhicule : {vehicleLabel(equipment.vehicleId)}</p>
                      <p>Valide jusqu'au {shortDate(equipment.expiry)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="historique" className="pt-4">
            <div className="panel divide-y divide-border p-0">
              {driverHistory.length === 0 ? (
                <p className="p-5 text-sm text-muted-foreground">
                  Aucun mouvement enregistré pour ce conducteur.
                </p>
              ) : (
                driverHistory.map((entry) => (
                  <div key={entry.id} className="p-4">
                    <p className="text-sm font-medium">{entry.action}</p>
                    <p className="text-sm text-muted-foreground">{entry.detail}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {shortDate(entry.date)} · {entry.user}
                    </p>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
