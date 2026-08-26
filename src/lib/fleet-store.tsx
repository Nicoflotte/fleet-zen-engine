import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import {
  agencies as seedAgencies,
  claims as seedClaims,
  entities as seedEntities,
  expenses as seedExpenses,
  fines as seedFines,
  insurancePolicies as seedPolicies,
  leases as seedLeases,
  rentals as seedRentals,
  vehicles as seedVehicles,
  type Agency,
  type Claim,
  type Entity,
  type Expense,
  type Fine,
  type InsurancePolicy,
  type Lease,
  type Registration,
  type Rental,
  type Vehicle,
} from "@/lib/fleet-data";

export type { Agency, Entity } from "@/lib/fleet-data";

export type EquipmentType = "carte_dkv" | "carte_total" | "badge_ulys";

export type Equipment = {
  id: string;
  type: EquipmentType;
  reference: string;
  expiry: string;
  vehicleId: string | null;
  driverId: string | null;
  archived: boolean;
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
  archived: boolean;
};

export type HistoryEntry = {
  id: string;
  date: string;
  user: string;
  module: string;
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

const seedDrivers: Driver[] = [
  {
    id: "CD-2001",
    firstName: "Karim",
    lastName: "Belhadj",
    email: "karim.belhadj@omnium.fr",
    phone: "06 21 44 87 13",
    birthDate: "1988-03-12",
    licenseNumber: "13AB94021",
    licenseCategories: "B",
    licenseIssuedAt: "2007-06-18",
    licenseExpiry: "2027-06-17",
    street: "18 rue des Cordeliers",
    postalCode: "06220",
    city: "Vallauris",
    country: "France",
    agencyId: "OF-06",
    vehicleId: "VH-1042",
    status: "actif",
    source: "ocr_permis",
    archived: false,
  },
  {
    id: "CD-2002",
    firstName: "Sophie",
    lastName: "Lemaire",
    email: "sophie.lemaire@omnium.fr",
    phone: "06 74 12 90 55",
    birthDate: "1991-11-02",
    licenseNumber: "13CD11884",
    licenseCategories: "B, A2",
    licenseIssuedAt: "2010-09-04",
    licenseExpiry: "2026-09-03",
    street: "7 avenue de la République",
    postalCode: "13015",
    city: "Marseille",
    country: "France",
    agencyId: "OF-13",
    vehicleId: "VH-1043",
    status: "actif",
    source: "manuel",
    archived: false,
  },
  {
    id: "CD-2003",
    firstName: "Yanis",
    lastName: "Dorval",
    email: "yanis.dorval@omnium.fr",
    phone: "07 61 33 20 08",
    birthDate: "1985-01-27",
    licenseNumber: "13EF77410",
    licenseCategories: "B, C",
    licenseIssuedAt: "2004-02-11",
    licenseExpiry: "2026-08-30",
    street: "42 boulevard National",
    postalCode: "13014",
    city: "Marseille",
    country: "France",
    agencyId: "SEE-13",
    vehicleId: "VH-1044",
    status: "actif",
    source: "ocr_permis",
    archived: false,
  },
  {
    id: "CD-2004",
    firstName: "Nadia",
    lastName: "Fournier",
    email: "nadia.fournier@omnium.fr",
    phone: "06 08 55 71 26",
    birthDate: "1994-07-19",
    licenseNumber: "06GH50233",
    licenseCategories: "B",
    licenseIssuedAt: "2013-04-22",
    licenseExpiry: "2028-04-21",
    street: "3 chemin Saint-Bernard",
    postalCode: "06220",
    city: "Vallauris",
    country: "France",
    agencyId: "MET-06",
    vehicleId: "VH-1046",
    status: "actif",
    source: "manuel",
    archived: false,
  },
  {
    id: "CD-2005",
    firstName: "Bruno",
    lastName: "Sanchez",
    email: "bruno.sanchez@omnium.fr",
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
    agencyId: "TCE-13",
    vehicleId: "VH-1047",
    status: "suspendu",
    source: "manuel",
    archived: false,
  },
  {
    id: "CD-2006",
    firstName: "Claire",
    lastName: "Ober",
    email: "claire.ober@omnium.fr",
    phone: "07 12 88 03 41",
    birthDate: "1996-12-30",
    licenseNumber: "06KL66852",
    licenseCategories: "B",
    licenseIssuedAt: "2015-08-13",
    licenseExpiry: "2030-08-12",
    street: "9 avenue Georges Clemenceau",
    postalCode: "06220",
    city: "Vallauris",
    country: "France",
    agencyId: "SATE-06",
    vehicleId: "VH-1051",
    status: "actif",
    source: "ocr_permis",
    archived: false,
  },
  {
    id: "CD-2007",
    firstName: "Élodie",
    lastName: "Marchand",
    email: "elodie.marchand@omnium.fr",
    phone: "06 45 19 60 32",
    birthDate: "1990-02-14",
    licenseNumber: "11MN10745",
    licenseCategories: "B",
    licenseIssuedAt: "2009-05-29",
    licenseExpiry: "2027-05-28",
    street: "22 rue Nationale",
    postalCode: "11100",
    city: "Narbonne",
    country: "France",
    agencyId: "OF-11",
    vehicleId: "VH-1053",
    status: "actif",
    source: "manuel",
    archived: false,
  },
  {
    id: "CD-2008",
    firstName: "Damien",
    lastName: "Roux",
    email: "damien.roux@omnium.fr",
    phone: "06 77 20 41 09",
    birthDate: "1983-09-08",
    licenseNumber: "83OP33920",
    licenseCategories: "B, A",
    licenseIssuedAt: "2003-11-19",
    licenseExpiry: "2028-11-18",
    street: "5 rue Victor Clappier",
    postalCode: "83000",
    city: "Toulon",
    country: "France",
    agencyId: "OF-83",
    vehicleId: "VH-1050",
    status: "actif",
    source: "manuel",
    archived: false,
  },
];

const seedEquipments: Equipment[] = [
  { id: "EQ-DKV-01", type: "carte_dkv", reference: "DKV 7089 4412", expiry: "2027-03-31", vehicleId: "VH-1042", driverId: "CD-2001", archived: false },
  { id: "EQ-DKV-02", type: "carte_dkv", reference: "DKV 7089 5530", expiry: "2027-03-31", vehicleId: "VH-1044", driverId: "CD-2003", archived: false },
  { id: "EQ-DKV-03", type: "carte_dkv", reference: "DKV 7089 6178", expiry: "2026-12-31", vehicleId: null, driverId: null, archived: false },
  { id: "EQ-DKV-04", type: "carte_dkv", reference: "DKV 7089 7043", expiry: "2027-08-31", vehicleId: "VH-1053", driverId: "CD-2007", archived: false },
  { id: "EQ-TOT-01", type: "carte_total", reference: "TE 4410 2286", expiry: "2027-01-31", vehicleId: "VH-1043", driverId: "CD-2002", archived: false },
  { id: "EQ-TOT-02", type: "carte_total", reference: "TE 4410 3390", expiry: "2026-11-30", vehicleId: "VH-1047", driverId: "CD-2005", archived: false },
  { id: "EQ-TOT-03", type: "carte_total", reference: "TE 4410 4025", expiry: "2027-06-30", vehicleId: null, driverId: null, archived: false },
  { id: "EQ-TOT-04", type: "carte_total", reference: "TE 4410 5118", expiry: "2027-04-30", vehicleId: "VH-1050", driverId: "CD-2008", archived: false },
  { id: "EQ-ULY-01", type: "badge_ulys", reference: "ULYS 88 210 447", expiry: "2028-05-31", vehicleId: "VH-1046", driverId: "CD-2004", archived: false },
  { id: "EQ-ULY-02", type: "badge_ulys", reference: "ULYS 88 210 903", expiry: "2028-05-31", vehicleId: "VH-1051", driverId: "CD-2006", archived: false },
  { id: "EQ-ULY-03", type: "badge_ulys", reference: "ULYS 88 211 118", expiry: "2027-09-30", vehicleId: null, driverId: null, archived: false },
  { id: "EQ-ULY-04", type: "badge_ulys", reference: "ULYS 88 211 620", expiry: "2027-09-30", vehicleId: "VH-1042", driverId: "CD-2001", archived: false },
];

export type AssignmentInput = {
  vehicleId: string;
  driverId: string | null;
  agencyId: string;
  equipmentIds: string[];
};

export type NewVehicleInput = {
  plate: string;
  brand: string;
  model: string;
  category: Vehicle["category"];
  energy: Vehicle["energy"];
  agencyId: string;
  ownership: Vehicle["ownership"];
  km: number;
  monthlyCost: number;
  contractEnd: string;
  nextControl: string;
  nextPollution: string;
  warrantyEnd: string;
  registration: Registration;
  source: "manuel" | "ocr_carte_grise";
};

type FleetContextValue = {
  entities: Entity[];
  agencies: Agency[];
  vehicles: Vehicle[];
  drivers: Driver[];
  equipments: Equipment[];
  rentals: Rental[];
  claims: Claim[];
  fines: Fine[];
  insurancePolicies: InsurancePolicy[];
  leases: Lease[];
  expenses: Expense[];
  history: HistoryEntry[];
  agencyName: (agencyId: string) => string;
  agencyCode: (agencyId: string) => string;
  entityIdOfAgency: (agencyId: string) => string;
  entityName: (entityId: string) => string;
  driverName: (driverId: string | null) => string;
  driverOfVehicle: (vehicleId: string) => Driver | null;
  vehicleLabel: (vehicleId: string | null) => string;
  vehiclePlate: (vehicleId: string | null) => string;
  equipmentsOfVehicle: (vehicleId: string) => Equipment[];
  equipmentsOfDriver: (driverId: string) => Equipment[];
  addDriver: (driver: Omit<Driver, "id" | "vehicleId" | "archived">) => Driver;
  updateDriver: (id: string, patch: Partial<Driver>) => void;
  addVehicle: (input: NewVehicleInput) => Vehicle;
  applyAssignment: (input: AssignmentInput) => void;
  toggleVehicleArchive: (id: string) => void;
  toggleDriverArchive: (id: string) => void;
  addEquipment: (input: Omit<Equipment, "id" | "archived">) => Equipment;
  toggleEquipmentArchive: (id: string) => void;
  addRental: (input: Omit<Rental, "id" | "archived">) => Rental;
  toggleRentalArchive: (id: string) => void;
  addClaim: (input: Omit<Claim, "id" | "archived">) => Claim;
  updateClaim: (id: string, patch: Partial<Claim>) => void;
  toggleClaimArchive: (id: string) => void;
  addFine: (input: Omit<Fine, "id" | "archived">) => Fine;
  updateFine: (id: string, patch: Partial<Fine>) => void;
  toggleFineArchive: (id: string) => void;
  addPolicy: (input: Omit<InsurancePolicy, "id" | "archived">) => InsurancePolicy;
  togglePolicyArchive: (id: string) => void;
  addLease: (input: Omit<Lease, "id" | "archived">) => Lease;
  toggleLeaseArchive: (id: string) => void;

};

const FleetContext = createContext<FleetContextValue | null>(null);

const today = () => new Date().toISOString().slice(0, 10);

export function FleetProvider({ children }: { children: ReactNode }) {
  const [entities] = useState<Entity[]>(() => seedEntities.map((e) => ({ ...e })));
  const [agencies] = useState<Agency[]>(() => seedAgencies.map((a) => ({ ...a })));
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => seedVehicles.map((v) => ({ ...v })));
  const [drivers, setDrivers] = useState<Driver[]>(() => seedDrivers.map((d) => ({ ...d })));
  const [equipments, setEquipments] = useState<Equipment[]>(() => seedEquipments.map((e) => ({ ...e })));
  const [rentals, setRentals] = useState<Rental[]>(() => seedRentals.map((r) => ({ ...r })));
  const [claims, setClaims] = useState<Claim[]>(() => seedClaims.map((c) => ({ ...c })));
  const [fines, setFines] = useState<Fine[]>(() => seedFines.map((f) => ({ ...f })));
  const [insurancePolicies, setPolicies] = useState<InsurancePolicy[]>(() =>
    seedPolicies.map((p) => ({ ...p })),
  );
  const [leases, setLeases] = useState<Lease[]>(() => seedLeases.map((l) => ({ ...l })));

  const [expenses] = useState<Expense[]>(() => seedExpenses);
  const [history, setHistory] = useState<HistoryEntry[]>(() => [
    {
      id: "H-1",
      date: "2026-08-04",
      user: "Nicolas Raclet",
      module: "Affectations",
      action: "Affectation",
      detail: "Badge Ulys ULYS 88 210 447 rattaché à GH-604-LM (Nadia Fournier)",
    },
    {
      id: "H-2",
      date: "2026-06-30",
      user: "Nicolas Raclet",
      module: "Parc véhicules",
      action: "Archivage",
      detail: "DA-556-HK (Fiat Ducato) sorti du parc et archivé",
    },
  ]);

  const agencyName = useCallback(
    (agencyId: string) => agencies.find((a) => a.id === agencyId)?.name ?? "—",
    [agencies],
  );

  const agencyCode = useCallback(
    (agencyId: string) => agencies.find((a) => a.id === agencyId)?.code ?? "—",
    [agencies],
  );

  const entityIdOfAgency = useCallback(
    (agencyId: string) => agencies.find((a) => a.id === agencyId)?.entityId ?? "",
    [agencies],
  );

  const entityName = useCallback(
    (entityId: string) => entities.find((e) => e.id === entityId)?.name ?? "—",
    [entities],
  );

  const driverName = useCallback(
    (driverId: string | null) => {
      if (!driverId) return "Non affecté";
      const driver = drivers.find((d) => d.id === driverId);
      return driver ? `${driver.firstName} ${driver.lastName}` : "Non affecté";
    },
    [drivers],
  );

  const driverOfVehicle = useCallback(
    (vehicleId: string) => drivers.find((d) => d.vehicleId === vehicleId) ?? null,
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

  const vehiclePlate = useCallback(
    (vehicleId: string | null) => {
      if (!vehicleId) return "—";
      return vehicles.find((v) => v.id === vehicleId)?.plate ?? "—";
    },
    [vehicles],
  );

  const equipmentsOfVehicle = useCallback(
    (vehicleId: string) => equipments.filter((e) => e.vehicleId === vehicleId),
    [equipments],
  );

  const equipmentsOfDriver = useCallback(
    (driverId: string) => equipments.filter((e) => e.driverId === driverId),
    [equipments],
  );

  const log = useCallback((module: string, action: string, detail: string) => {
    setHistory((prev) => [
      { id: `H-${Date.now()}-${prev.length}`, date: today(), user: "Nicolas Raclet", module, action, detail },
      ...prev,
    ]);
  }, []);

  const addDriver = useCallback(
    (input: Omit<Driver, "id" | "vehicleId" | "archived">) => {
      const driver: Driver = {
        ...input,
        id: `CD-${2100 + Math.floor(Math.random() * 800)}`,
        vehicleId: null,
        archived: false,
      };
      setDrivers((prev) => [driver, ...prev]);
      log(
        "Conducteurs",
        "Création conducteur",
        `${driver.firstName} ${driver.lastName} créé (${
          input.source === "ocr_permis" ? "reconnaissance du permis" : "saisie manuelle"
        })`,
      );
      return driver;
    },
    [log],
  );

  const updateDriver = useCallback(
    (id: string, patch: Partial<Driver>) => {
      setDrivers((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)));
      log("Conducteurs", "Mise à jour conducteur", `Fiche ${id} modifiée`);
    },
    [log],
  );

  const addVehicle = useCallback(
    (input: NewVehicleInput) => {
      const vehicle: Vehicle = {
        id: `VH-${1100 + Math.floor(Math.random() * 800)}`,
        plate: input.plate,
        brand: input.brand,
        model: input.model,
        category: input.category,
        energy: input.energy,
        agencyId: input.agencyId,
        status: "en_service",
        ownership: input.ownership,
        km: input.km,
        monthlyCost: input.monthlyCost,
        contractEnd: input.contractEnd || "—",
        nextControl: input.nextControl || "—",
        nextPollution: input.nextPollution || "—",
        warrantyEnd: input.warrantyEnd || "—",
        registration: input.registration,
        archived: false,
        alerts: [],
      };
      setVehicles((prev) => [vehicle, ...prev]);
      log(
        "Parc véhicules",
        "Création véhicule",
        `${vehicle.brand} ${vehicle.model} · ${vehicle.plate} créé (${
          input.source === "ocr_carte_grise" ? "carte grise analysée" : "saisie manuelle"
        })`,
      );
      return vehicle;
    },
    [log],
  );

  const applyAssignment = useCallback(
    ({ vehicleId, driverId, agencyId, equipmentIds }: AssignmentInput) => {
      const agency = agencies.find((a) => a.id === agencyId);
      const driver = driverId ? drivers.find((d) => d.id === driverId) ?? null : null;
      const fullName = driver ? `${driver.firstName} ${driver.lastName}` : null;
      const plate = vehicles.find((v) => v.id === vehicleId)?.plate ?? vehicleId;

      // Module Véhicules — rattachement à l'agence
      setVehicles((prev) => prev.map((v) => (v.id === vehicleId ? { ...v, agencyId } : v)));

      // Module Conducteurs — un véhicule = un conducteur
      setDrivers((prev) =>
        prev.map((d) => {
          if (driverId && d.id === driverId) return { ...d, vehicleId, agencyId };
          if (d.vehicleId === vehicleId && d.id !== driverId) return { ...d, vehicleId: null };
          return d;
        }),
      );

      // Module Équipements — cartes DKV / TotalEnergies + badge Ulys
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
        "Affectations",
        "Affectation",
        `${plate} → ${fullName ?? "aucun conducteur"} · agence ${agency?.code ?? "—"}${
          equipmentRefs.length ? ` · ${equipmentRefs.join(", ")}` : " · aucun équipement"
        }`,
      );
    },
    [agencies, drivers, equipments, vehicles, log],
  );

  const toggleVehicleArchive = useCallback(
    (id: string) => {
      setVehicles((prev) => prev.map((v) => (v.id === id ? { ...v, archived: !v.archived } : v)));
      const vehicle = vehicles.find((v) => v.id === id);
      log(
        "Parc véhicules",
        vehicle?.archived ? "Désarchivage" : "Archivage",
        `${vehicle?.plate ?? id} ${vehicle?.archived ? "remis dans le parc actif" : "archivé"}`,
      );
    },
    [vehicles, log],
  );

  const toggleDriverArchive = useCallback(
    (id: string) => {
      setDrivers((prev) => prev.map((d) => (d.id === id ? { ...d, archived: !d.archived } : d)));
      const driver = drivers.find((d) => d.id === id);
      log(
        "Conducteurs",
        driver?.archived ? "Désarchivage" : "Archivage",
        `${driver ? `${driver.firstName} ${driver.lastName}` : id} ${
          driver?.archived ? "réactivé" : "archivé"
        }`,
      );
    },
    [drivers, log],
  );

  const newId = (prefix: string) => `${prefix}-${Math.floor(Math.random() * 9000 + 1000)}`;

  const addEquipment = useCallback(
    (input: Omit<Equipment, "id" | "archived">) => {
      const item: Equipment = { ...input, id: newId("EQ"), archived: false };
      setEquipments((prev) => [item, ...prev]);
      log("Équipements", "Création", `${equipmentLabels[item.type]} ${item.reference} créé`);
      return item;
    },
    [log],
  );

  const toggleEquipmentArchive = useCallback(
    (id: string) => {
      setEquipments((prev) => prev.map((e) => (e.id === id ? { ...e, archived: !e.archived } : e)));
      log("Équipements", "Archivage", `Équipement ${id} basculé`);
    },
    [log],
  );

  const addRental = useCallback(
    (input: Omit<Rental, "id" | "archived">) => {
      const item: Rental = { ...input, id: newId("LOC"), archived: false };
      setRentals((prev) => [item, ...prev]);
      log("Locations", "Création", `Location ${item.plate} (${item.supplier}) créée`);
      return item;
    },
    [log],
  );

  const toggleRentalArchive = useCallback(
    (id: string) => {
      setRentals((prev) => prev.map((r) => (r.id === id ? { ...r, archived: !r.archived } : r)));
      log("Locations", "Archivage", `Location ${id} basculée`);
    },
    [log],
  );

  const addClaim = useCallback(
    (input: Omit<Claim, "id" | "archived">) => {
      const item: Claim = { ...input, id: newId("SIN"), archived: false };
      setClaims((prev) => [item, ...prev]);
      log("Sinistres", "Déclaration", `Sinistre ${item.plate} — ${item.nature}`);
      return item;
    },
    [log],
  );

  const updateClaim = useCallback(
    (id: string, patch: Partial<Claim>) => {
      setClaims((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
      log("Sinistres", "Mise à jour", `Dossier ${id} modifié`);
    },
    [log],
  );

  const toggleClaimArchive = useCallback(
    (id: string) => {
      setClaims((prev) => prev.map((c) => (c.id === id ? { ...c, archived: !c.archived } : c)));
      log("Sinistres", "Archivage", `Sinistre ${id} basculé`);
    },
    [log],
  );

  const addFine = useCallback(
    (input: Omit<Fine, "id" | "archived">) => {
      const item: Fine = { ...input, id: newId("CTR"), archived: false };
      setFines((prev) => [item, ...prev]);
      log("Contraventions", "Création", `Contravention ${item.plate} — ${item.nature}`);
      return item;
    },
    [log],
  );

  const updateFine = useCallback(
    (id: string, patch: Partial<Fine>) => {
      setFines((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
      log("Contraventions", "Mise à jour", `Contravention ${id} — ${patch.status ?? "modifiée"}`);
    },
    [log],
  );

  const toggleFineArchive = useCallback(
    (id: string) => {
      setFines((prev) => prev.map((f) => (f.id === id ? { ...f, archived: !f.archived } : f)));
      log("Contraventions", "Archivage", `Contravention ${id} basculée`);
    },
    [log],
  );

  const addPolicy = useCallback(
    (input: Omit<InsurancePolicy, "id" | "archived">) => {
      const item: InsurancePolicy = { ...input, id: newId("ASS"), archived: false };
      setPolicies((prev) => [item, ...prev]);
      log("Assurances", "Création", `Contrat ${item.insurer} ${item.policyNumber}`);
      return item;
    },
    [log],
  );

  const togglePolicyArchive = useCallback(
    (id: string) => {
      setPolicies((prev) => prev.map((p) => (p.id === id ? { ...p, archived: !p.archived } : p)));
      log("Assurances", "Archivage", `Contrat ${id} basculé`);
    },
    [log],
  );

  const addLease = useCallback(
    (input: Omit<Lease, "id" | "archived">) => {
      const item: Lease = { ...input, id: newId("CB"), archived: false };
      setLeases((prev) => [item, ...prev]);
      log("Crédits-baux", "Création", `${item.type === "loa" ? "LOA" : "Crédit-bail"} ${item.plate}`);
      return item;
    },
    [log],
  );

  const toggleLeaseArchive = useCallback(
    (id: string) => {
      setLeases((prev) => prev.map((l) => (l.id === id ? { ...l, archived: !l.archived } : l)));
      log("Crédits-baux", "Archivage", `Contrat ${id} basculé`);
    },
    [log],
  );


  const value = useMemo<FleetContextValue>(
    () => ({
      entities,
      agencies,
      vehicles,
      drivers,
      equipments,
      rentals,
      claims,
      fines,
      insurancePolicies,
      leases,
      expenses,
      history,
      agencyName,
      agencyCode,
      entityIdOfAgency,
      entityName,
      driverName,
      driverOfVehicle,
      vehicleLabel,
      vehiclePlate,
      equipmentsOfVehicle,
      equipmentsOfDriver,
      addDriver,
      updateDriver,
      addVehicle,
      applyAssignment,
      toggleVehicleArchive,
      toggleDriverArchive,
    }),
    [
      entities,
      agencies,
      vehicles,
      drivers,
      equipments,
      rentals,
      claims,
      fines,
      insurancePolicies,
      leases,
      expenses,
      history,
      agencyName,
      agencyCode,
      entityIdOfAgency,
      entityName,
      driverName,
      driverOfVehicle,
      vehicleLabel,
      vehiclePlate,
      equipmentsOfVehicle,
      equipmentsOfDriver,
      addDriver,
      updateDriver,
      addVehicle,
      applyAssignment,
      toggleVehicleArchive,
      toggleDriverArchive,
    ],
  );

  return <FleetContext.Provider value={value}>{children}</FleetContext.Provider>;
}

export function useFleet() {
  const context = useContext(FleetContext);
  if (!context) throw new Error("useFleet doit être utilisé dans un FleetProvider");
  return context;
}
