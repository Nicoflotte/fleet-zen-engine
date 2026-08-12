import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BadgeEuro, Check, CreditCard, Link2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { shortDate, statusLabels } from "@/lib/fleet-data";
import { agencyIdByName, equipmentLabels, useFleet } from "@/lib/fleet-store";

export const Route = createFileRoute("/affectations")({
  head: () => ({
    meta: [
      { title: "Affectations — FleetManager AI" },
      {
        name: "description",
        content:
          "Module d'affectation : reliez un véhicule, un conducteur, une agence et ses équipements (DKV, TotalEnergies, Ulys) en une seule opération.",
      },
      { property: "og:title", content: "Affectations — FleetManager AI" },
      {
        property: "og:description",
        content: "Une seule saisie met à jour les modules Véhicules, Conducteurs, Agences et Équipements.",
      },
    ],
  }),
  component: AssignmentsPage,
});

function AssignmentsPage() {
  const { vehicles, drivers, agencies, equipments, history, applyAssignment, driverName } = useFleet();

  const [vehicleId, setVehicleId] = useState(vehicles[0]!.id);
  const vehicle = vehicles.find((v) => v.id === vehicleId)!;

  const [driverId, setDriverId] = useState<string>("none");
  const [agencyId, setAgencyId] = useState<string>(agencyIdByName(vehicle.agency));
  const [equipmentIds, setEquipmentIds] = useState<string[]>([]);

  // Le formulaire reflète toujours l'état courant du véhicule sélectionné.
  useEffect(() => {
    const current = vehicles.find((v) => v.id === vehicleId);
    if (!current) return;
    const linked = drivers.find((d) => d.vehicleId === vehicleId);
    setDriverId(linked?.id ?? "none");
    setAgencyId(agencyIdByName(current.agency));
    setEquipmentIds(equipments.filter((e) => e.vehicleId === vehicleId).map((e) => e.id));
  }, [vehicleId, vehicles, drivers, equipments]);

  const toggleEquipment = (id: string) =>
    setEquipmentIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));

  const submit = () => {
    applyAssignment({
      vehicleId,
      driverId: driverId === "none" ? null : driverId,
      agencyId,
      equipmentIds,
    });
    toast.success("Affectation enregistrée", {
      description: "Véhicules, Conducteurs, Agences et Équipements ont été mis à jour.",
    });
  };

  const selectableEquipments = equipments.filter(
    (e) => !e.vehicleId || e.vehicleId === vehicleId || equipmentIds.includes(e.id),
  );

  return (
    <>
      <PageHeader
        title="Affectations"
        subtitle="Une saisie unique met à jour Véhicules, Conducteurs, Agences et Équipements"
      />

      <main className="flex-1 space-y-5 px-4 py-6 md:px-8">
        <section className="panel flex flex-wrap items-center gap-3 p-4 text-sm text-muted-foreground">
          <Link2 className="size-4 text-accent" />
          <span>Véhicule</span>
          <ArrowRight className="size-3" />
          <span>Conducteur</span>
          <ArrowRight className="size-3" />
          <span>Agence</span>
          <ArrowRight className="size-3" />
          <span>Équipements</span>
        </section>

        <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <section className="panel space-y-5 p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="assign-vehicle">Véhicule</Label>
                <Select value={vehicleId} onValueChange={setVehicleId}>
                  <SelectTrigger id="assign-vehicle">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.brand} {item.model} · {item.plate}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="assign-driver">Conducteur</Label>
                <Select value={driverId} onValueChange={setDriverId}>
                  <SelectTrigger id="assign-driver">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucun conducteur</SelectItem>
                    {drivers.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.firstName} {item.lastName}
                        {item.vehicleId && item.vehicleId !== vehicleId ? " (déjà affecté)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="assign-agency">Agence de rattachement</Label>
                <Select value={agencyId} onValueChange={setAgencyId}>
                  <SelectTrigger id="assign-agency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {agencies.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name} — {item.postalCode} {item.city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <p className="text-sm font-semibold">Équipements (cartes DKV / TotalEnergies, badge Ulys)</p>
              {selectableEquipments.map((equipment) => (
                <label
                  key={equipment.id}
                  className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-border p-3 hover:bg-muted/50"
                >
                  <span className="flex items-center gap-3">
                    <Checkbox
                      checked={equipmentIds.includes(equipment.id)}
                      onCheckedChange={() => toggleEquipment(equipment.id)}
                    />
                    <span className="grid size-8 place-items-center rounded-md bg-muted text-muted-foreground">
                      {equipment.type === "badge_ulys" ? (
                        <BadgeEuro className="size-4" />
                      ) : (
                        <CreditCard className="size-4" />
                      )}
                    </span>
                    <span>
                      <span className="block text-sm font-medium">{equipmentLabels[equipment.type]}</span>
                      <span className="block text-xs text-muted-foreground">
                        {equipment.reference} · valide jusqu'au {shortDate(equipment.expiry)}
                      </span>
                    </span>
                  </span>
                  <Badge
                    variant="outline"
                    className={
                      equipment.vehicleId
                        ? "bg-info/15 text-info border-info/30"
                        : "bg-muted text-muted-foreground border-border"
                    }
                  >
                    {equipment.vehicleId ? "Affecté" : "Stock"}
                  </Badge>
                </label>
              ))}
            </div>

            <Button onClick={submit}>
              <Check /> Valider l'affectation
            </Button>
          </section>

          <div className="space-y-5">
            <section className="panel space-y-3 p-5">
              <p className="text-sm font-semibold">État courant du véhicule</p>
              <Row label="Véhicule" value={`${vehicle.brand} ${vehicle.model}`} />
              <Row label="Immatriculation" value={vehicle.plate} />
              <Row label="Statut" value={statusLabels[vehicle.status]} />
              <Row label="Agence" value={vehicle.agency} />
              <Row
                label="Conducteur"
                value={driverName(drivers.find((d) => d.vehicleId === vehicle.id)?.id ?? null)}
              />
              <Row
                label="Équipements"
                value={
                  equipments.filter((e) => e.vehicleId === vehicle.id).length
                    ? equipments
                        .filter((e) => e.vehicleId === vehicle.id)
                        .map((e) => equipmentLabels[e.type])
                        .join(", ")
                    : "Aucun"
                }
              />
              <Button variant="outline" size="sm" asChild>
                <Link to="/vehicules/$vehicleId" params={{ vehicleId: vehicle.id }}>
                  Ouvrir la fiche véhicule
                </Link>
              </Button>
            </section>

            <section className="panel p-0">
              <div className="border-b border-border px-5 py-3">
                <p className="text-sm font-semibold">Historique des affectations</p>
              </div>
              <div className="divide-y divide-border">
                {history.slice(0, 8).map((entry) => (
                  <div key={entry.id} className="p-4">
                    <p className="text-sm font-medium">{entry.action}</p>
                    <p className="text-sm text-muted-foreground">{entry.detail}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {shortDate(entry.date)} · {entry.user}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
