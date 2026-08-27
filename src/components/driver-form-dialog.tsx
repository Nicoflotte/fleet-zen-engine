import { useRef, useState } from "react";
import { IdCard, Loader2, ScanLine, UserPlus } from "lucide-react";
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
import { useFleet, type Driver } from "@/lib/fleet-store";
import { scanDocument } from "@/lib/ocr.functions";

type FormState = Omit<Driver, "id" | "vehicleId" | "archived">;

const emptyForm = (agencyId: string): FormState => ({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  birthDate: "",
  licenseNumber: "",
  licenseCategories: "B",
  licenseIssuedAt: "",
  licenseExpiry: "",
  street: "",
  postalCode: "",
  city: "",
  country: "France",
  agencyId,
  status: "actif",
  source: "manuel",
});

// Jeu de démonstration, utilisé uniquement par le bouton « permis de démonstration ».
const demoExtraction = {
  firstName: "Lucas",
  lastName: "Perrin",
  birthDate: "1993-04-08",
  licenseNumber: "69PQ84517",
  licenseCategories: "B, BE",
  licenseIssuedAt: "2012-07-16",
  licenseExpiry: "2027-07-15",
  street: "26 rue Sainte-Geneviève",
  postalCode: "69006",
  city: "Lyon",
  country: "France",
};

export function DriverFormDialog() {
  const { agencies, addDriver } = useFleet();
  const [open, setOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [form, setForm] = useState<FormState>(() => emptyForm(agencies[0]!.id));
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (key: keyof FormState) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }) as FormState);

  const reset = () => {
    setForm(emptyForm(agencies[0]!.id));
    setScanned(false);
    setScanning(false);
  };

  const applyFields = (fields: Record<string, string>) => {
    setForm((prev) => {
      const next = { ...prev, source: "ocr_permis" as const };
      (
        [
          "firstName",
          "lastName",
          "birthDate",
          "licenseNumber",
          "licenseCategories",
          "licenseIssuedAt",
          "licenseExpiry",
          "street",
          "postalCode",
          "city",
        ] as const
      ).forEach((key) => {
        const value = fields[key];
        if (value && value.trim()) next[key] = value.trim();
      });
      return next;
    });
  };

  const runRecognition = async (file: File) => {
    setScanning(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      const { fields } = await scanDocument({ data: { kind: "permis", dataUrl } });
      applyFields(fields);
      setScanned(true);
      toast.success("Permis analysé", {
        description: `${file.name} — champs pré-remplis. Vérifiez puis validez.`,
      });
    } catch (error) {
      toast.error("Analyse du permis impossible", {
        description: error instanceof Error ? error.message : "Réessayez ou saisissez manuellement.",
      });
    } finally {
      setScanning(false);
    }
  };

  const useDemo = () => {
    setForm((prev) => ({ ...prev, ...demoExtraction, source: "ocr_permis" }));
    setScanned(true);
    toast.success("Permis de démonstration chargé", {
      description: "10 champs pré-remplis. Vérifiez puis validez.",
    });
  };

  const submit = () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      toast.error("Nom et prénom sont obligatoires");
      return;
    }
    if (!form.postalCode.trim() || !form.city.trim()) {
      toast.error("L'adresse postale (code postal et ville) est obligatoire");
      return;
    }
    const driver = addDriver(form);
    toast.success(`${driver.firstName} ${driver.lastName} ajouté`, {
      description: "Affectez maintenant un véhicule et des équipements depuis Affectations.",
    });
    setOpen(false);
    reset();
  };

  const field = (
    label: string,
    key: keyof FormState,
    type: string = "text",
    placeholder?: string,
  ) => (
    <div className="space-y-1.5">
      <Label htmlFor={`driver-${key}`}>{label}</Label>
      <Input
        id={`driver-${key}`}
        type={type}
        value={String(form[key] ?? "")}
        placeholder={placeholder}
        onChange={(event) => set(key)(event.target.value)}
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
          <UserPlus /> Ajouter un conducteur
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nouveau conducteur</DialogTitle>
          <DialogDescription>
            Saisie manuelle ou reconnaissance du permis de conduire — une seule saisie, les champs se
            pré-remplissent.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="permis">
          <TabsList>
            <TabsTrigger value="permis">
              <ScanLine className="size-4" /> Copie du permis
            </TabsTrigger>
            <TabsTrigger value="manuel">
              <IdCard className="size-4" /> Saisie manuelle
            </TabsTrigger>
          </TabsList>

          <TabsContent value="permis" className="pt-4">
            <div className="rounded-lg border border-dashed border-border bg-muted/40 p-6 text-center">
              <p className="text-sm font-semibold">Déposez la copie du permis (PDF, JPG, PNG)</p>
              <p className="mt-1 text-sm text-muted-foreground">
                La reconnaissance extrait identité, numéro de permis, catégories, dates de validité et
                adresse.
              </p>
              <input
                ref={fileRef}
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void runRecognition(file);
                  event.target.value = "";
                }}
              />
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={scanning}>
                  {scanning ? <Loader2 className="animate-spin" /> : <ScanLine />} Sélectionner un fichier
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={scanning}
                  onClick={useDemo}
                >
                  Utiliser un permis de démonstration
                </Button>
              </div>
              {scanned && (
                <p className="mt-3 text-sm font-medium text-success-foreground">
                  Champs pré-remplis ci-dessous — relisez avant validation.
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="manuel" className="pt-4">
            <p className="text-sm text-muted-foreground">
              Renseignez directement les informations ci-dessous.
            </p>
          </TabsContent>
        </Tabs>

        <Separator className="my-4" />

        <div className="space-y-5">
          <div>
            <p className="text-sm font-semibold">Identité</p>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              {field("Prénom", "firstName")}
              {field("Nom", "lastName")}
              {field("Date de naissance", "birthDate", "date")}
              {field("Téléphone", "phone", "tel", "06 00 00 00 00")}
              {field("E-mail professionnel", "email", "email")}
              <div className="space-y-1.5">
                <Label htmlFor="driver-agency">Agence de rattachement</Label>
                <Select value={form.agencyId} onValueChange={set("agencyId")}>
                  <SelectTrigger id="driver-agency">
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
            <p className="text-sm font-semibold">Permis de conduire</p>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              {field("Numéro de permis", "licenseNumber")}
              {field("Catégories", "licenseCategories", "text", "B, C, EC")}
              {field("Date de délivrance", "licenseIssuedAt", "date")}
              {field("Date de validité", "licenseExpiry", "date")}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold">Adresse postale</p>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">{field("Rue et numéro", "street")}</div>
              {field("Code postal", "postalCode")}
              {field("Ville", "city")}
              {field("Pays", "country")}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button onClick={submit}>Créer le conducteur</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
