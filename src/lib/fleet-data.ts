// ---------------------------------------------------------------------------
// Référentiel FleetManager AI — données de démonstration
// ---------------------------------------------------------------------------

export type VehicleStatus = "en_service" | "atelier" | "immobilise" | "a_restituer" | "commande";

export type VehicleCategory = "VP" | "VU" | "2ROUES";

export type Ownership = "propriete" | "loa" | "credit_bail";

export type Registration = {
  vin: string;
  firstRegistration: string;
  nomenclature: string; // D.2 — code national d'identification du type
  formulaNumber: string; // I — n° de formule de la carte grise
  ptac: number; // F.2 — poids total autorisé en charge (kg)
  emptyWeight: number; // G.1 — poids à vide / hors charge (kg)
  power: number; // P.6 — puissance administrative (CV)
  powerKw: number; // P.2 — puissance nette maximale (kW)
  seats: number; // S.1 — nombre de places assises
  co2: number; // V.7 — g/km
  body: string; // J.1 — carrosserie
};

export type Vehicle = {
  id: string;
  plate: string;
  brand: string;
  model: string;
  category: VehicleCategory;
  energy: "Diesel" | "Essence" | "Hybride" | "Électrique";
  agencyId: string;
  status: VehicleStatus;
  ownership: Ownership;
  km: number;
  monthlyCost: number;
  contractEnd: string;
  nextControl: string;
  nextPollution: string;
  warrantyEnd: string;
  registration: Registration;
  archived: boolean;
  alerts: string[];
};

export type Entity = {
  id: string;
  code: string;
  name: string;
};

export type Agency = {
  id: string;
  code: string;
  name: string;
  city: string;
  postalCode: string;
  entityId: string;
  manager: string;
};

export const statusLabels: Record<VehicleStatus, string> = {
  en_service: "En service",
  atelier: "En atelier",
  immobilise: "Immobilisé",
  a_restituer: "À restituer",
  commande: "En commande",
};

export const statusTone: Record<VehicleStatus, string> = {
  en_service: "bg-success/15 text-success-foreground border-success/30",
  atelier: "bg-warning/20 text-warning-foreground border-warning/40",
  immobilise: "bg-destructive/12 text-destructive border-destructive/30",
  a_restituer: "bg-info/15 text-info border-info/30",
  commande: "bg-muted text-muted-foreground border-border",
};

export const categoryLabels: Record<VehicleCategory, string> = {
  VP: "VP — véhicule particulier",
  VU: "VU — véhicule utilitaire",
  "2ROUES": "2 roues",
};

export const ownershipLabels: Record<Ownership, string> = {
  propriete: "Propriété",
  loa: "LOA",
  credit_bail: "Crédit-bail",
};

// --- Entités ---------------------------------------------------------------

export const entities: Entity[] = [
  { id: "MET", code: "METALUMINE", name: "METALUMINE" },
  { id: "ODESA", code: "ODESA", name: "Omnium Désamiantage" },
  { id: "ODEV", code: "ODEV", name: "Omnium Développement" },
  { id: "OF", code: "SIP / OF", name: "SIP / Omnium Façades" },
  { id: "SATE", code: "SATE", name: "SATE" },
  { id: "SEE", code: "SEE", name: "Sud Est Étanchéité" },
  { id: "TCE", code: "TCE", name: "Omnium Solution TCE" },
  { id: "VENTRE", code: "VENTRE", name: "Entreprise Ventre" },
];

export const agencies: Agency[] = [
  { id: "MET-06", code: "MET 06", name: "METALUMINE Vallauris", city: "Vallauris", postalCode: "06220", entityId: "MET", manager: "Hélène Vasseur" },
  { id: "ODESA-06", code: "ODESA 06", name: "ODESA Vallauris", city: "Vallauris", postalCode: "06220", entityId: "ODESA", manager: "Marc Ifrah" },
  { id: "ODEV-06", code: "ODEV 06", name: "ODEV Vallauris", city: "Vallauris", postalCode: "06220", entityId: "ODEV", manager: "Julie Ferrand" },
  { id: "OF-06", code: "OF 06", name: "Omnium Façades Vallauris", city: "Vallauris", postalCode: "06220", entityId: "OF", manager: "Damien Roux" },
  { id: "OF-11", code: "OF 11", name: "Omnium Façades Narbonne", city: "Narbonne", postalCode: "11100", entityId: "OF", manager: "Sonia Attia" },
  { id: "OF-13", code: "OF 13", name: "Omnium Façades Marseille", city: "Marseille", postalCode: "13015", entityId: "OF", manager: "Franck Delmas" },
  { id: "OF-34", code: "OF 34", name: "Omnium Façades Castries", city: "Castries", postalCode: "34160", entityId: "OF", manager: "Laure Mestre" },
  { id: "OF-83", code: "OF 83", name: "Omnium Façades Toulon", city: "Toulon", postalCode: "83000", entityId: "OF", manager: "Yves Cottin" },
  { id: "SATE-06", code: "SATE 06", name: "SATE Vallauris", city: "Vallauris", postalCode: "06220", entityId: "SATE", manager: "Nadège Kruger" },
  { id: "SATE-13", code: "SATE 13", name: "SATE Marseille", city: "Marseille", postalCode: "13011", entityId: "SATE", manager: "Olivier Pons" },
  { id: "SEE-06", code: "SEE 06", name: "Sud Est Étanchéité Vallauris", city: "Vallauris", postalCode: "06220", entityId: "SEE", manager: "Céline Barré" },
  { id: "SEE-13", code: "SEE 13", name: "Sud Est Étanchéité Marseille", city: "Marseille", postalCode: "13014", entityId: "SEE", manager: "Rachid Amrani" },
  { id: "SEE-34", code: "SEE 34", name: "Sud Est Étanchéité Castries", city: "Castries", postalCode: "34160", entityId: "SEE", manager: "Paul Vidal" },
  { id: "SEE-83", code: "SEE 83", name: "Sud Est Étanchéité Toulon", city: "Toulon", postalCode: "83200", entityId: "SEE", manager: "Marion Estève" },
  { id: "TCE-06", code: "TCE 06", name: "Omnium Solution TCE Vallauris", city: "Vallauris", postalCode: "06220", entityId: "TCE", manager: "Bruno Lelièvre" },
  { id: "TCE-13", code: "TCE 13", name: "Omnium Solution TCE Marseille", city: "Marseille", postalCode: "13008", entityId: "TCE", manager: "Karine Nadaud" },
  { id: "VENTRE-06", code: "VENTRE 06", name: "Entreprise Ventre Vallauris", city: "Vallauris", postalCode: "06220", entityId: "VENTRE", manager: "Serge Ventre" },
  { id: "VENTRE-13", code: "VENTRE 13", name: "Entreprise Ventre Marseille", city: "Marseille", postalCode: "13003", entityId: "VENTRE", manager: "Amélie Grivot" },
];

// --- Parc (hors locations) -------------------------------------------------

const reg = (
  vin: string,
  firstRegistration: string,
  nomenclature: string,
  formulaNumber: string,
  ptac: number,
  emptyWeight: number,
  power: number,
  powerKw: number,
  seats: number,
  co2: number,
  body: string,
): Registration => ({
  vin,
  firstRegistration,
  nomenclature,
  formulaNumber,
  ptac,
  emptyWeight,
  power,
  powerKw,
  seats,
  co2,
  body,
});

export const vehicles: Vehicle[] = [
  {
    id: "VH-1042",
    plate: "GF-472-KD",
    brand: "Renault",
    model: "Kangoo E-Tech",
    category: "VU",
    energy: "Électrique",
    agencyId: "OF-06",
    status: "en_service",
    ownership: "loa",
    km: 48210,
    monthlyCost: 612,
    contractEnd: "2027-04-30",
    nextControl: "2026-11-12",
    nextPollution: "2026-11-12",
    warrantyEnd: "2027-03-01",
    registration: reg("VF1FW0ZBX67891234", "2023-03-14", "MRE1234A567", "2023AB12345", 2130, 1710, 5, 90, 2, 0, "CTTE FOURGON"),
    archived: false,
    alerts: [],
  },
  {
    id: "VH-1043",
    plate: "FT-208-QW",
    brand: "Peugeot",
    model: "308 SW",
    category: "VP",
    energy: "Hybride",
    agencyId: "OF-13",
    status: "en_service",
    ownership: "credit_bail",
    km: 91455,
    monthlyCost: 548,
    contractEnd: "2026-09-15",
    nextControl: "2026-08-28",
    nextPollution: "2026-08-28",
    warrantyEnd: "2026-09-10",
    registration: reg("VF3LRHNSXHS512877", "2021-09-02", "MPE9087B221", "2021CD98120", 2050, 1495, 7, 133, 5, 118, "CI BREAK"),
    archived: false,
    alerts: ["Contrôle technique dans 16 jours", "Fin de crédit-bail dans 34 jours"],
  },
  {
    id: "VH-1044",
    plate: "EY-991-BC",
    brand: "Ford",
    model: "Transit Custom",
    category: "VU",
    energy: "Diesel",
    agencyId: "SEE-13",
    status: "atelier",
    ownership: "propriete",
    km: 164920,
    monthlyCost: 874,
    contractEnd: "—",
    nextControl: "2027-01-20",
    nextPollution: "2026-09-20",
    warrantyEnd: "2025-06-30",
    registration: reg("WF0YXXTTGYJP44120", "2019-06-25", "MFO4410C118", "2019EF44120", 3000, 1980, 8, 96, 3, 178, "CTTE FOURGON"),
    archived: false,
    alerts: ["Immobilisation atelier > 5 jours", "Contrôle pollution dans 38 jours"],
  },
  {
    id: "VH-1045",
    plate: "GA-115-ZR",
    brand: "Toyota",
    model: "Corolla TS",
    category: "VP",
    energy: "Hybride",
    agencyId: "SATE-13",
    status: "a_restituer",
    ownership: "loa",
    km: 118300,
    monthlyCost: 501,
    contractEnd: "2026-08-31",
    nextControl: "2026-10-04",
    nextPollution: "2026-10-04",
    warrantyEnd: "2026-08-31",
    registration: reg("SB1KZ3JE10E118300", "2022-08-19", "MTO1183D904", "2022GH11830", 1905, 1420, 6, 90, 5, 102, "CI BREAK"),
    archived: false,
    alerts: ["Restitution à planifier", "Nouvelle carte grise à établir en fin de LOA"],
  },
  {
    id: "VH-1046",
    plate: "GH-604-LM",
    brand: "Volkswagen",
    model: "ID.4",
    category: "VP",
    energy: "Électrique",
    agencyId: "MET-06",
    status: "en_service",
    ownership: "loa",
    km: 22740,
    monthlyCost: 735,
    contractEnd: "2028-02-10",
    nextControl: "2027-05-18",
    nextPollution: "2027-05-18",
    warrantyEnd: "2028-02-10",
    registration: reg("WVGZZZE2ZMP022740", "2024-02-11", "MVW6041E330", "2024IJ60410", 2530, 2124, 9, 150, 5, 0, "CI BERLINE"),
    archived: false,
    alerts: [],
  },
  {
    id: "VH-1047",
    plate: "DR-330-XN",
    brand: "Citroën",
    model: "Jumpy",
    category: "VU",
    energy: "Diesel",
    agencyId: "TCE-13",
    status: "immobilise",
    ownership: "propriete",
    km: 201480,
    monthlyCost: 928,
    contractEnd: "—",
    nextControl: "2026-09-02",
    nextPollution: "2026-09-02",
    warrantyEnd: "2022-04-30",
    registration: reg("VF7VFAHXMHZ201480", "2016-04-08", "MCI3302F007", "2016KL33020", 2900, 1745, 7, 88, 3, 165, "CTTE FOURGON"),
    archived: false,
    alerts: ["Sinistre en cours — expertise attendue", "Coût maintenance +42 % vs catégorie"],
  },
  {
    id: "VH-1048",
    plate: "En attente",
    brand: "Renault",
    model: "Master",
    category: "VU",
    energy: "Diesel",
    agencyId: "SEE-83",
    status: "commande",
    ownership: "credit_bail",
    km: 0,
    monthlyCost: 0,
    contractEnd: "2031-01-01",
    nextControl: "—",
    nextPollution: "—",
    warrantyEnd: "2029-09-22",
    registration: reg("—", "—", "—", "—", 3500, 2100, 10, 121, 3, 195, "CTTE FOURGON"),
    archived: false,
    alerts: ["Livraison prévue le 22/09/2026"],
  },
  {
    id: "VH-1049",
    plate: "FQ-712-VT",
    brand: "Dacia",
    model: "Duster",
    category: "VP",
    energy: "Essence",
    agencyId: "VENTRE-13",
    status: "en_service",
    ownership: "propriete",
    km: 76210,
    monthlyCost: 466,
    contractEnd: "—",
    nextControl: "2026-12-09",
    nextPollution: "2026-12-09",
    warrantyEnd: "2026-10-15",
    registration: reg("UU1HSDCVN60762100", "2021-10-16", "MDA7121G552", "2021MN71210", 1930, 1290, 6, 96, 5, 145, "CI BREAK"),
    archived: false,
    alerts: ["Fin de garantie dans 63 jours"],
  },
  {
    id: "VH-1050",
    plate: "GK-889-TR",
    brand: "Yamaha",
    model: "Tricity 300",
    category: "2ROUES",
    energy: "Essence",
    agencyId: "OF-83",
    status: "en_service",
    ownership: "propriete",
    km: 9140,
    monthlyCost: 118,
    contractEnd: "—",
    nextControl: "2027-04-02",
    nextPollution: "2027-04-02",
    warrantyEnd: "2027-04-02",
    registration: reg("JYARN2300PA009140", "2025-04-03", "MYA8890H114", "2025OP88900", 460, 239, 4, 20, 2, 96, "MOTOCYCLE"),
    archived: false,
    alerts: [],
  },
  {
    id: "VH-1051",
    plate: "GB-540-SD",
    brand: "Piaggio",
    model: "MP3 400",
    category: "2ROUES",
    energy: "Essence",
    agencyId: "SATE-06",
    status: "en_service",
    ownership: "propriete",
    km: 15620,
    monthlyCost: 96,
    contractEnd: "—",
    nextControl: "2027-01-14",
    nextPollution: "2027-01-14",
    warrantyEnd: "2026-11-30",
    registration: reg("ZAPM8600009015620", "2024-11-15", "MPI5401I228", "2024QR54010", 505, 262, 4, 26, 2, 104, "MOTOCYCLE"),
    archived: false,
    alerts: [],
  },
  {
    id: "VH-1052",
    plate: "FL-330-PB",
    brand: "Peugeot",
    model: "Partner",
    category: "VU",
    energy: "Diesel",
    agencyId: "OF-34",
    status: "en_service",
    ownership: "credit_bail",
    km: 132870,
    monthlyCost: 389,
    contractEnd: "2026-10-31",
    nextControl: "2026-09-27",
    nextPollution: "2026-09-27",
    warrantyEnd: "2025-12-31",
    registration: reg("VF3EFBHWKKN133287", "2020-12-04", "MPE3301J776", "2020ST33010", 2210, 1435, 6, 96, 3, 148, "CTTE FOURGON"),
    archived: false,
    alerts: ["Fin de crédit-bail dans 79 jours", "Contrôle technique dans 45 jours"],
  },
  {
    id: "VH-1053",
    plate: "EQ-118-NC",
    brand: "Renault",
    model: "Clio IV",
    category: "VP",
    energy: "Essence",
    agencyId: "OF-11",
    status: "en_service",
    ownership: "propriete",
    km: 187430,
    monthlyCost: 244,
    contractEnd: "—",
    nextControl: "2026-08-24",
    nextPollution: "2026-08-24",
    warrantyEnd: "2021-03-31",
    registration: reg("VF15RPN0H54118743", "2017-03-20", "MRE1181K339", "2017UV11810", 1585, 1090, 5, 66, 5, 120, "CI BERLINE"),
    archived: false,
    alerts: ["Contrôle technique dans 12 jours"],
  },
  {
    id: "VH-1054",
    plate: "DA-556-HK",
    brand: "Fiat",
    model: "Ducato",
    category: "VU",
    energy: "Diesel",
    agencyId: "SEE-34",
    status: "en_service",
    ownership: "propriete",
    km: 243110,
    monthlyCost: 512,
    contractEnd: "—",
    nextControl: "2026-09-18",
    nextPollution: "2026-09-18",
    warrantyEnd: "2020-05-31",
    registration: reg("ZFA25000002431100", "2015-05-21", "MFI5561L440", "2015WX55610", 3500, 2050, 9, 96, 3, 210, "CTTE FOURGON"),
    archived: true,
    alerts: ["Véhicule archivé — sorti du parc le 30/06/2026"],
  },
  {
    id: "VH-1055",
    plate: "GC-201-JF",
    brand: "Ford",
    model: "Ranger",
    category: "VU",
    energy: "Diesel",
    agencyId: "TCE-06",
    status: "en_service",
    ownership: "loa",
    km: 41220,
    monthlyCost: 690,
    contractEnd: "2027-11-30",
    nextControl: "2027-05-06",
    nextPollution: "2027-05-06",
    warrantyEnd: "2027-05-06",
    registration: reg("WF0AXXTTGAKR41220", "2024-05-07", "MFO2011M551", "2024YZ20110", 3270, 2210, 11, 151, 5, 224, "CTTE PICK-UP"),
    archived: false,
    alerts: [],
  },
];

// --- Locations (hors parc) -------------------------------------------------

export type Rental = {
  id: string;
  plate: string;
  brand: string;
  model: string;
  category: VehicleCategory;
  supplier: string;
  agencyId: string;
  driverName: string | null;
  start: string;
  end: string;
  monthlyCost: number;
  status: "en_cours" | "a_restituer" | "terminee";
  archived: boolean;
};

export const rentals: Rental[] = [
  { id: "LOC-301", plate: "GJ-410-WB", brand: "Renault", model: "Clio V", category: "VP", supplier: "Ayvens", agencyId: "OF-13", driverName: "Sophie Lemaire", start: "2026-05-02", end: "2026-11-01", monthlyCost: 418, status: "en_cours", archived: false },
  { id: "LOC-302", plate: "GD-772-QA", brand: "Peugeot", model: "Boxer", category: "VU", supplier: "Petit Forestier", agencyId: "SEE-13", driverName: null, start: "2026-07-15", end: "2026-09-14", monthlyCost: 890, status: "en_cours", archived: false },
  { id: "LOC-303", plate: "GG-118-KE", brand: "Toyota", model: "Yaris Cross", category: "VP", supplier: "Arval", agencyId: "SATE-06", driverName: "Claire Ober", start: "2026-02-01", end: "2026-08-31", monthlyCost: 455, status: "a_restituer", archived: false },
  { id: "LOC-304", plate: "FZ-604-MN", brand: "Citroën", model: "Berlingo", category: "VU", supplier: "Ayvens", agencyId: "OF-34", driverName: "Yanis Dorval", start: "2025-11-01", end: "2026-04-30", monthlyCost: 402, status: "terminee", archived: true },
  { id: "LOC-305", plate: "GH-903-LD", brand: "Volkswagen", model: "Golf", category: "VP", supplier: "Arval", agencyId: "MET-06", driverName: "Nadia Fournier", start: "2026-06-10", end: "2027-06-09", monthlyCost: 512, status: "en_cours", archived: false },
];

// --- Sinistres -------------------------------------------------------------

export type Claim = {
  id: string;
  date: string;
  plate: string;
  driverName: string | null;
  agencyId: string;
  nature: string;
  responsibility: "engagee" | "non_engagee" | "en_cours";
  cost: number;
  status: "declare" | "expertise" | "reparation" | "clos";
  insurer: string;
  archived: boolean;
};

export const claims: Claim[] = [
  { id: "SIN-501", date: "2026-08-01", plate: "DR-330-XN", driverName: "Bruno Sanchez", agencyId: "TCE-13", nature: "Collision arrière sur parking", responsibility: "en_cours", cost: 3120, status: "expertise", insurer: "AXA Flotte", archived: false },
  { id: "SIN-502", date: "2026-07-12", plate: "EY-991-BC", driverName: "Yanis Dorval", agencyId: "SEE-13", nature: "Bris de glace", responsibility: "non_engagee", cost: 480, status: "reparation", insurer: "AXA Flotte", archived: false },
  { id: "SIN-503", date: "2026-06-03", plate: "FT-208-QW", driverName: "Sophie Lemaire", agencyId: "OF-13", nature: "Choc mobilier urbain", responsibility: "engagee", cost: 1780, status: "clos", insurer: "Allianz", archived: false },
  { id: "SIN-504", date: "2026-03-22", plate: "FQ-712-VT", driverName: "Claire Ober", agencyId: "VENTRE-13", nature: "Vol d'outillage", responsibility: "non_engagee", cost: 2240, status: "clos", insurer: "AXA Flotte", archived: true },
];

// --- Contraventions --------------------------------------------------------

export type Fine = {
  id: string;
  date: string;
  plate: string;
  driverName: string | null;
  agencyId: string;
  nature: string;
  amount: number;
  status: "a_designer" | "designe" | "payee" | "contestee";
  antaiReference: string;
  archived: boolean;
};

export const fines: Fine[] = [
  { id: "CTR-701", date: "2026-08-05", plate: "FT-208-QW", driverName: "Sophie Lemaire", agencyId: "OF-13", nature: "Excès de vitesse < 20 km/h", amount: 45, status: "a_designer", antaiReference: "ANTAI-2026-778120", archived: false },
  { id: "CTR-702", date: "2026-07-28", plate: "GF-472-KD", driverName: "Karim Belhadj", agencyId: "OF-06", nature: "Stationnement gênant", amount: 35, status: "designe", antaiReference: "ANTAI-2026-771904", archived: false },
  { id: "CTR-703", date: "2026-07-04", plate: "GH-604-LM", driverName: "Nadia Fournier", agencyId: "MET-06", nature: "Franchissement ligne continue", amount: 135, status: "payee", antaiReference: "ANTAI-2026-760455", archived: false },
  { id: "CTR-704", date: "2026-05-19", plate: "EQ-118-NC", driverName: "Élodie Marchand", agencyId: "OF-11", nature: "Défaut de péage", amount: 90, status: "contestee", antaiReference: "ANTAI-2026-742088", archived: false },
];

// --- Assurances ------------------------------------------------------------

export type PolicyStatus = "active" | "a_renouveler" | "resilie" | "echeance";

export const policyStatusLabels: Record<PolicyStatus, string> = {
  active: "Active",
  a_renouveler: "À renouveler",
  resilie: "Résiliée",
  echeance: "Échéance",
};

export type InsurancePolicy = {
  id: string;
  insurer: string;
  policyNumber: string;
  entityId: string;
  scope: string;
  vehicles: number;
  annualPremium: number;
  renewal: string;
  status: PolicyStatus;
  archived: boolean;
};

export const insurancePolicies: InsurancePolicy[] = [
  { id: "ASS-01", insurer: "AXA Flotte", policyNumber: "AX-4471-882", entityId: "OF", scope: "Flotte VP + VU", vehicles: 64, annualPremium: 78400, renewal: "2026-12-31", status: "active", archived: false },
  { id: "ASS-02", insurer: "Allianz", policyNumber: "AL-2210-117", entityId: "SEE", scope: "Flotte VU", vehicles: 38, annualPremium: 51200, renewal: "2027-03-31", status: "active", archived: false },
  { id: "ASS-03", insurer: "AXA Flotte", policyNumber: "AX-4471-902", entityId: "SATE", scope: "Flotte VP + 2 roues", vehicles: 22, annualPremium: 24800, renewal: "2026-10-31", status: "a_renouveler", archived: false },
  { id: "ASS-04", insurer: "Generali", policyNumber: "GE-8890-441", entityId: "MET", scope: "Flotte VP", vehicles: 12, annualPremium: 16900, renewal: "2027-01-31", status: "active", archived: false },
  { id: "ASS-05", insurer: "Allianz", policyNumber: "AL-2210-330", entityId: "TCE", scope: "Flotte VU", vehicles: 17, annualPremium: 22600, renewal: "2026-11-30", status: "echeance", archived: false },
];

// --- Crédits-baux / LOA ----------------------------------------------------

export type LeaseStatus = "en_cours" | "a_terme" | "solde" | "resilie";

export const leaseStatusLabels: Record<LeaseStatus, string> = {
  en_cours: "En cours",
  a_terme: "Arrive à terme",
  solde: "Soldé",
  resilie: "Résilié",
};

export type Lease = {
  id: string;
  plate: string;
  vehicleLabel: string;
  lender: string;
  type: "loa" | "credit_bail";
  entityId: string;
  monthlyRent: number;
  start: string;
  end: string;
  remainingMonths: number;
  residualValue: number;
  status: LeaseStatus;
  archived: boolean;
};

export const leases: Lease[] = [
  { id: "CB-901", plate: "FT-208-QW", vehicleLabel: "Peugeot 308 SW", lender: "BNP Leasing", type: "credit_bail", entityId: "OF", monthlyRent: 548, start: "2021-09-15", end: "2026-09-15", remainingMonths: 1, residualValue: 4200, status: "a_terme", archived: false },
  { id: "CB-902", plate: "FL-330-PB", vehicleLabel: "Peugeot Partner", lender: "BNP Leasing", type: "credit_bail", entityId: "OF", monthlyRent: 389, start: "2020-11-01", end: "2026-10-31", remainingMonths: 2, residualValue: 2600, status: "a_terme", archived: false },
  { id: "CB-903", plate: "GF-472-KD", vehicleLabel: "Renault Kangoo E-Tech", lender: "Mobilize FS", type: "loa", entityId: "OF", monthlyRent: 612, start: "2023-04-01", end: "2027-04-30", remainingMonths: 9, residualValue: 8100, status: "en_cours", archived: false },
  { id: "CB-904", plate: "GA-115-ZR", vehicleLabel: "Toyota Corolla TS", lender: "Toyota Financial", type: "loa", entityId: "SATE", monthlyRent: 501, start: "2022-08-19", end: "2026-08-31", remainingMonths: 0, residualValue: 6400, status: "solde", archived: false },
  { id: "CB-905", plate: "GH-604-LM", vehicleLabel: "Volkswagen ID.4", lender: "VW Financial", type: "loa", entityId: "MET", monthlyRent: 735, start: "2024-02-11", end: "2028-02-10", remainingMonths: 18, residualValue: 12900, status: "en_cours", archived: false },
  { id: "CB-906", plate: "GC-201-JF", vehicleLabel: "Ford Ranger", lender: "Ford Credit", type: "loa", entityId: "TCE", monthlyRent: 690, start: "2024-06-01", end: "2027-11-30", remainingMonths: 15, residualValue: 10400, status: "en_cours", archived: false },
];

// --- Dépenses par types ----------------------------------------------------

export type ExpenseType = "carburant" | "entretien" | "pneumatiques" | "peages" | "loyers" | "divers";

export const expenseTypeLabels: Record<ExpenseType, string> = {
  carburant: "Carburant & énergie",
  entretien: "Entretien & réparations",
  pneumatiques: "Pneumatiques",
  peages: "Péages & stationnement",
  loyers: "Loyers (LOA / crédit-bail)",
  divers: "Divers",
};

export type Expense = {
  id: string;
  month: string; // YYYY-MM
  entityId: string;
  type: ExpenseType;
  amount: number;
};

const expenseSeeds: Record<ExpenseType, number> = {
  carburant: 4100,
  entretien: 2600,
  pneumatiques: 900,
  peages: 620,
  loyers: 5400,
  divers: 380,
};

const entityWeights: Record<string, number> = {
  MET: 0.8,
  ODESA: 0.6,
  ODEV: 0.4,
  OF: 1.9,
  SATE: 1.1,
  SEE: 1.6,
  TCE: 0.9,
  VENTRE: 0.7,
};

// Génération déterministe (aucun aléatoire) des 18 derniers mois de dépenses.
function buildExpenses(): Expense[] {
  const rows: Expense[] = [];
  const months: string[] = [];
  for (let year = 2025; year <= 2026; year += 1) {
    for (let month = 1; month <= 12; month += 1) {
      months.push(`${year}-${String(month).padStart(2, "0")}`);
    }
  }
  months.forEach((month, monthIndex) => {
    entities.forEach((entity, entityIndex) => {
      (Object.keys(expenseSeeds) as ExpenseType[]).forEach((type, typeIndex) => {
        const seasonal = 1 + ((monthIndex + typeIndex * 3) % 7) / 22;
        const drift = 1 + (entityIndex % 4) / 30;
        const amount = Math.round(
          expenseSeeds[type] * (entityWeights[entity.id] ?? 1) * seasonal * drift,
        );
        rows.push({ id: `EXP-${month}-${entity.id}-${type}`, month, entityId: entity.id, type, amount });
      });
    });
  });
  return rows;
}

export const expenses: Expense[] = buildExpenses();

export const monthLabels = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

export const availableYears = [2025, 2026];

// --- Recommandations IA ----------------------------------------------------

export type AiSuggestion = {
  title: string;
  detail: string;
  confidence: number;
  impact: string;
};

export const aiSuggestions: AiSuggestion[] = [
  {
    title: "Renouveler DR-330-XN plutôt que réparer",
    detail:
      "201 480 km, 3 immobilisations en 6 mois et un coût maintenance supérieur de 42 % à sa catégorie. Le remplacement est amorti en 11 mois.",
    confidence: 0.92,
    impact: "≈ 4 200 € / an",
  },
  {
    title: "Anticiper la fin de crédit-bail FT-208-QW",
    detail:
      "Échéance au 15/09/2026 avec valeur résiduelle de 4 200 €. Le rachat est plus économique que la relocation sur cette catégorie VP.",
    confidence: 0.86,
    impact: "≈ 2 900 € économisés",
  },
  {
    title: "Désigner le conducteur de CTR-701 sur l'ANTAI",
    detail:
      "Contravention du 05/08/2026 non désignée. L'adresse postale du conducteur est renseignée : la désignation peut être générée.",
    confidence: 0.94,
    impact: "Évite la majoration à 180 €",
  },
];

// --- Formatage -------------------------------------------------------------

export const currency = (value: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);

export const number = (value: number) => new Intl.NumberFormat("fr-FR").format(value);

export const shortDate = (value: string) =>
  !value || value === "—"
    ? "—"
    : new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(value));

export const daysUntil = (value: string) => {
  if (!value || value === "—") return null;
  return Math.round((new Date(value).getTime() - Date.now()) / 86_400_000);
};
