import { useMemo } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Download } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { exportCsv } from "@/lib/export-csv";
import {
  availableYears,
  currency,
  daysUntil,
  expenseTypeLabels,
  shortDate,
  type ExpenseType,
} from "@/lib/fleet-data";
import { useFleet } from "@/lib/fleet-store";

export const Route = createFileRoute("/kpi")({
  validateSearch: (search: Record<string, unknown>): { year: number; entity: string } => ({
    year: availableYears.includes(Number(search["year"])) ? Number(search["year"]) : 2026,
    entity: typeof search["entity"] === "string" && search["entity"] ? search["entity"] : "all",
  }),
  head: () => ({
    meta: [
      { title: "KPI & Reporting — FleetManager AI" },
      { name: "description", content: "Indicateurs clés de la flotte : coûts, évolution mensuelle, sinistralité, contraventions et échéances par société." },
      { property: "og:title", content: "KPI & Reporting — FleetManager AI" },
      { property: "og:description", content: "Tableaux de bord analytiques pour piloter la flotte du groupe." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: KpiPage,
});

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)", "var(--muted-foreground)"];
const MONTHS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
const LAST_MONTH = 8; // données disponibles jusqu'à août 2026
const k = (v: number) => `${Math.round(v / 1000)} k€`;

function KpiPage() {
  const { year, entity } = Route.useSearch();
  const navigate = useNavigate({ from: "/kpi" });
  const fleet = useFleet();
  const { entities, vehicles, claims, fines, leases, insurancePolicies, expenses, rentals, entityIdOfAgency, entityName } = fleet;

  const inEntity = (id: string) => entity === "all" || id === entity;
  const monthsCount = year === 2026 ? LAST_MONTH : 12;
  const inPeriod = (m: string, y: number) => m.startsWith(`${y}-`) && Number(m.slice(5, 7)) <= monthsCount;

  const data = useMemo(() => {
    const exp = expenses.filter((e) => inEntity(e.entityId) && inPeriod(e.month, year));
    const prev = expenses.filter((e) => inEntity(e.entityId) && inPeriod(e.month, year - 1));
    const total = exp.reduce((s, e) => s + e.amount, 0);
    const prevTotal = prev.reduce((s, e) => s + e.amount, 0);
    const fleetV = vehicles.filter((v) => !v.archived && inEntity(entityIdOfAgency(v.agencyId)));
    const active = fleetV.filter((v) => v.status === "en_service").length;
    const yr = (d: string) => d.startsWith(`${year}-`);
    const cl = claims.filter((c) => yr(c.date) && inEntity(entityIdOfAgency(c.agencyId)));
    const fi = fines.filter((f) => yr(f.date) && inEntity(entityIdOfAgency(f.agencyId)));

    const monthly = MONTHS.slice(0, monthsCount).map((label, i) => {
      const key = `${year}-${String(i + 1).padStart(2, "0")}`;
      const row: Record<string, string | number> = { label };
      (Object.keys(expenseTypeLabels) as ExpenseType[]).forEach((t) => {
        row[t] = exp.filter((e) => e.month === key && e.type === t).reduce((s, e) => s + e.amount, 0);
      });
      const pkey = `${year - 1}-${String(i + 1).padStart(2, "0")}`;
      row["current"] = exp.filter((e) => e.month === key).reduce((s, e) => s + e.amount, 0);
      row["previous"] = prev.filter((e) => e.month === pkey).reduce((s, e) => s + e.amount, 0);
      return row;
    });

    const byType = (Object.keys(expenseTypeLabels) as ExpenseType[]).map((t) => ({
      name: expenseTypeLabels[t],
      value: exp.filter((e) => e.type === t).reduce((s, e) => s + e.amount, 0),
    }));

    const scorecard = entities.filter((en) => inEntity(en.id)).map((en) => {
      const v = vehicles.filter((x) => !x.archived && entityIdOfAgency(x.agencyId) === en.id);
      const cost = exp.filter((e) => e.entityId === en.id).reduce((s, e) => s + e.amount, 0);
      const c = cl.filter((x) => entityIdOfAgency(x.agencyId) === en.id);
      const f = fi.filter((x) => entityIdOfAgency(x.agencyId) === en.id);
      return {
        id: en.id,
        name: en.name,
        vehicles: v.length,
        cost,
        perVehicle: v.length ? cost / v.length / monthsCount : 0,
        claims: c.length,
        claimsCost: c.reduce((s, x) => s + x.cost, 0),
        fines: f.length,
        rentals: rentals.filter((r) => !r.archived && entityIdOfAgency(r.agencyId) === en.id).length,
      };
    });

    const deadlines: { date: string; label: string; kind: string }[] = [];
    fleetV.forEach((v) => {
      deadlines.push({ date: v.nextControl, label: `${v.plate} — ${v.brand} ${v.model}`, kind: "Contrôle technique" });
      deadlines.push({ date: v.warrantyEnd, label: `${v.plate} — ${v.brand} ${v.model}`, kind: "Fin de garantie" });
    });
    leases.filter((l) => !l.archived && inEntity(l.entityId) && l.status !== "solde" && l.status !== "resilie")
      .forEach((l) => deadlines.push({ date: l.end, label: `${l.plate} — ${l.vehicleLabel}`, kind: l.type === "loa" ? "Fin de LOA" : "Fin de crédit-bail" }));
    insurancePolicies.filter((p) => !p.archived && inEntity(p.entityId))
      .forEach((p) => deadlines.push({ date: p.renewal, label: `${p.insurer} — ${p.policyNumber}`, kind: "Renouvellement assurance" }));
    const upcoming = deadlines
      .filter((d) => { const n = d.date ? daysUntil(d.date) : null; return typeof n === "number" && Number.isFinite(n) && n <= 90; })
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 12);

    const monthlyRents = leases.filter((l) => !l.archived && inEntity(l.entityId) && l.status !== "solde" && l.status !== "resilie")
      .reduce((s, l) => s + l.monthlyRent, 0);

    return {
      total, prevTotal, fleetCount: fleetV.length, active, cl, fi, monthly, byType, scorecard, upcoming, monthlyRents,
      availability: fleetV.length ? (active / fleetV.length) * 100 : 0,
      perVehicle: fleetV.length ? total / fleetV.length / monthsCount : 0,
      finesToDesignate: fi.filter((f) => f.status === "a_designer").length,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, entity, expenses, vehicles, claims, fines, leases, insurancePolicies, rentals, entities]);

  const variation = data.prevTotal ? ((data.total - data.prevTotal) / data.prevTotal) * 100 : 0;
  const claimsCost = data.cl.reduce((s, c) => s + c.cost, 0);

  const kpis = [
    { label: `Dépenses ${year} (${monthsCount} mois)`, value: currency(data.total), hint: `${variation >= 0 ? "+" : ""}${variation.toFixed(1)} % vs ${year - 1}`, warn: variation > 0 },
    { label: "Coût moyen / véhicule / mois", value: currency(data.perVehicle), hint: `${data.fleetCount} véhicules au parc` },
    { label: "Disponibilité du parc", value: `${data.availability.toFixed(0)} %`, hint: `${data.active} en service`, warn: data.availability < 85 },
    { label: "Loyers mensuels (LOA / CB)", value: currency(data.monthlyRents), hint: "Contrats en cours" },
    { label: "Sinistres", value: String(data.cl.length), hint: `${currency(claimsCost)} de coût`, warn: data.cl.length > 0 },
    { label: "Contraventions", value: String(data.fi.length), hint: `${data.finesToDesignate} à désigner`, warn: data.finesToDesignate > 0 },
  ];

  const setSearch = (patch: Partial<{ year: number; entity: string }>) =>
    navigate({ search: (prev) => ({ ...prev, ...patch }) });

  const exportReport = () =>
    exportCsv(`reporting-flotte-${year}`, data.scorecard.map((s) => ({
      Société: s.name,
      Véhicules: s.vehicles,
      "Dépenses (€)": s.cost,
      "Coût / véhicule / mois (€)": Math.round(s.perVehicle),
      Sinistres: s.claims,
      "Coût sinistres (€)": s.claimsCost,
      Contraventions: s.fines,
      "Locations en cours": s.rentals,
    })));

  return (
    <div className="space-y-6">
      <PageHeader
        title="KPI & Reporting"
        subtitle="Indicateurs clés, évolution des coûts et échéances de la flotte"
        actions={
          <div className="flex flex-wrap gap-2">
            <Select value={String(year)} onValueChange={(v) => setSearch({ year: Number(v) })}>
              <SelectTrigger className="w-28" aria-label="Année"><SelectValue /></SelectTrigger>
              <SelectContent>{availableYears.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={entity} onValueChange={(v) => setSearch({ entity: v })}>
              <SelectTrigger className="w-52" aria-label="Société"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les sociétés</SelectItem>
                {entities.map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={exportReport}><Download /> Exporter</Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="space-y-1 p-5">
              <p className="text-sm text-muted-foreground">{kpi.label}</p>
              <p className="font-display text-2xl font-semibold">{kpi.value}</p>
              <p className={`text-xs ${kpi.warn ? "text-destructive" : "text-muted-foreground"}`}>{kpi.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Évolution mensuelle des dépenses par type</CardTitle></CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="label" fontSize={12} />
                <YAxis tickFormatter={k} fontSize={12} width={56} />
                <Tooltip formatter={(v: number) => currency(v)} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {(Object.keys(expenseTypeLabels) as ExpenseType[]).map((t, i) => (
                  <Bar key={t} dataKey={t} name={expenseTypeLabels[t]} stackId="a" fill={COLORS[i]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Répartition par poste</CardTitle></CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.byType} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90}>
                  {data.byType.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => currency(v)} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">{year} comparé à {year - 1}</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="label" fontSize={12} />
                <YAxis tickFormatter={k} fontSize={12} width={56} />
                <Tooltip formatter={(v: number) => currency(v)} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="current" name={String(year)} stroke="var(--chart-1)" strokeWidth={2} />
                <Line type="monotone" dataKey="previous" name={String(year - 1)} stroke="var(--chart-4)" strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Dépenses par société</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.scorecard} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" tickFormatter={k} fontSize={12} />
                <YAxis type="category" dataKey="id" fontSize={12} width={60} />
                <Tooltip formatter={(v: number) => currency(v)} labelFormatter={(id) => entityName(String(id))} />
                <Bar dataKey="cost" name="Dépenses" fill="var(--chart-2)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Tableau de bord par société</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Société</TableHead>
                <TableHead className="text-right">Véhicules</TableHead>
                <TableHead className="text-right">Dépenses</TableHead>
                <TableHead className="text-right">Coût / véh. / mois</TableHead>
                <TableHead className="text-right">Sinistres</TableHead>
                <TableHead className="text-right">Contraventions</TableHead>
                <TableHead className="text-right">Locations</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.scorecard.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="text-right">{s.vehicles}</TableCell>
                  <TableCell className="text-right">{currency(s.cost)}</TableCell>
                  <TableCell className="text-right">{s.vehicles ? currency(s.perVehicle) : "—"}</TableCell>
                  <TableCell className="text-right">{s.claims}{s.claims ? ` (${currency(s.claimsCost)})` : ""}</TableCell>
                  <TableCell className="text-right">{s.fines}</TableCell>
                  <TableCell className="text-right">{s.rentals}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Échéances des 90 prochains jours</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          {data.upcoming.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune échéance dans les 90 prochains jours.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow><TableHead>Date</TableHead><TableHead>Type</TableHead><TableHead>Objet</TableHead><TableHead className="text-right">Délai</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {data.upcoming.map((d, i) => {
                  const days = Number(daysUntil(d.date));
                  return (
                    <TableRow key={i}>
                      <TableCell>{shortDate(d.date)}</TableCell>
                      <TableCell>{d.kind}</TableCell>
                      <TableCell>{d.label}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={days < 0 ? "destructive" : days <= 30 ? "default" : "secondary"}>
                          {days < 0 ? `Dépassée (${-days} j)` : `${days} j`}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
