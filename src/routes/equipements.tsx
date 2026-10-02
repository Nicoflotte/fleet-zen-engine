import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { BadgeEuro, CreditCard } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { RecordFormDialog, type RecordField, type RecordValues } from "@/components/record-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { shortDate } from "@/lib/fleet-data";
import { equipmentLabels, useFleet, type EquipmentType } from "@/lib/fleet-store";

export const Route = createFileRoute("/equipements")({
  head: () => ({
    meta: [
      { title: "Équipements — FleetManager AI" },
      {
        name: "description",
        content:
          "Cartes carburant DKV et TotalEnergies, badges télépéage Ulys : références, validité et rattachement véhicule / conducteur.",
      },
      { property: "og:title", content: "Équipements — FleetManager AI" },
      {
        property: "og:description",
        content: "Suivi des cartes DKV, TotalEnergies et badges Ulys de la flotte.",
      },
    ],
  }),
  component: EquipmentsPage,
});

const filters: { value: EquipmentType | "all"; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "carte_dkv", label: equipmentLabels.carte_dkv },
  { value: "carte_total", label: equipmentLabels.carte_total },
  { value: "badge_ulys", label: equipmentLabels.badge_ulys },
];

const createFields: RecordField[] = [
  {
    key: "type",
    label: "Type d'équipement",
    type: "select",
    required: true,
    options: [
      { value: "carte_dkv", label: equipmentLabels.carte_dkv },
      { value: "carte_total", label: equipmentLabels.carte_total },
      { value: "badge_ulys", label: equipmentLabels.badge_ulys },
    ],
  },
  { key: "reference", label: "Référence / numéro", placeholder: "Ex. DKV-45821", required: true },
  { key: "expiry", label: "Date de validité", type: "date", required: true },
];

function EquipmentsPage() {
  const { equipments, vehicleLabel, driverName, addEquipment } = useFleet();
  const [type, setType] = useState<EquipmentType | "all">("all");

  const filtered = type === "all" ? equipments : equipments.filter((e) => e.type === type);
  const available = equipments.filter((e) => !e.vehicleId).length;

  const createEquipment = (values: RecordValues) => {
    const item = addEquipment({
      type: (values["type"] ?? "carte_dkv") as EquipmentType,
      reference: (values["reference"] ?? "").trim(),
      expiry: values["expiry"] ?? "",
      vehicleId: null,
      driverId: null,
    });
    toast.success(`${equipmentLabels[item.type]} ${item.reference} ajouté au stock`);
  };

  return (
    <>
      <PageHeader
        title="Équipements"
        subtitle={`${equipments.length} équipements · ${available} disponibles au stock`}
        actions={
          <RecordFormDialog
            triggerLabel="Nouvel équipement"
            title="Nouvel équipement"
            description="Ajoutez une carte carburant ou un badge télépéage au stock. Il sera ensuite affecté depuis le module Affectations."
            fields={createFields}
            onSubmit={createEquipment}
          />
        }
      />

      <main className="flex-1 space-y-5 px-4 py-6 md:px-8">
        <section className="panel flex flex-wrap items-center gap-2 p-4">
          {filters.map((filter) => (
            <Button
              key={filter.value}
              size="sm"
              variant={type === filter.value ? "default" : "outline"}
              onClick={() => setType(filter.value)}
            >
              {filter.label}
            </Button>
          ))}
          <Button size="sm" variant="ghost" asChild className="ml-auto">
            <Link to="/affectations">Affecter un équipement</Link>
          </Button>
        </section>

        <section className="panel overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Référence</TableHead>
                  <TableHead>Véhicule</TableHead>
                  <TableHead>Conducteur</TableHead>
                  <TableHead>Validité</TableHead>
                  <TableHead>État</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((equipment) => (
                  <TableRow key={equipment.id}>
                    <TableCell className="font-medium">
                      <span className="inline-flex items-center gap-2">
                        {equipment.type === "badge_ulys" ? (
                          <BadgeEuro className="size-4 text-muted-foreground" />
                        ) : (
                          <CreditCard className="size-4 text-muted-foreground" />
                        )}
                        {equipmentLabels[equipment.type]}
                      </span>
                    </TableCell>
                    <TableCell className="tabular">{equipment.reference}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {vehicleLabel(equipment.vehicleId)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {driverName(equipment.driverId)}
                    </TableCell>
                    <TableCell className="tabular">{shortDate(equipment.expiry)}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          equipment.vehicleId
                            ? "bg-success/15 text-success-foreground border-success/30"
                            : "bg-muted text-muted-foreground border-border"
                        }
                      >
                        {equipment.vehicleId ? "Affecté" : "Disponible"}
                      </Badge>
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
