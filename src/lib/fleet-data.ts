export type VehicleStatus = "en_service" | "atelier" | "immobilise" | "a_restituer" | "commande";

export type Vehicle = {
  id: string;
  plate: string;
  brand: string;
  model: string;
  category: string;
  energy: "Diesel" | "Essence" | "Hybride" | "Électrique";
  agency: string;
  driver: string | null;
  status: VehicleStatus;
  km: number;
  monthlyCost: number;
  contractEnd: string;
  nextControl: string;
  alerts: string[];
};

export const statusLabels: Record<VehicleStatus, string> = {
  en_service: "En service",
  atelier: "En atelier",
  immobilise: "Immobilisé",
  a_restituer: "À restituer",
  commande: "En commande",
};

export const vehicles: Vehicle[] = [
  {
    id: "VH-1042",
    plate: "GF-472-KD",
    brand: "Renault",
    model: "Kangoo E-Tech",
    category: "Utilitaire léger",
    energy: "Électrique",
    agency: "Lyon Est",
    driver: "Karim Belhadj",
    status: "en_service",
    km: 48210,
    monthlyCost: 612,
    contractEnd: "2027-04-30",
    nextControl: "2026-11-12",
    alerts: [],
  },
  {
    id: "VH-1043",
    plate: "FT-208-QW",
    brand: "Peugeot",
    model: "308 SW",
    category: "Berline",
    energy: "Hybride",
    agency: "Paris Nord",
    driver: "Sophie Lemaire",
    status: "en_service",
    km: 91455,
    monthlyCost: 548,
    contractEnd: "2026-09-15",
    nextControl: "2026-08-28",
    alerts: ["Contrôle technique dans 16 jours", "Fin de contrat dans 34 jours"],
  },
  {
    id: "VH-1044",
    plate: "EY-991-BC",
    brand: "Ford",
    model: "Transit Custom",
    category: "Fourgon",
    energy: "Diesel",
    agency: "Bordeaux",
    driver: "Yanis Dorval",
    status: "atelier",
    km: 164920,
    monthlyCost: 874,
    contractEnd: "2026-12-01",
    nextControl: "2027-01-20",
    alerts: ["Immobilisation atelier > 5 jours"],
  },
  {
    id: "VH-1045",
    plate: "GA-115-ZR",
    brand: "Toyota",
    model: "Corolla TS",
    category: "Berline",
    energy: "Hybride",
    agency: "Lille",
    driver: null,
    status: "a_restituer",
    km: 118300,
    monthlyCost: 501,
    contractEnd: "2026-08-31",
    nextControl: "2026-10-04",
    alerts: ["Restitution à planifier", "Km contractuels dépassés (+8 300 km)"],
  },
  {
    id: "VH-1046",
    plate: "GH-604-LM",
    brand: "Volkswagen",
    model: "ID.4",
    category: "SUV",
    energy: "Électrique",
    agency: "Lyon Est",
    driver: "Nadia Fournier",
    status: "en_service",
    km: 22740,
    monthlyCost: 735,
    contractEnd: "2028-02-10",
    nextControl: "2027-05-18",
    alerts: [],
  },
  {
    id: "VH-1047",
    plate: "DR-330-XN",
    brand: "Citroën",
    model: "Jumpy",
    category: "Fourgon",
    energy: "Diesel",
    agency: "Marseille",
    driver: "Bruno Sanchez",
    status: "immobilise",
    km: 201480,
    monthlyCost: 928,
    contractEnd: "2026-10-22",
    nextControl: "2026-09-02",
    alerts: ["Sinistre en cours — expertise attendue", "Coût maintenance +42 % vs catégorie"],
  },
  {
    id: "VH-1048",
    plate: "En attente",
    brand: "Renault",
    model: "Master",
    category: "Fourgon",
    energy: "Diesel",
    agency: "Paris Nord",
    driver: null,
    status: "commande",
    km: 0,
    monthlyCost: 0,
    contractEnd: "2030-01-01",
    nextControl: "—",
    alerts: ["Livraison prévue le 22/09/2026"],
  },
  {
    id: "VH-1049",
    plate: "FQ-712-VT",
    brand: "Dacia",
    model: "Duster",
    category: "SUV",
    energy: "Essence",
    agency: "Bordeaux",
    driver: "Claire Ober",
    status: "en_service",
    km: 76210,
    monthlyCost: 466,
    contractEnd: "2027-06-30",
    nextControl: "2026-12-09",
    alerts: [],
  },
];

export const kpis = [
  { label: "Véhicules actifs", value: "182", delta: "+4 ce mois", tone: "neutral" as const },
  { label: "Coût mensuel flotte", value: "104 380 €", delta: "-2,1 % vs M-1", tone: "positive" as const },
  { label: "Taux d'immobilisation", value: "4,3 %", delta: "+0,8 pt", tone: "negative" as const },
  { label: "Documents à valider", value: "17", delta: "9 pré-classés par l'IA", tone: "neutral" as const },
];

export const costBreakdown = [
  { label: "Location longue durée", amount: 48210, share: 46 },
  { label: "Carburant & énergie", amount: 24870, share: 24 },
  { label: "Maintenance & pneus", amount: 15960, share: 15 },
  { label: "Assurances & sinistres", amount: 9420, share: 9 },
  { label: "Péages & divers", amount: 5920, share: 6 },
];

export type AiSuggestion = {
  title: string;
  detail: string;
  confidence: number;
  impact: string;
};

export const aiSuggestions: AiSuggestion[] = [
  {
    title: "Renouveler VH-1047 plutôt que réparer",
    detail:
      "201 480 km, 3 immobilisations en 6 mois et un coût maintenance supérieur de 42 % à sa catégorie. Le remplacement est amorti en 11 mois.",
    confidence: 0.92,
    impact: "≈ 4 200 € / an",
  },
  {
    title: "Reclasser 9 factures DKV importées",
    detail:
      "L'analyse documentaire a rattaché 9 factures carburant à leurs véhicules et détecté 2 pleins hors plage horaire habituelle.",
    confidence: 0.87,
    impact: "2 anomalies à contrôler",
  },
  {
    title: "Anticiper 6 fins de contrat T4",
    detail:
      "6 contrats arrivent à échéance avant le 31/12. Une commande groupée sur la catégorie Berline sécurise les délais constructeur.",
    confidence: 0.78,
    impact: "Délai livraison -7 semaines",
  },
];

export const alerts = [
  { level: "critique" as const, label: "Sinistre VH-1047 sans expertise depuis 12 jours", owner: "Assurances" },
  { level: "eleve" as const, label: "Contrôle technique FT-208-QW dans 16 jours", owner: "Maintenance" },
  { level: "eleve" as const, label: "Restitution GA-115-ZR à planifier", owner: "Parc" },
  { level: "moyen" as const, label: "Dépassement km contractuels sur 3 véhicules", owner: "Contrats" },
  { level: "moyen" as const, label: "5 permis de conduire non revalidés", owner: "Conducteurs" },
];

export const statusTone: Record<VehicleStatus, string> = {
  en_service: "bg-success/15 text-success-foreground border-success/30",
  atelier: "bg-warning/20 text-warning-foreground border-warning/40",
  immobilise: "bg-destructive/12 text-destructive border-destructive/30",
  a_restituer: "bg-info/15 text-info border-info/30",
  commande: "bg-muted text-muted-foreground border-border",
};

export const currency = (value: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);

export const number = (value: number) => new Intl.NumberFormat("fr-FR").format(value);

export const shortDate = (value: string) =>
  value === "—" ? "—" : new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(value));
