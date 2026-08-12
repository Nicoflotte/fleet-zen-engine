import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, Car, Users } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useFleet } from "@/lib/fleet-store";

export const Route = createFileRoute("/agences")({
  head: () => ({
    meta: [
      { title: "Agences — FleetManager AI" },
      {
        name: "description",
        content:
          "Agences de la flotte : effectif conducteurs, véhicules rattachés et équipements associés par site.",
      },
      { property: "og:title", content: "Agences — FleetManager AI" },
      {
        property: "og:description",
        content: "Vue consolidée des sites : conducteurs, véhicules et équipements par agence.",
      },
    ],
  }),
  component: AgenciesPage,
});

function AgenciesPage() {
  const { agencies, drivers, vehicles, equipments } = useFleet();

  return (
    <>
      <PageHeader
        title="Agences"
        subtitle={`${agencies.length} sites — périmètre de rattachement des véhicules et conducteurs`}
      />

      <main className="flex-1 space-y-5 px-4 py-6 md:px-8">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {agencies.map((agency) => {
            const agencyDrivers = drivers.filter((d) => d.agencyId === agency.id);
            const agencyVehicles = vehicles.filter((v) => v.agency === agency.name);
            const agencyEquipments = equipments.filter((e) =>
              agencyVehicles.some((v) => v.id === e.vehicleId),
            );

            return (
              <article key={agency.id} className="panel space-y-4 p-5">
                <div className="flex items-start gap-3">
                  <span className="grid size-9 place-items-center rounded-lg bg-accent/15 text-accent">
                    <Building2 className="size-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{agency.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {agency.postalCode} {agency.city} · {agency.manager}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <Stat icon={Car} label="Véhicules" value={agencyVehicles.length} />
                  <Stat icon={Users} label="Conducteurs" value={agencyDrivers.length} />
                  <Stat icon={Building2} label="Équipements" value={agencyEquipments.length} />
                </div>
              </article>
            );
          })}
        </section>

        <section className="panel overflow-hidden">
          <div className="border-b border-border px-5 py-3">
            <p className="text-sm font-semibold">Répartition détaillée</p>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agence</TableHead>
                  <TableHead>Responsable</TableHead>
                  <TableHead>Véhicules</TableHead>
                  <TableHead>Conducteurs</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agencies.map((agency) => (
                  <TableRow key={agency.id}>
                    <TableCell className="font-medium">{agency.name}</TableCell>
                    <TableCell className="text-muted-foreground">{agency.manager}</TableCell>
                    <TableCell className="text-sm">
                      {vehicles
                        .filter((v) => v.agency === agency.name)
                        .map((v) => (
                          <Link
                            key={v.id}
                            to="/vehicules/$vehicleId"
                            params={{ vehicleId: v.id }}
                            className="mr-2 inline-block hover:text-accent"
                          >
                            {v.plate}
                          </Link>
                        ))}
                    </TableCell>
                    <TableCell className="text-sm">
                      {drivers
                        .filter((d) => d.agencyId === agency.id)
                        .map((d) => (
                          <Link
                            key={d.id}
                            to="/conducteurs/$driverId"
                            params={{ driverId: d.id }}
                            className="mr-2 inline-block hover:text-accent"
                          >
                            {d.firstName} {d.lastName}
                          </Link>
                        ))}
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

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Car;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-lg border border-border bg-muted/40 p-3">
      <Icon className="mx-auto size-4 text-muted-foreground" />
      <p className="tabular mt-1 text-lg font-semibold">{value}</p>
      <p className="text-[0.68rem] uppercase tracking-[0.1em] text-muted-foreground">{label}</p>
    </div>
  );
}
