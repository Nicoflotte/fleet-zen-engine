import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Archive, ArchiveRestore, Download, Eye, FileUp, Lock, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFleet } from "@/lib/fleet-store";
import { exportCsv } from "@/lib/export-csv";
import {
  can,
  entitiesAllowed,
  roleActions,
  roleLabels,
  seedGedUsers,
  type GedRole,
  type GedUser,
} from "@/lib/ged-permissions";

export const Route = createFileRoute("/ged")({
  head: () => ({
    meta: [
      { title: "GED — FleetManager AI" },
      { name: "description", content: "Gestion électronique des documents de flotte avec rôles et droits par société." },
      { property: "og:title", content: "GED — FleetManager AI" },
      { property: "og:description", content: "Consulter, déposer et archiver les documents selon les droits de chaque utilisateur." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: GedPage,
});

const docTypes = ["Carte grise", "Permis", "Assurance", "Contrôle technique", "Facture", "Contrat", "Autre"];

type GedDoc = {
  id: string;
  name: string;
  type: string;
  entityId: string;
  vehicleId: string;
  driverId: string;
  expiry: string;
  uploadedBy: string;
  uploadedAt: string;
  size: number;
  archived: boolean;
  url?: string;
};

const LS_USERS = "fleet.ged.users";
const LS_CURRENT = "fleet.ged.currentUser";
const LS_DOCS = "fleet.ged.docs";
const LS_PATH = "fleet.ged.storagePath";

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function GedPage() {
  const { entities, vehicles, drivers, entityName, vehiclePlate, driverName } = useFleet();
  const [ready, setReady] = useState(false);
  const [users, setUsers] = useState<GedUser[]>(seedGedUsers);
  const [currentId, setCurrentId] = useState(seedGedUsers[0]!.id);
  const [docs, setDocs] = useState<GedDoc[]>([]);
  const [storagePath, setStoragePath] = useState("C:\\FleetManager\\GED");
  const [search, setSearch] = useState("");
  const [entityFilter, setEntityFilter] = useState("all");
  const [showArchived, setShowArchived] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);

  useEffect(() => {
    setUsers(load(LS_USERS, seedGedUsers));
    setCurrentId(load(LS_CURRENT, seedGedUsers[0]!.id));
    setDocs(load<GedDoc[]>(LS_DOCS, []));
    setStoragePath(load(LS_PATH, "C:\\FleetManager\\GED"));
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(LS_USERS, JSON.stringify(users));
    localStorage.setItem(LS_CURRENT, JSON.stringify(currentId));
    localStorage.setItem(LS_DOCS, JSON.stringify(docs.map(({ url: _u, ...d }) => d)));
    localStorage.setItem(LS_PATH, JSON.stringify(storagePath));
  }, [ready, users, currentId, docs, storagePath]);

  const me = users.find((u) => u.id === currentId) ?? users[0];
  const allIds = entities.map((e) => e.id);
  const canManage = can(me, "gerer", "any") || me?.grants.some((g) => g.entityId === "all" && g.role === "admin");
  const viewable = entitiesAllowed(me, "consulter", allIds);
  const depositable = entitiesAllowed(me, "deposer", allIds);

  const visibleDocs = useMemo(() => {
    const q = search.trim().toLowerCase();
    return docs.filter(
      (d) =>
        viewable.includes(d.entityId) &&
        d.archived === showArchived &&
        (entityFilter === "all" || d.entityId === entityFilter) &&
        (!q || `${d.name} ${d.type} ${vehiclePlate(d.vehicleId || null)}`.toLowerCase().includes(q)),
    );
  }, [docs, viewable, showArchived, entityFilter, search, vehiclePlate]);

  const toggleArchive = (doc: GedDoc) => {
    if (!can(me, "archiver", doc.entityId)) {
      toast.error("Vous n'avez pas le droit d'archiver ce document.");
      return;
    }
    setDocs((prev) => prev.map((d) => (d.id === doc.id ? { ...d, archived: !d.archived } : d)));
    toast.success(doc.archived ? "Document restauré" : "Document archivé");
  };

  return (
    <>
      <PageHeader
        title="GED"
        subtitle="Documents de flotte — droits par rôle et par société"
        actions={
          <>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Tester en tant que</span>
              <Select value={currentId} onValueChange={setCurrentId}>
                <SelectTrigger className="h-9 w-48" aria-label="Utilisateur de test">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button size="sm" disabled={depositable.length === 0} onClick={() => setUploadOpen(true)}>
              <FileUp /> Déposer
            </Button>
          </>
        }
      />

      <main className="space-y-4 p-4 md:p-8">
        <Card>
          <CardContent className="flex flex-wrap items-center gap-2 py-4 text-sm">
            <ShieldCheck className="size-4 text-primary" />
            <span className="font-medium">{me?.name}</span>
            {me?.grants.map((g, i) => (
              <Badge key={i} variant="secondary">
                {roleLabels[g.role]} · {g.entityId === "all" ? "Toutes sociétés" : entityName(g.entityId)}
              </Badge>
            ))}
            {me?.grants.length === 0 && <span className="text-muted-foreground">Aucun droit</span>}
          </CardContent>
        </Card>

        <Tabs defaultValue="docs">
          <TabsList>
            <TabsTrigger value="docs">Documents</TabsTrigger>
            <TabsTrigger value="droits">Rôles & droits</TabsTrigger>
          </TabsList>

          <TabsContent value="docs" className="space-y-4">
            {viewable.length === 0 ? (
              <Card>
                <CardContent className="flex items-center gap-2 py-10 text-muted-foreground">
                  <Lock className="size-4" /> Vous n'avez accès à aucune société.
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <Input
                    suppressHydrationWarning
                    placeholder="Rechercher (nom, type, immatriculation)"
                    className="w-full sm:w-72"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <Select value={entityFilter} onValueChange={setEntityFilter}>
                    <SelectTrigger className="w-full sm:w-56" aria-label="Société">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes mes sociétés</SelectItem>
                      {viewable.map((id) => (
                        <SelectItem key={id} value={id}>
                          {entityName(id)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant={showArchived ? "secondary" : "outline"} size="sm" onClick={() => setShowArchived((v) => !v)}>
                    <Archive /> {showArchived ? "Voir actifs" : "Voir archivés"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      exportCsv(
                        "ged-documents.csv",
                        visibleDocs.map((d) => ({
                          Nom: d.name,
                          Type: d.type,
                          Société: entityName(d.entityId),
                          Véhicule: vehiclePlate(d.vehicleId || null),
                          Conducteur: driverName(d.driverId || null),
                          Expiration: d.expiry,
                          "Déposé par": d.uploadedBy,
                          "Déposé le": d.uploadedAt,
                        })),
                      )
                    }
                  >
                    <Download /> Exporter
                  </Button>
                </div>

                <Card>
                  <CardContent className="overflow-x-auto p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Document</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Société</TableHead>
                          <TableHead>Rattachement</TableHead>
                          <TableHead>Expiration</TableHead>
                          <TableHead>Déposé par</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {visibleDocs.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                              Aucun document.
                            </TableCell>
                          </TableRow>
                        )}
                        {visibleDocs.map((d) => (
                          <TableRow key={d.id}>
                            <TableCell className="font-medium">{d.name}</TableCell>
                            <TableCell>{d.type}</TableCell>
                            <TableCell>{entityName(d.entityId)}</TableCell>
                            <TableCell className="text-sm">
                              {d.vehicleId ? vehiclePlate(d.vehicleId) : ""}
                              {d.driverId ? ` ${driverName(d.driverId)}` : ""}
                              {!d.vehicleId && !d.driverId && "—"}
                            </TableCell>
                            <TableCell>{d.expiry || "—"}</TableCell>
                            <TableCell className="text-sm">{d.uploadedBy}</TableCell>
                            <TableCell className="space-x-1 text-right">
                              <Button
                                size="icon"
                                variant="ghost"
                                aria-label="Ouvrir"
                                disabled={!d.url}
                                title={d.url ? "Ouvrir" : `Fichier stocké dans ${storagePath}`}
                                onClick={() => d.url && window.open(d.url, "_blank")}
                              >
                                <Eye />
                              </Button>
                              {can(me, "archiver", d.entityId) && (
                                <Button size="icon" variant="ghost" aria-label="Archiver" onClick={() => toggleArchive(d)}>
                                  {d.archived ? <ArchiveRestore /> : <Archive />}
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="droits" className="space-y-4">
            <RolesMatrix />
            {canManage ? (
              <RightsManager users={users} setUsers={setUsers} storagePath={storagePath} setStoragePath={setStoragePath} />
            ) : (
              <Card>
                <CardContent className="flex items-center gap-2 py-6 text-muted-foreground">
                  <Lock className="size-4" /> Seul un administrateur (toutes sociétés) peut modifier les droits.
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <UploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        allowedEntities={depositable}
        entityName={entityName}
        vehicles={vehicles.filter((v) => !v.archived)}
        drivers={drivers.filter((d) => !d.archived)}
        storagePath={storagePath}
        onSubmit={(doc) => {
          if (!can(me, "deposer", doc.entityId)) {
            toast.error("Dépôt refusé pour cette société.");
            return;
          }
          setDocs((prev) => [{ ...doc, uploadedBy: me?.name ?? "—" }, ...prev]);
          toast.success("Document déposé");
        }}
      />
    </>
  );
}

function RolesMatrix() {
  const actions = ["consulter", "deposer", "archiver", "gerer"] as const;
  const labels = { consulter: "Consulter", deposer: "Déposer", archiver: "Archiver", gerer: "Gérer les droits" };
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Ce que permet chaque rôle</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rôle</TableHead>
              {actions.map((a) => (
                <TableHead key={a} className="text-center">
                  {labels[a]}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {(Object.keys(roleLabels) as GedRole[]).map((r) => (
              <TableRow key={r}>
                <TableCell className="font-medium">{roleLabels[r]}</TableCell>
                {actions.map((a) => (
                  <TableCell key={a} className="text-center">
                    {roleActions[r].includes(a) ? "✓" : "—"}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function RightsManager({
  users,
  setUsers,
  storagePath,
  setStoragePath,
}: {
  users: GedUser[];
  setUsers: React.Dispatch<React.SetStateAction<GedUser[]>>;
  storagePath: string;
  setStoragePath: (v: string) => void;
}) {
  const { entities, entityName } = useFleet();
  const [newName, setNewName] = useState("");

  const updateGrants = (userId: string, fn: (g: GedUser["grants"]) => GedUser["grants"]) =>
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, grants: fn(u.grants) } : u)));

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Emplacement de stockage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Input value={storagePath} onChange={(e) => setStoragePath(e.target.value)} aria-label="Chemin de stockage" />
          <p className="text-xs text-muted-foreground">
            Phase de conception : documents conservés sur ce poste. Remplacer par le chemin du serveur fourni par la DSI une fois validé.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Utilisateurs et attributions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {users.map((u) => (
            <div key={u.id} className="space-y-2 rounded-lg border border-border p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium">{u.name}</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateGrants(u.id, (g) => [...g, { entityId: entities[0]?.id ?? "all", role: "lecteur" }])}
                >
                  <Plus /> Droit
                </Button>
              </div>
              {u.grants.map((g, i) => (
                <div key={i} className="flex flex-wrap items-center gap-2">
                  <Select
                    value={g.entityId}
                    onValueChange={(v) => updateGrants(u.id, (gs) => gs.map((x, j) => (j === i ? { ...x, entityId: v } : x)))}
                  >
                    <SelectTrigger className="w-full sm:w-60" aria-label="Société du droit">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes sociétés</SelectItem>
                      {entities.map((e) => (
                        <SelectItem key={e.id} value={e.id}>
                          {entityName(e.id)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={g.role}
                    onValueChange={(v) =>
                      updateGrants(u.id, (gs) => gs.map((x, j) => (j === i ? { ...x, role: v as GedRole } : x)))
                    }
                  >
                    <SelectTrigger className="w-full sm:w-44" aria-label="Rôle">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(roleLabels) as GedRole[]).map((r) => (
                        <SelectItem key={r} value={r}>
                          {roleLabels[r]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Retirer le droit"
                    onClick={() => updateGrants(u.id, (gs) => gs.filter((_, j) => j !== i))}
                  >
                    <Trash2 />
                  </Button>
                </div>
              ))}
            </div>
          ))}
          <div className="flex gap-2">
            <Input placeholder="Nom du nouvel utilisateur" value={newName} onChange={(e) => setNewName(e.target.value)} />
            <Button
              disabled={!newName.trim()}
              onClick={() => {
                setUsers((prev) => [...prev, { id: `u-${Date.now()}`, name: newName.trim(), grants: [] }]);
                setNewName("");
              }}
            >
              <Plus /> Ajouter
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

function UploadDialog({
  open,
  onOpenChange,
  allowedEntities,
  entityName,
  vehicles,
  drivers,
  storagePath,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  allowedEntities: string[];
  entityName: (id: string) => string;
  vehicles: { id: string; plate: string }[];
  drivers: { id: string; firstName?: string; lastName?: string }[];
  storagePath: string;
  onSubmit: (doc: GedDoc) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState<string>(docTypes[0]!);
  const [entityId, setEntityId] = useState("");
  const [vehicleId, setVehicleId] = useState("__none__");
  const [driverId, setDriverId] = useState("__none__");
  const [expiry, setExpiry] = useState("");

  useEffect(() => {
    if (open) setEntityId(allowedEntities[0] ?? "");
  }, [open, allowedEntities]);

  const submit = () => {
    if (!file) {
      toast.error("Choisissez un fichier.");
      return;
    }
    if (!entityId) {
      toast.error("Choisissez une société.");
      return;
    }
    onSubmit({
      id: `doc-${Date.now()}`,
      name: file.name,
      type,
      entityId,
      vehicleId: vehicleId === "__none__" ? "" : vehicleId,
      driverId: driverId === "__none__" ? "" : driverId,
      expiry,
      uploadedBy: "",
      uploadedAt: new Date().toISOString().slice(0, 10),
      size: file.size,
      archived: false,
      url: URL.createObjectURL(file),
    });
    setFile(null);
    setExpiry("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Déposer un document</DialogTitle>
          <DialogDescription>Destination : {storagePath}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="ged-file">Fichier</Label>
            <Input id="ged-file" type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger aria-label="Type"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {docTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Société (selon vos droits)</Label>
              <Select value={entityId} onValueChange={setEntityId}>
                <SelectTrigger aria-label="Société du document"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {allowedEntities.map((id) => <SelectItem key={id} value={id}>{entityName(id)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Véhicule</Label>
              <Select value={vehicleId} onValueChange={setVehicleId}>
                <SelectTrigger aria-label="Véhicule"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Aucun</SelectItem>
                  {vehicles.map((v) => <SelectItem key={v.id} value={v.id}>{v.plate}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Conducteur</Label>
              <Select value={driverId} onValueChange={setDriverId}>
                <SelectTrigger aria-label="Conducteur"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Aucun</SelectItem>
                  {drivers.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{`${d.firstName ?? ""} ${d.lastName ?? ""}`.trim() || d.id}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="ged-exp">Date d'expiration</Label>
              <Input id="ged-exp" type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={submit}>Déposer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
