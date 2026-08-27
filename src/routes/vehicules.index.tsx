import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, SlidersHorizontal, FileDown, CarFront } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { VehicleFormDialog } from "@/components/vehicle-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  currency,
  number,
  shortDate,
  statusLabels,
  statusTone,
  type VehicleStatus,
} from "@/lib/fleet-data";
import { useFleet } from "@/lib/fleet-store";

export const Route = createFileRoute("/vehicules/")({
  head: () => ({
    meta: [
      { title: "Parc véhicules — FleetManager AI" },
      {
        name: "description",
        content:
          "Liste complète du parc : recherche, filtres par statut, agence et énergie, coûts et échéances par véhicule.",
      },
      { property: "og:title", content: "Parc véhicules — FleetManager AI" },
      {
        property: "og:description",
        content: "Recherchez, filtrez et pilotez l'ensemble des véhicules de la flotte.",
      },
    ],
  }),
  component: VehiclesList,
});

function VehiclesList() {
  const { vehicles, agencyName, driverOfVehicle, driverName } = useFleet();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<VehicleStatus | "all">("all");
  const [agency, setAgency] = useState("all");

  const agencies = useMemo(
    () => Array.from(new Set(vehicles.map((v) => agencyName(v.agencyId)))).sort(),
    [vehicles],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return vehicles.filter((vehicle) => {
      const matchesQuery =
        q.length === 0 ||
        [vehicle.plate, vehicle.brand, vehicle.model, vehicle.id, driverName(driverOfVehicle(vehicle.id)?.id ?? null)]
          .join(" ")
          .toLowerCase()
          .includes(q);
      const matchesStatus = status === "all" || vehicle.status === status;
      const matchesAgency = agency === "all" || agencyName(vehicle.agencyId) === agency;
      return matchesQuery && matchesStatus && matchesAgency;
    });
  }, [vehicles, query, status, agency]);

  const resetFilters = () => {
    setQuery("");
    setStatus("all");
    setAgency("all");
  };

  return (
    <>
      <PageHeader
        title="Parc véhicules"
        subtitle={`${vehicles.length} véhicules dans le périmètre courant`}
        actions={
          <>
            <Button variant="outline" size="sm">
              <FileDown /> Export Excel
            </Button>
            <VehicleFormDialog />
          </>
        }
      />

      <main className="flex-1 space-y-5 px-4 py-6 md:px-8">
        <section className="panel flex flex-wrap items-center gap-3 p-4">
          <div className="relative min-w-56 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Immatriculation, marque, modèle, conducteur…"
              className="pl-9"
              aria-label="Rechercher un véhicule"
            />
          </div>

          <Select value={status} onValueChange={(value) => setStatus(value as VehicleStatus | "all")}>
            <SelectTrigger className="w-44" aria-label="Filtrer par statut">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              {Object.entries(statusLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={agency} onValueChange={setAgency}>
            <SelectTrigger className="w-44" aria-label="Filtrer par agence">
              <SelectValue placeholder="Agence" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les agences</SelectItem>
              {agencies.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="ghost" size="sm" onClick={resetFilters}>
            <SlidersHorizontal /> Réinitialiser
          </Button>
        </section>

        <section className="panel overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3">
            <p className="text-sm font-semibold">
              {filtered.length} résultat{filtered.length > 1 ? "s" : ""}
            </p>
            <p className="text-xs text-muted-foreground">Cliquez sur une ligne pour ouvrir la fiche</p>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
              <span className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
                <CarFront className="size-6" />
              </span>
              <div>
                <p className="text-sm font-semibold">Aucun véhicule ne correspond</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Ajustez la recherche ou réinitialisez les filtres.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={resetFilters}>
                Réinitialiser les filtres
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Véhicule</TableHead>
                    <TableHead>Immatriculation</TableHead>
                    <TableHead>Agence</TableHead>
                    <TableHead>Conducteur</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Km</TableHead>
                    <TableHead className="text-right">Coût / mois</TableHead>
                    <TableHead>Fin de contrat</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((vehicle) => (
                    <TableRow key={vehicle.id} className="cursor-pointer">
                      <TableCell className="font-medium">
                        <Link
                          to="/vehicules/$vehicleId"
                          params={{ vehicleId: vehicle.id }}
                          className="block hover:text-accent"
                        >
                          {vehicle.brand} {vehicle.model}
                          <span className="block text-xs font-normal text-muted-foreground">
                            {vehicle.category} · {vehicle.energy}
                          </span>
                        </Link>
                      </TableCell>
                      <TableCell className="tabular">{vehicle.plate}</TableCell>
                      <TableCell>{agencyName(vehicle.agencyId)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {driverName(driverOfVehicle(vehicle.id)?.id ?? null)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusTone[vehicle.status]}>
                          {statusLabels[vehicle.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="tabular text-right">{number(vehicle.km)}</TableCell>
                      <TableCell className="tabular text-right">
                        {vehicle.monthlyCost ? currency(vehicle.monthlyCost) : "—"}
                      </TableCell>
                      <TableCell className="tabular">{shortDate(vehicle.contractEnd)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
