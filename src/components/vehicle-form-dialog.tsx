import { useRef, useState } from "react";
import { CarFront, Loader2, Plus, ScanLine } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fileToDataUrl } from "@/lib/export-csv";
import type { VehicleCategory } from "@/lib/fleet-data";
import { useFleet } from "@/lib/fleet-store";
import { scanDocument } from "@/lib/ocr.functions";

type FormState = {
  plate: string;
  brand: string;
  model: string;
  category: VehicleCategory;
  energy: "Diesel" | "Essence" | "Hybride" | "Électrique";
  agencyId: string;
  ownership: "propriete" | "loa" | "credit_bail";
  km: string;
  monthlyCost: string;
  contractEnd: string;
  nextControl: string;
  nextPollution: string;
  warrantyEnd: string;
  vin: string;
  firstRegistration: string;
  nomenclature: string;
  formulaNumber: string;
  ptac: string;
  emptyWeight: string;
  power: string;
  powerKw: string;
  seats: string;
  co2: string;
  body: string;
};

const empty = (agencyId: string): FormState => ({
  plate: "",
  brand: "",
  model: "",
  category: "VP",
  energy: "Diesel",
  agencyId,
  ownership: "propriete",
  km: "0",
  monthlyCost: "0",
  contractEnd: "",
  nextControl: "",
  nextPollution: "",
  warrantyEnd: "",
  vin: "",
  firstRegistration: "",
  nomenclature: "",
  formulaNumber: "",
  ptac: "",
  emptyWeight: "",
  power: "",
  powerKw: "",
  seats: "",
  co2: "",
  body: "",
});

const num = (value: string) => {
  const parsed = Number(String(value).replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
};

export function VehicleFormDialog() {
  const { agencies, addVehicle } = useFleet();
  const [open, setOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [form, setForm] = useState<FormState>(() => empty(agencies[0]!.id));
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setForm(empty(agencies[0]!.id));
    setScanned(false);
    setScanning(false);
  };

  const runScan = async (file: File) => {
    setScanning(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      const { fields } = await scanDocument({ data: { kind: "carte_grise", dataUrl } });
      setForm((prev) => {
        const next = { ...prev };
        const put = (key: keyof FormState, value?: string) => {
          if (value && String(value).trim()) next[key] = value as never;
        };
        put("plate", fields["plate"]);
        put("brand", fields["brand"]);
        put("model", fields["model"]);
        put("vin", fields["vin"]);
        put("firstRegistration", fields["firstRegistration"]);
        put("nomenclature", fields["nomenclature"]);
        put("formulaNumber", fields["formulaNumber"]);
        put("ptac", fields["ptac"]);
        put("emptyWeight", fields["emptyWeight"]);
        put("power", fields["power"]);
        put("powerKw", fields["powerKw"]);
        put("seats", fields["seats"]);
        put("co2", fields["co2"]);
        put("body", fields["body"]);
        const energy = fields["energy"];
        if (energy && ["Diesel", "Essence", "Hybride", "Électrique"].includes(energy)) {
          next.energy = energy as FormState["energy"];
        }
        const category = fields["category"];
        if (category && ["VP", "VU", "2ROUES"].includes(category)) {
          next.category = category as VehicleCategory;
        }
        return next;
      });
      setScanned(true);
      toast.success("Carte grise analysée", {
        description: "Champs pré-remplis — relisez avant validation.",
      });
    } catch (error) {
      toast.error("Analyse impossible", {
        description: error instanceof Error ? error.message : "Réessayez ou saisissez manuellement.",
      });
    } finally {
      setScanning(false);
    }
  };

  const submit = () => {
    if (!form.plate.trim() || !form.brand.trim() || !form.model.trim()) {
      toast.error("Immatriculation, marque et modèle sont obligatoires");
      return;
    }
    const vehicle = addVehicle({
      plate: form.plate.trim().toUpperCase(),
      brand: form.brand.trim(),
      model: form.model.trim(),
      category: form.category,
      energy: form.energy,
      agencyId: form.agencyId,
      ownership: form.ownership,
      km: num(form.km),
      monthlyCost: num(form.monthlyCost),
      contractEnd: form.contractEnd,
      nextControl: form.nextControl,
      nextPollution: form.nextPollution,
      warrantyEnd: form.warrantyEnd,
      registration: {
        vin: form.vin,
        firstRegistration: form.firstRegistration,
        nomenclature: form.nomenclature,
        formulaNumber: form.formulaNumber,
        ptac: num(form.ptac),
        emptyWeight: num(form.emptyWeight),
        power: num(form.power),
        powerKw: num(form.powerKw),
        seats: num(form.seats),
        co2: num(form.co2),
        body: form.body,
      },
      source: scanned ? "ocr_carte_grise" : "manuel",
    });
    toast.success(`${vehicle.plate} ajouté au parc`, {
      description: "Affectez agence, conducteur et équipements depuis Affectations.",
    });
    setOpen(false);
    reset();
  };

  const field = (label: string, key: keyof FormState, type = "text", placeholder?: string) => (
    <div className="space-y-1.5">
      <Label htmlFor={`veh-${key}`}>{label}</Label>
      <Input
        id={`veh-${key}`}
        type={type}
        placeholder={placeholder}
        value={String(form[key] ?? "")}
        onChange={(event) => setForm((prev) => ({ ...prev, [key]: event.target.value }))}
      />
    </div>
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus /> Ajouter un véhicule
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Nouveau véhicule</DialogTitle>
          <DialogDescription>
            Scannez la carte grise (photo ou PDF) : l'IA pré-remplit les champs, vous validez.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="scan">
          <TabsList>
            <TabsTrigger value="scan">
              <ScanLine className="size-4" /> Carte grise
            </TabsTrigger>
            <TabsTrigger value="manuel">
              <CarFront className="size-4" /> Saisie manuelle
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scan" className="pt-4">
            <div className="rounded-lg border border-dashed border-border bg-muted/40 p-6 text-center">
              <p className="text-sm font-semibold">Déposez la carte grise (JPG, PNG, PDF)</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Extraction : immatriculation, marque, modèle, VIN, 1re mise en circulation, PTAC, poids
                hors charge, puissance, places, n° de formule et n° de nomenclature.
              </p>
              <input
                ref={fileRef}
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void runScan(file);
                  event.target.value = "";
                }}
              />
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => fileRef.current?.click()}
                disabled={scanning}
              >
                {scanning ? <Loader2 className="animate-spin" /> : <ScanLine />}
                {scanning ? "Analyse en cours…" : "Sélectionner un fichier"}
              </Button>
              {scanned && (
                <p className="mt-3 text-sm font-medium text-success-foreground">
                  Champs pré-remplis ci-dessous — relisez avant validation.
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="manuel" className="pt-4">
            <p className="text-sm text-muted-foreground">Renseignez directement les champs ci-dessous.</p>
          </TabsContent>
        </Tabs>

        <Separator className="my-4" />

        <div className="space-y-5">
          <div>
            <p className="text-sm font-semibold">Identification</p>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              {field("Immatriculation (A)", "plate", "text", "AA-123-BB")}
              {field("Marque (D.1)", "brand")}
              {field("Modèle (D.3)", "model")}
              <div className="space-y-1.5">
                <Label htmlFor="veh-category">Catégorie</Label>
                <Select
                  value={form.category}
                  onValueChange={(value) => setForm((prev) => ({ ...prev, category: value as VehicleCategory }))}
                >
                  <SelectTrigger id="veh-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VP">VP — véhicule particulier</SelectItem>
                    <SelectItem value="VU">VU — véhicule utilitaire</SelectItem>
                    <SelectItem value="2ROUES">2 roues</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="veh-energy">Énergie (P.3)</Label>
                <Select
                  value={form.energy}
                  onValueChange={(value) =>
                    setForm((prev) => ({ ...prev, energy: value as FormState["energy"] }))
                  }
                >
                  <SelectTrigger id="veh-energy">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Diesel", "Essence", "Hybride", "Électrique"].map((value) => (
                      <SelectItem key={value} value={value}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="veh-agency">Agence de rattachement</Label>
                <Select
                  value={form.agencyId}
                  onValueChange={(value) => setForm((prev) => ({ ...prev, agencyId: value }))}
                >
                  <SelectTrigger id="veh-agency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {agencies.map((agency) => (
                      <SelectItem key={agency.id} value={agency.id}>
                        {agency.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold">Carte grise</p>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              {field("VIN (E)", "vin")}
              {field("1re mise en circulation (B)", "firstRegistration", "date")}
              {field("N° de nomenclature (D.2)", "nomenclature")}
              {field("N° de formule (I)", "formulaNumber")}
              {field("PTAC en kg (F.2)", "ptac", "number")}
              {field("Poids hors charge en kg (G.1)", "emptyWeight", "number")}
              {field("Puissance CV (P.6)", "power", "number")}
              {field("Puissance kW (P.2)", "powerKw", "number")}
              {field("Places assises (S.1)", "seats", "number")}
              {field("CO2 g/km (V.7)", "co2", "number")}
              {field("Carrosserie (J.1)", "body")}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold">Détention & échéances</p>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="veh-ownership">Mode de détention</Label>
                <Select
                  value={form.ownership}
                  onValueChange={(value) =>
                    setForm((prev) => ({ ...prev, ownership: value as FormState["ownership"] }))
                  }
                >
                  <SelectTrigger id="veh-ownership">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="propriete">Propriété</SelectItem>
                    <SelectItem value="loa">LOA</SelectItem>
                    <SelectItem value="credit_bail">Crédit-bail</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {field("Kilométrage", "km", "number")}
              {field("Coût mensuel (€)", "monthlyCost", "number")}
              {field("Fin de contrat", "contractEnd", "date")}
              {field("Prochain contrôle technique", "nextControl", "date")}
              {field("Prochain contrôle pollution", "nextPollution", "date")}
              {field("Fin de garantie", "warrantyEnd", "date")}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button onClick={submit}>Créer le véhicule</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
