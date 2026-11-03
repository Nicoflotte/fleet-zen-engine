import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, Car, CreditCard, MapPin, Pencil, Plus, Search, UserRound, Users } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFleet, type Agency } from "@/lib/fleet-store";

export const Route = createFileRoute("/agences")({
  head: () => ({
    meta: [
      { title: "Agences — FleetManager AI" },
      {
        name: "description",
        content: "Agences par société : véhicules, conducteurs et équipements rattachés, modifiables en un clic.",
      },
      { property: "og:title", content: "Agences — FleetManager AI" },
      {
        property: "og:description",
        content: "Vue par société des agences, avec accès direct aux véhicules, conducteurs et équipements.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AgenciesPage,
});

function AgenciesPage() {
  const { entities, agencies, drivers, vehicles, equipments } = useFleet();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Agency | null>(null);
  const [creating, setCreating] = useState(false);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entities
      .map((entity) => ({
        entity,
        agencies: agencies.filter(
          (a) =>
            a.entityId === entity.id &&
            (!q || `${a.name} ${a.code} ${a.city} ${a.manager} ${entity.name}`.toLowerCase().includes(q)),
        ),
      }))
      .filter((g) => g.agencies.length > 0);
  }, [entities, agencies, query]);

  const counts = (id: string) => {
    const v = vehicles.filter((x) => x.agencyId === id && !x.archived);
    const d = drivers.filter((x) => x.agencyId === id && !x.archived);
    const e = equipments.filter(
      (x) =>
        !x.archived &&
        (v.some((y) => y.id === x.vehicleId) || d.some((y) => y.id === x.driverId)),
    );
    return { v: v.length, d: d.length, e: e.length };
  };

  return (
    <>
      <PageHeader
        title="Agences"
        subtitle={`${agencies.length} agences · ${entities.length} sociétés`}
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus className="size-4" /> Nouvelle agence
          </Button>
        }
      />

      <main className="flex-1 space-y-6 px-4 py-6 md:px-8">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une agence, une ville…"
            className="pl-9"
            suppressHydrationWarning
          />
        </div>

        {groups.map(({ entity, agencies: list }) => (
          <section key={entity.id} className="space-y-3">
            <div className="flex items-center gap-2">
              <Building2 className="size-4 text-accent" />
              <h2 className="text-sm font-semibold uppercase tracking-[0.12em]">{entity.name}</h2>
              <span className="text-xs text-muted-foreground">
                {list.length} agence{list.length > 1 ? "s" : ""}
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {list.map((agency) => {
                const c = counts(agency.id);
                return (
                  <article key={agency.id} className="panel flex flex-col gap-4 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{agency.name}</p>
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="size-3" /> {agency.postalCode} {agency.city}
                        </p>
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          <UserRound className="size-3" /> {agency.manager}
                        </p>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label={`Modifier ${agency.name}`}
                        onClick={() => setEditing(agency)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <Tile to="/vehicules" agence={agency.id} icon={Car} label="Véhicules" value={c.v} />
                      <Tile to="/conducteurs" agence={agency.id} icon={Users} label="Conducteurs" value={c.d} />
                      <Tile to="/equipements" agence={agency.id} icon={CreditCard} label="Équipements" value={c.e} />
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ))}
        {groups.length === 0 && <p className="text-sm text-muted-foreground">Aucune agence trouvée.</p>}
      </main>

      <EditAgencyDialog agency={editing} onClose={() => setEditing(null)} />
      <NewAgencyDialog open={creating} onClose={() => setCreating(false)} />
    </>
  );
}

function Tile({
  to,
  agence,
  icon: Icon,
  label,
  value,
}: {
  to: "/vehicules" | "/conducteurs" | "/equipements";
  agence: string;
  icon: typeof Car;
  label: string;
  value: number;
}) {
  return (
    <Link
      to={to}
      search={{ agence }}
      className="rounded-lg border border-border bg-muted/40 p-3 text-center transition-colors hover:border-accent hover:bg-accent/10"
    >
      <Icon className="mx-auto size-4 text-accent" />
      <p className="tabular mt-1 text-lg font-semibold">{value}</p>
      <p className="text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground">{label}</p>
    </Link>
  );
}

function EditAgencyDialog({ agency, onClose }: { agency: Agency | null; onClose: () => void }) {
  const { updateAgency } = useFleet();
  const [form, setForm] = useState<Agency | null>(null);
  const current = form && agency && form.id === agency.id ? form : agency;

  const set = (key: keyof Agency, value: string) =>
    current && setForm({ ...current, [key]: value });

  const save = () => {
    if (!current || !current.name.trim()) {
      toast.error("Le nom est obligatoire");
      return;
    }
    updateAgency(current.id, {
      name: current.name.trim(),
      code: current.code.trim(),
      city: current.city.trim(),
      postalCode: current.postalCode.trim(),
      manager: current.manager.trim(),
    });
    toast.success("Agence modifiée");
    setForm(null);
    onClose();
  };

  return (
    <Dialog open={!!agency} onOpenChange={(o) => !o && (setForm(null), onClose())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier l'agence</DialogTitle>
        </DialogHeader>
        {current && (
          <div className="grid gap-3 sm:grid-cols-2">
            {(
              [
                ["name", "Nom"],
                ["code", "Code court"],
                ["postalCode", "Code postal"],
                ["city", "Ville"],
                ["manager", "Responsable"],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="space-y-1">
                <Label htmlFor={`ag-${key}`}>{label}</Label>
                <Input id={`ag-${key}`} value={current[key]} onChange={(e) => set(key, e.target.value)} />
              </div>
            ))}
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => (setForm(null), onClose())}>
            Annuler
          </Button>
          <Button onClick={save}>Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const EMPTY = { entityId: "", name: "", code: "", postalCode: "", city: "", manager: "" };

function NewAgencyDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { entities, addAgency } = useFleet();
  const [form, setForm] = useState(EMPTY);
  const close = () => (setForm(EMPTY), onClose());

  const save = () => {
    if (!form.entityId) return void toast.error("Choisis la société");
    if (!form.name.trim()) return void toast.error("Le nom est obligatoire");
    addAgency({
      entityId: form.entityId,
      name: form.name.trim(),
      code: form.code.trim(),
      postalCode: form.postalCode.trim(),
      city: form.city.trim(),
      manager: form.manager.trim(),
    });
    toast.success(`Agence « ${form.name.trim()} » créée`);
    close();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && close()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouvelle agence</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1 sm:col-span-2">
            <Label>Société</Label>
            <Select value={form.entityId} onValueChange={(v) => setForm({ ...form, entityId: v })}>
              <SelectTrigger aria-label="Société">
                <SelectValue placeholder="Choisir une société" />
              </SelectTrigger>
              <SelectContent>
                {entities.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {(
            [
              ["name", "Nom"],
              ["code", "Code court"],
              ["postalCode", "Code postal"],
              ["city", "Ville"],
              ["manager", "Responsable"],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="space-y-1">
              <Label htmlFor={`new-${key}`}>{label}</Label>
              <Input id={`new-${key}`} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={close}>
            Annuler
          </Button>
          <Button onClick={save}>Créer l'agence</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
