import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import { vehicles as seedVehicles, type Vehicle } from "@/lib/fleet-data";

export type Agency = {
  id: string;
  name: string;
  city: string;
  postalCode: string;
  manager: string;
};

export type EquipmentType = "carte_dkv" | "carte_total" | "badge_ulys";

export type Equipment = {
  id: string;
  type: EquipmentType;
  reference: string;
  expiry: string;
  vehicleId: string | null;
  driverId: string | null;
};

export type DriverStatus = "actif" | "suspendu" | "sortie";

export type Driver = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
  licenseNumber: string;
  licenseCategories: string;
  licenseIssuedAt: string;
  licenseExpiry: string;
  street: string;
  postalCode: string;
  city: string;
  country: string;
  agencyId: string;
  vehicleId: string | null;
  status: DriverStatus;
  source: "manuel" | "ocr_permis";
};

export type HistoryEntry = {
  id: string;
  date: string;
  user: string;
  action: string;
  detail: string;
};

export const equipmentLabels: Record<EquipmentType, string> = {
  carte_dkv: "Carte DKV",
  carte_total: "Carte TotalEnergies",
  badge_ulys: "Badge Ulys",
};

export const driverStatusLabels: Record<DriverStatus, string> = {
  actif: "Actif",
  suspendu: "Suspendu",
  sortie: "Sorti du parc",
};

export const driverStatusTone: Record<DriverStatus, string> = {
  actif: "bg-success/15 text-success-foreground border-success/30",
  suspendu: "bg-warning/20 text-warning-foreground border-warning/40",
  sortie: "bg-muted text-muted-foreground border-border",
};

export const seedAgencies: Agency[] = [
  { id: "AG-LYE", name: "Lyon Est", city: "Bron", postalCode: "69500", manager: "Hélène Vasseur" },
  { id: "AG-PAN", name: "Paris Nord", city: "Saint-Denis", postalCode: "93200", manager: "Marc Ifrah" },
  { id: "AG-BDX", name: "Bordeaux", city: "Mérignac", postalCode: "33700", manager: "Julie Ferrand" },
  { id: "AG-LIL", name: "Lille", city: "Villeneuve-d'Ascq", postalCode: "59650", manager: "Damien Roux" },
  { id: "AG-MRS", name: "Marseille", city: "Vitrolles", postalCode: "13127", manager: "Sonia Attia" },
];

const seedDrivers: Driver[] = [
  {
    id: "CD-2001",
    firstName: "Karim",
    lastName: "Belhadj",
    email: "karim.belhadj@fleet.fr",
    phone: "06 21 44 87 13",
    birthDate: "1988-03-12",
    licenseNumber: "13AB94021",
    licenseCategories: "B",
    licenseIssuedAt: "2007-06-18",
    licenseExpiry: "2027-06-17",
    street: "18 rue des Cordeliers",
    postalCode: "69003",
    city: "Lyon",
    country: "France",
    agencyId: "AG-LYE",
    vehicleId: "VH-1042",
    status: "actif",
    source: "ocr_permis",
  },
  {
    id: "CD-2002",
    firstName: "Sophie",
    lastName: "Lemaire",
    email: "sophie.lemaire@fleet.fr",
    phone: "06 74 12 90 55",
    birthDate: "1991-11-02",
    licenseNumber: "75CD11884",
    licenseCategories: "B, A2",
    licenseIssuedAt: "2010-09-04",
    licenseExpiry: "2026-09-03",
    street: "7 avenue de la République",
    postalCode: "75011",
    city: "Paris",
    country: "France",
    agencyId: "AG-PAN",
    vehicleId: "VH-1043",
    status: "actif",
    source: "manuel",
  },
  {
    id: "CD-2003",
    firstName: "Yanis",
    lastName: "Dorval",
    email: "yanis.dorval@fleet.fr",
    phone: "07 61 33 20 08",
    birthDate: "1985-01-27",
    licenseNumber: "33EF77410",
    licenseCategories: "B, C",
    licenseIssuedAt: "2004-02-11",
    licenseExpiry: "2026-08-30",
    street: "42 cours du Médoc",
    postalCode: "33300",
    city: "Bordeaux",
    country: "France",
    agencyId: "AG-BDX",
    vehicleId: "VH-1044",
    status: "actif",
    source: "ocr_permis",
  },
  {
    id: "CD-2004",
    firstName: "Nadia",
    lastName: "Fournier",
    email: "nadia.fournier@fleet.fr",
    phone: "06 08 55 71 26",
    birthDate: "1994-07-19",
    licenseNumber: "69GH50233",
    licenseCategories: "B",
    licenseIssuedAt: "2013-04-22",
    licenseExpiry: "2028-04-21",
    street: "3 rue Garibaldi",
    postalCode: "69006",
    city: "Lyon",
    country: "France",
    agencyId: "AG-LYE",
    vehicleId: "VH-1046",
    status: "actif",
    source: "manuel",
  },
  {
    id: "CD-2005",
    firstName: "Bruno",
    lastName: "Sanchez",
    email: "bruno.sanchez@fleet.fr",
    phone: "06 93 40 12 77",
    birthDate: "1979-05-05",
    licenseNumber: "13IJ29001",
    licenseCategories: "B, C, EC",
    licenseIssuedAt: "1999-10-08",
    licenseExpiry: "2026-10-07",
    street: "12 boulevard Michelet",
    postalCode: "13008",
    city: "Marseille",
    country: "France",
    agencyId: "AG-MRS",
    vehicleId: "VH-1047",
    status: "suspendu",
    source: "manuel",
  },
  {
    id: "CD-2006",
    firstName: "Claire",
    lastName: "Ober",
    email: "claire.ober@fleet.fr",
    phone: "07 12 88 03 41",
    birthDate: "1996-12-30",
    licenseNumber: "33KL66852",
    licenseCategories: "B",
    licenseIssuedAt: "2015-08-13",
    licenseExpiry: "2030-08-12",
    street: "9 rue Fondaudège",
    postalCode: "33000",
    city: "Bordeaux",
    country: "France",
    agencyId: "AG-BDX",
    vehicleId: "VH-1049",
    status: "actif",
    source: "ocr_permis",
  },
  {
    id: "CD-2007",
    firstName: "Élodie",
    lastName: "Marchand",
    email: "elodie.marchand@fleet.fr",
    phone: "06 45 19 60 32",
    birthDate: "1990-02-14",
    licenseNumber: "59MN10745",
    licenseCategories: "B",
    licenseIssuedAt: "2009-05-29",
    licenseExpiry: "2027-05-28",
    street: "22 rue Nationale",
    postalCode: "59000",
    city: "Lille",
    country: "France",
    agencyId: "AG-LIL",
    vehicleId: null,
    status: "actif",
    source: "manuel",
  },
];

const seedEquipments: Equipment[] = [
  { id: "EQ-DKV-01", type: "carte_dkv", reference: "DKV 7089 4412", expiry: "2027-03-31", vehicleId: "VH-1042", driverId: "CD-2001" },
  { id: "EQ-DKV-02", type: "carte_dkv", reference: "DKV 7089 5530", expiry: "2027-03-31", vehicleId: "VH-1044", driverId: "CD-2003" },
  { id: "EQ-DKV-03", type: "carte_dkv", reference: "DKV 7089 6178", expiry: "2026-12-31", vehicleId: null, driverId: null },
  { id: "EQ-TOT-01", type: "carte_total", reference: "TE 4410 2286", expiry: "2027-01-31", vehicleId: "VH-1043", driverId: "CD-2002" },
  { id: "EQ-TOT-02", type: "carte_total", reference: "TE 4410 3390", expiry: "2026-11-30", vehicleId: "VH-1047", driverId: "CD-2005" },
  { id: "EQ-TOT-03", type: "carte_total", reference: "TE 4410 4025", expiry: "2027-06-30", vehicleId: null, driverId: null },
  { id: "EQ-ULY-01", type: "badge_ulys", reference: "ULYS 88 210 447", expiry: "2028-05-31", vehicleId: "VH-1046", driverId: "CD-2004" },
  { id: "EQ-ULY-02", type: "badge_ulys", reference: "ULYS 88 210 903", expiry: "2028-05-31", vehicleId: "VH-1049", driverId: "CD-2006" },
  { id: "EQ-ULY-03", type: "badge_ulys", reference: "ULYS 88 211 118", expiry: "2027-09-30", vehicleId: null, driverId: null },
];

export type AssignmentInput = {
  vehicleId: string;
  driverId: string | null;
  agencyId: string;
  equipmentIds: string[];
};

type FleetContextValue = {
  vehicles: Vehicle[];
  drivers: Driver[];
  agencies: Agency[];
  equipments: Equipment[];
  history: HistoryEntry[];
  agencyName: (agencyId: string) => string;
  driverName: (driverId: string | null) => string;
  vehicleLabel: (vehicleId: string | null) => string;
  addDriver: (driver: Omit<Driver, "id" | "vehicleId">) => Driver;
  updateDriver: (id: string, patch: Partial<Driver>) => void;
  applyAssignment: (input: AssignmentInput) => void;
};

const FleetContext = createContext<FleetContextValue | null>(null);

const today = () => new Date().toISOString().slice(0, 10);

export function FleetProvider({ children }: { children: ReactNode }) {
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => seedVehicles.map((v) => ({ ...v })));
  const [drivers, setDrivers] = useState<Driver[]>(() => seedDrivers.map((d) => ({ ...d })));
  const [agencies] = useState<Agency[]>(() => seedAgencies.map((a) => ({ ...a })));
  const [equipments, setEquipments] = useState<Equipment[]>(() => seedEquipments.map((e) => ({ ...e })));
  const [history, setHistory] = useState<HistoryEntry[]>([
    {
      id: "H-1",
      date: "2026-08-04",
      user: "Nicolas Raclet",
      action: "Affectation",
      detail: "Badge Ulys ULYS 88 210 447 rattaché à VH-1046 (Nadia Fournier)",
    },
  ]);

  const agencyName = useCallback(
    (agencyId: string) => agencies.find((a) => a.id === agencyId)?.name ?? "—",
    [agencies],
  );

  const driverName = useCallback(
    (driverId: string | null) => {
      if (!driverId) return "Non affecté";
      const driver = drivers.find((d) => d.id === driverId);
      return driver ? `${driver.firstName} ${driver.lastName}` : "Non affecté";
    },
    [drivers],
  );

  const vehicleLabel = useCallback(
    (vehicleId: string | null) => {
      if (!vehicleId) return "Non affecté";
      const vehicle = vehicles.find((v) => v.id === vehicleId);
      return vehicle ? `${vehicle.brand} ${vehicle.model} · ${vehicle.plate}` : "Non affecté";
    },
    [vehicles],
  );

  const log = useCallback((action: string, detail: string) => {
    setHistory((prev) => [
      { id: `H-${Date.now()}-${prev.length}`, date: today(), user: "Nicolas Raclet", action, detail },
      ...prev,
    ]);
  }, []);

  const addDriver = useCallback(
    (input: Omit<Driver, "id" | "vehicleId">) => {
      const driver: Driver = { ...input, id: `CD-${2100 + Math.floor(Math.random() * 800)}`, vehicleId: null };
      setDrivers((prev) => [driver, ...prev]);
      log(
        "Création conducteur",
        `${driver.firstName} ${driver.lastName} créé (${input.source === "ocr_permis" ? "reconnaissance permis" : "saisie manuelle"})`,
      );
      return driver;
    },
    [log],
  );

  const updateDriver = useCallback(
    (id: string, patch: Partial<Driver>) => {
      setDrivers((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)));
      log("Mise à jour conducteur", `Fiche ${id} modifiée`);
    },
    [log],
  );

  const applyAssignment = useCallback(
    ({ vehicleId, driverId, agencyId, equipmentIds }: AssignmentInput) => {
      const agency = seedAgencies.find((a) => a.id === agencyId);
      const driver = driverId ? drivers.find((d) => d.id === driverId) ?? null : null;
      const fullName = driver ? `${driver.firstName} ${driver.lastName}` : null;

      // Module Véhicules
      setVehicles((prev) =>
        prev.map((v) =>
          v.id === vehicleId ? { ...v, driver: fullName, agency: agency?.name ?? v.agency } : v,
        ),
      );

      // Module Conducteurs (un véhicule = un conducteur)
      setDrivers((prev) =>
        prev.map((d) => {
          if (driverId && d.id === driverId) return { ...d, vehicleId, agencyId };
          if (d.vehicleId === vehicleId && d.id !== driverId) return { ...d, vehicleId: null };
          return d;
        }),
      );

      // Module Équipements
      setEquipments((prev) =>
        prev.map((e) => {
          if (equipmentIds.includes(e.id)) return { ...e, vehicleId, driverId };
          if (e.vehicleId === vehicleId) return { ...e, vehicleId: null, driverId: null };
          return e;
        }),
      );

      const equipmentRefs = equipments
        .filter((e) => equipmentIds.includes(e.id))
        .map((e) => `${equipmentLabels[e.type]} ${e.reference}`);

      log(
        "Affectation",
        `${vehicleId} → ${fullName ?? "aucun conducteur"} · agence ${agency?.name ?? "—"}${
          equipmentRefs.length ? ` · ${equipmentRefs.join(", ")}` : " · aucun équipement"
        }`,
      );
    },
    [drivers, equipments, log],
  );

  const value = useMemo<FleetContextValue>(
    () => ({
      vehicles,
      drivers,
      agencies,
      equipments,
      history,
      agencyName,
      driverName,
      vehicleLabel,
      addDriver,
      updateDriver,
      applyAssignment,
    }),
    [
      vehicles,
      drivers,
      agencies,
      equipments,
      history,
      agencyName,
      driverName,
      vehicleLabel,
      addDriver,
      updateDriver,
      applyAssignment,
    ],
  );

  return <FleetContext.Provider value={value}>{children}</FleetContext.Provider>;
}

export function useFleet() {
  const context = useContext(FleetContext);
  if (!context) throw new Error("useFleet doit être utilisé dans un FleetProvider");
  return context;
}

export const agencyIdByName = (name: string) =>
  seedAgencies.find((a) => a.name === name)?.id ?? seedAgencies[0]!.id;
