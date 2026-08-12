import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { FileDown, Search, SlidersHorizontal, UserRound } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { DriverFormDialog } from "@/components/driver-form-dialog";
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
import { shortDate } from "@/lib/fleet-data";
import {
  driverStatusLabels,
  driverStatusTone,
  useFleet,
  type DriverStatus,
} from "@/lib/fleet-store";

export const Route = createFileRoute("/conducteurs/")({
  head: () => ({
    meta: [
      { title: "Conducteurs — FleetManager AI" },
      {
        name: "description",
        content:
          "Annuaire des conducteurs : identité, permis de conduire, adresse postale, agence et véhicule affecté.",
      },
      { property: "og:title", content: "Conducteurs — FleetManager AI" },
      {
        property: "og:description",
        content: "Créez un conducteur manuellement ou par reconnaissance du permis de conduire.",
      },
    ],
  }),
  component: DriversList,
});

function DriversList() {
  const { drivers, agencies, agencyName, vehicleLabel } = useFleet();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<DriverStatus | "all">("all");
  const [agency, setAgency] = useState("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return drivers.filter((driver) => {
      const matchesQuery =
        q.length === 0 ||
        [driver.firstName, driver.lastName, driver.id, driver.licenseNumber, driver.city]
          .join(" ")
          .toLowerCase()
          .includes(q);
      const matchesStatus = status === "all" || driver.status === status;
      const matchesAgency = agency === "all" || driver.agencyId === agency;
      return matchesQuery && matchesStatus && matchesAgency;
    });
  }, [drivers, query, status, agency]);

  const resetFilters = () => {
    setQuery("");
    setStatus("all");
    setAgency("all");
  };

  const expiringSoon = (value: string) =>
    new Date(value).getTime() - Date.now() < 1000 * 60 * 60 * 24 * 90;

  return (
    <>
      <PageHeader
        title="Conducteurs"
        subtitle={`${drivers.length} conducteurs rattachés au périmètre courant`}
        actions={
          <>
            <Button variant="outline" size="sm">
              <FileDown /> Export Excel
            </Button>
            <DriverFormDialog />
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
              placeholder="Nom, prénom, n° de permis, ville…"
              className="pl-9"
              aria-label="Rechercher un conducteur"
            />
          </div>

          <Select value={status} onValueChange={(value) => setStatus(value as DriverStatus | "all")}>
            <SelectTrigger className="w-44" aria-label="Filtrer par statut">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              {Object.entries(driverStatusLabels).map(([value, label]) => (
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
                <SelectItem key={item.id} value={item.id}>
                  {item.name}
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
                <UserRound className="size-6" />
              </span>
              <div>
                <p className="text-sm font-semibold">Aucun conducteur ne correspond</p>
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
                    <TableHead>Conducteur</TableHead>
                    <TableHead>Agence</TableHead>
                    <TableHead>Véhicule affecté</TableHead>
                    <TableHead>Permis</TableHead>
                    <TableHead>Validité permis</TableHead>
                    <TableHead>Ville</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((driver) => (
                    <TableRow key={driver.id} className="cursor-pointer">
                      <TableCell className="font-medium">
                        <Link
                          to="/conducteurs/$driverId"
                          params={{ driverId: driver.id }}
                          className="block hover:text-accent"
                        >
                          {driver.firstName} {driver.lastName}
                          <span className="block text-xs font-normal text-muted-foreground">
                            {driver.id} ·{" "}
                            {driver.source === "ocr_permis" ? "Permis reconnu" : "Saisie manuelle"}
                          </span>
                        </Link>
                      </TableCell>
                      <TableCell>{agencyName(driver.agencyId)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {vehicleLabel(driver.vehicleId)}
                      </TableCell>
                      <TableCell className="tabular">
                        {driver.licenseNumber}
                        <span className="block text-xs text-muted-foreground">
                          {driver.licenseCategories}
                        </span>
                      </TableCell>
                      <TableCell className="tabular">
                        {shortDate(driver.licenseExpiry)}
                        {expiringSoon(driver.licenseExpiry) && (
                          <span className="block text-xs text-warning-foreground">À revalider</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {driver.postalCode} {driver.city}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={driverStatusTone[driver.status]}>
                          {driverStatusLabels[driver.status]}
                        </Badge>
                      </TableCell>
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
