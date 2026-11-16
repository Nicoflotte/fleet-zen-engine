import { useState } from "react";
import { Pencil } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { driverStatusLabels, useFleet, type Driver, type DriverStatus } from "@/lib/fleet-store";

const textFields = [
  ["firstName", "Prénom", "text"],
  ["lastName", "Nom", "text"],
  ["email", "E-mail", "email"],
  ["phone", "Téléphone", "tel"],
  ["birthDate", "Date de naissance", "date"],
  ["licenseNumber", "N° de permis", "text"],
  ["licenseCategories", "Catégories", "text"],
  ["licenseIssuedAt", "Délivré le", "date"],
  ["licenseExpiry", "Validité du permis", "date"],
  ["street", "Adresse", "text"],
  ["postalCode", "Code postal", "text"],
  ["city", "Ville", "text"],
  ["country", "Pays", "text"],
] as const;

export function DriverEditDialog({ driver }: { driver: Driver }) {
  const { agencies, updateDriver } = useFleet();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Driver>(driver);

  const save = () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      toast.error("Le prénom et le nom sont obligatoires");
      return;
    }
    const { id: _id, vehicleId: _v, archived: _a, ...patch } = form;
    updateDriver(driver.id, patch);
    toast.success("Conducteur modifié");
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (o) setForm(driver);
        setOpen(o);
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Pencil /> Modifier
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Modifier le conducteur</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          {textFields.map(([key, label, type]) => (
            <div key={key} className="space-y-1">
              <Label htmlFor={`dr-${key}`}>{label}</Label>
              <Input
                id={`dr-${key}`}
                type={type}
                value={String(form[key] ?? "")}
                onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
              />
            </div>
          ))}
          <div className="space-y-1">
            <Label>Agence</Label>
            <Select value={form.agencyId} onValueChange={(v) => setForm((p) => ({ ...p, agencyId: v }))}>
              <SelectTrigger aria-label="Agence"><SelectValue /></SelectTrigger>
              <SelectContent>
                {agencies.map((a) => (
                  <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Statut</Label>
            <Select
              value={form.status}
              onValueChange={(v) => setForm((p) => ({ ...p, status: v as DriverStatus }))}
            >
              <SelectTrigger aria-label="Statut"><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(driverStatusLabels) as DriverStatus[]).map((s) => (
                  <SelectItem key={s} value={s}>{driverStatusLabels[s]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
          <Button onClick={save}>Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
