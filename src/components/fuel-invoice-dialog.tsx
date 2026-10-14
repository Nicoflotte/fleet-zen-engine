import { useMemo, useState } from "react";
import { AlertTriangle, FileUp, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fileToDataUrl } from "@/lib/export-csv";
import { useFleet } from "@/lib/fleet-store";
import type { Expense } from "@/lib/fleet-data";
import { findDuplicateInvoices, type InvoiceCandidate } from "@/lib/invoice-duplicates";
import { scanDocument } from "@/lib/ocr.functions";

const NONE = "__none__";
const digits = (s: string) => s.replace(/\D/g, "");
const normPlate = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, "");

type Form = {
  supplier: string;
  invoiceNumber: string;
  cardNumber: string;
  date: string;
  category: "carburant" | "peages";
  liters: string;
  amountHt: string;
  amountTtc: string;
  vehicleId: string;
  driverId: string;
  entityId: string;
};

const empty = (): Form => ({
  supplier: "",
  invoiceNumber: "",
  cardNumber: "",
  date: new Date().toISOString().slice(0, 10),
  category: "carburant",
  liters: "",
  amountHt: "",
  amountTtc: "",
  vehicleId: NONE,
  driverId: NONE,
  entityId: NONE,
});

export function FuelInvoiceDialog() {
  const { vehicles, drivers, equipments, entities, entityIdOfAgency, expenses, vehicleLabel, driverName, addExpense } =
    useFleet();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Form>(empty);
  const [busy, setBusy] = useState(false);
  const [fileName, setFileName] = useState("");
  const [detected, setDetected] = useState<Set<string>>(new Set());
  const [match, setMatch] = useState("");
  const [duplicates, setDuplicates] = useState<Expense[]>([]);
  const [overrideDuplicate, setOverrideDuplicate] = useState(false);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => {
    setForm((p) => ({ ...p, [k]: v }));
    if (duplicates.length > 0) {
      setDuplicates([]);
      setOverrideDuplicate(false);
    }
  };

  const vehicleOptions = useMemo(() => vehicles.filter((v) => !(v as { archived?: boolean }).archived), [vehicles]);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    if (!/^(image\/|application\/pdf)/.test(file.type)) {
      toast.error("Formats acceptés : PDF ou image");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Fichier trop volumineux (10 Mo max)");
      return;
    }
    setFileName(file.name);
    setBusy(true);
    try {
      let dataUrls: string[];
      let pdfInfo: { pageCount: number; truncated: boolean } | null = null;
      if (file.type === "application/pdf") {
        const { pdfToDataUrls } = await import("@/lib/pdf-to-images");
        const result = await pdfToDataUrls(file);
        dataUrls = result.dataUrls;
        pdfInfo = { pageCount: result.pageCount, truncated: result.truncated };
      } else {
        dataUrls = [await fileToDataUrl(file)];
      }
      const { fields } = await scanDocument({ data: { kind: "facture_carburant", dataUrls } });
      const next = { ...form };
      const found = new Set<string>();
      const put = (k: keyof Form, v?: string) => {
        if (v && v.trim()) {
          (next as Record<string, string>)[k] = v.trim();
          found.add(k);
        }
      };
      put("supplier", fields["supplier"]);
      put("invoiceNumber", fields["invoiceNumber"]);
      put("cardNumber", digits(fields["cardNumber"] ?? ""));
      if (/^\d{4}-\d{2}-\d{2}$/.test(fields["date"] ?? "")) put("date", fields["date"]);
      if (fields["category"] === "peages" || fields["category"] === "carburant") put("category", fields["category"]);
      put("liters", fields["liters"]);
      put("amountHt", fields["amountHt"]);
      put("amountTtc", fields["amountTtc"]);

      // Rapprochement : carte -> équipement -> véhicule / conducteur / société
      const card = next.cardNumber;
      const eq = card
        ? equipments.find((e) => {
            const ref = digits(e.reference);
            return ref.length >= 4 && (card.endsWith(ref) || ref.endsWith(card) || card === ref);
          })
        : undefined;
      let vehicleId = eq?.vehicleId ?? null;
      let how = eq ? `carte ${eq.reference}` : "";
      if (!vehicleId && fields["plate"]) {
        const v = vehicles.find((x) => normPlate(x.plate) === normPlate(fields["plate"] ?? ""));
        if (v) {
          vehicleId = v.id;
          how = `immatriculation ${v.plate}`;
        }
      }
      if (vehicleId) {
        next.vehicleId = vehicleId;
        found.add("vehicleId");
        const v = vehicles.find((x) => x.id === vehicleId);
        if (v) {
          next.entityId = entityIdOfAgency(v.agencyId);
          found.add("entityId");
        }
      }
      const driverId = eq?.driverId ?? (vehicleId ? equipments.find((e) => e.vehicleId === vehicleId && e.driverId)?.driverId : null);
      if (driverId) {
        next.driverId = driverId;
        found.add("driverId");
      }
      setForm(next);
      setDetected(found);
      setMatch(how ? `Véhicule reconnu via ${how}.` : "Aucun véhicule reconnu : choisis-le ci-dessous.");
      toast.success("Facture analysée — vérifie les champs avant d'enregistrer");
      if (pdfInfo?.truncated) {
        toast.warning(
          `PDF de ${pdfInfo.pageCount} pages : seules les ${dataUrls.length} premières pages sont analysées`,
        );
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Analyse impossible");
    } finally {
      setBusy(false);
    }
  };

  const submit = () => {
    const ttc = Number(form.amountTtc.replace(",", "."));
    if (!Number.isFinite(ttc) || ttc <= 0) {
      toast.error("Montant TTC obligatoire");
      return;
    }
    if (form.entityId === NONE) {
      toast.error("Société obligatoire");
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.date)) {
      toast.error("Date obligatoire");
      return;
    }
    const num = (s: string) => Number(s.replace(",", "."));
    const candidate: InvoiceCandidate = {
      supplier: form.supplier,
      invoiceNumber: form.invoiceNumber,
      date: form.date,
      amount: ttc,
    };
    const found = findDuplicateInvoices(expenses, candidate);
    if (found.length > 0 && !overrideDuplicate) {
      setDuplicates(found);
      setOverrideDuplicate(false);
      toast.warning("Facture potentiellement identique déjà enregistrée — vérifie le doublon");
      return;
    }
    addExpense({
      month: form.date.slice(0, 7),
      date: form.date,
      entityId: form.entityId,
      type: form.category,
      amount: ttc,
      ...(form.amountHt ? { amountHt: num(form.amountHt) } : {}),
      ...(form.liters ? { liters: num(form.liters) } : {}),
      ...(form.supplier ? { supplier: form.supplier } : {}),
      ...(form.invoiceNumber ? { invoiceNumber: form.invoiceNumber } : {}),
      ...(form.cardNumber ? { cardNumber: form.cardNumber } : {}),
      vehicleId: form.vehicleId === NONE ? null : form.vehicleId,
      driverId: form.driverId === NONE ? null : form.driverId,
    });
    toast.success("Dépense enregistrée");
    reset();
    setOpen(false);
  };

  const reset = () => {
    setForm(empty());
    setDetected(new Set());
    setMatch("");
    setFileName("");
    setDuplicates([]);
    setOverrideDuplicate(false);
  };

  const mark = (k: string) => (detected.has(k) ? "border-primary/60 bg-primary/5" : "");
  const tag = (k: string) =>
    detected.has(k) ? <span className="ml-1 text-[10px] font-medium uppercase text-primary">détecté</span> : null;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm">
          <FileUp /> Déposer une facture
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Facture carburant / péage</DialogTitle>
          <DialogDescription>
            Dépose un PDF ou une photo : l'IA lit la facture et retrouve le véhicule grâce au n° de carte. Vérifie puis
            valide.
          </DialogDescription>
        </DialogHeader>

        <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-border p-5 text-center text-sm hover:bg-muted/40">
          {busy ? <Loader2 className="size-5 animate-spin" /> : <Sparkles className="size-5 text-primary" />}
          <span className="font-medium">{busy ? "Analyse en cours…" : fileName || "Choisir une facture (PDF, JPG, PNG)"}</span>
          <input
            aria-label="Fichier facture"
            type="file"
            accept="application/pdf,image/*"
            className="sr-only"
            disabled={busy}
            onChange={(e) => {
              void onFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </label>
        {match && <p className="text-xs text-muted-foreground">{match}</p>}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Fournisseur" k="supplier" tag={tag}>
            <Input className={mark("supplier")} value={form.supplier} onChange={(e) => set("supplier", e.target.value)} />
          </Field>
          <Field label="N° de facture" k="invoiceNumber" tag={tag}>
            <Input
              className={mark("invoiceNumber")}
              value={form.invoiceNumber}
              onChange={(e) => set("invoiceNumber", e.target.value)}
            />
          </Field>
          <Field label="N° de carte / badge" k="cardNumber" tag={tag}>
            <Input className={mark("cardNumber")} value={form.cardNumber} onChange={(e) => set("cardNumber", e.target.value)} />
          </Field>
          <Field label="Date" k="date" tag={tag}>
            <Input type="date" className={mark("date")} value={form.date} onChange={(e) => set("date", e.target.value)} />
          </Field>
          <Field label="Type de dépense" k="category" tag={tag}>
            <Select value={form.category} onValueChange={(v) => set("category", v as Form["category"])}>
              <SelectTrigger className={mark("category")}><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="carburant">Carburant</SelectItem>
                <SelectItem value="peages">Péages</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Litres" k="liters" tag={tag}>
            <Input inputMode="decimal" className={mark("liters")} value={form.liters} onChange={(e) => set("liters", e.target.value)} />
          </Field>
          <Field label="Montant HT (€)" k="amountHt" tag={tag}>
            <Input inputMode="decimal" className={mark("amountHt")} value={form.amountHt} onChange={(e) => set("amountHt", e.target.value)} />
          </Field>
          <Field label="Montant TTC (€) *" k="amountTtc" tag={tag}>
            <Input inputMode="decimal" className={mark("amountTtc")} value={form.amountTtc} onChange={(e) => set("amountTtc", e.target.value)} />
          </Field>
          <Field label="Véhicule" k="vehicleId" tag={tag}>
            <Select
              value={form.vehicleId}
              onValueChange={(v) => {
                const veh = vehicles.find((x) => x.id === v);
                setForm((p) => ({ ...p, vehicleId: v, entityId: veh ? entityIdOfAgency(veh.agencyId) : p.entityId }));
              }}
            >
              <SelectTrigger className={mark("vehicleId")}><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>— Aucun —</SelectItem>
                {vehicleOptions.map((v) => (
                  <SelectItem key={v.id} value={v.id}>{v.plate} — {v.brand} {v.model}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Conducteur" k="driverId" tag={tag}>
            <Select value={form.driverId} onValueChange={(v) => set("driverId", v)}>
              <SelectTrigger className={mark("driverId")}><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>— Aucun —</SelectItem>
                {drivers.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.firstName} {d.lastName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Société *" k="entityId" tag={tag}>
            <Select value={form.entityId} onValueChange={(v) => set("entityId", v)}>
              <SelectTrigger className={mark("entityId")}><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>— Choisir —</SelectItem>
                {entities.map((e) => (
                  <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        {duplicates.length > 0 && (
          <div className="mt-2 space-y-3 rounded-lg border border-warning/40 bg-warning/10 p-3">
            <p className="flex items-start gap-2 text-sm font-medium text-warning-foreground">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <span>
                Doublon potentiel : {duplicates.length} facture(s) déjà enregistrée(s) avec le même fournisseur, la
                même date et le même montant TTC.
              </span>
            </p>
            <ul className="space-y-1.5">
              {duplicates.map((e) => (
                <li key={e.id} className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{e.supplier || "—"}</span>
                  {e.date ? ` · ${e.date}` : ""}
                  {` · ${e.amount.toFixed(2)} €`}
                  {e.invoiceNumber ? ` · n° ${e.invoiceNumber}` : ""}
                  {e.vehicleId ? ` · ${vehicleLabel(e.vehicleId)}` : ""}
                  {e.driverId ? ` · ${driverName(e.driverId)}` : ""}
                </li>
              ))}
            </ul>
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
              <Checkbox
                checked={overrideDuplicate}
                onCheckedChange={(c) => setOverrideDuplicate(c === true)}
              />
              J'autorise l'enregistrement malgré ce doublon
            </label>
          </div>
        )}

        <DialogFooter className="mt-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>Annuler</Button>
          <Button onClick={submit} disabled={busy}>Valider et enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  k,
  tag,
  children,
}: {
  label: string;
  k: string;
  tag: (k: string) => React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>
        {label}
        {tag(k)}
      </Label>
      {children}
    </div>
  );
}
