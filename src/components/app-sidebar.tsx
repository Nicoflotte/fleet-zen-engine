import { Link, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  Building2,
  Car,
  CarFront,
  CreditCard,
  FileWarning,
  FolderOpen,
  Landmark,
  LayoutDashboard,
  Link2,
  Plug,
  Receipt,
  Settings,
  ShieldAlert,
  Sparkle,
  Umbrella,
  Users,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

type NavItem = { title: string; url: string; icon: typeof Car; ready: boolean };

const fleetItems: NavItem[] = [
  { title: "Tableau de bord", url: "/", icon: LayoutDashboard, ready: true },
  { title: "Agences", url: "/agences", icon: Building2, ready: true },
  { title: "Parc véhicules", url: "/vehicules", icon: Car, ready: true },
  { title: "Conducteurs", url: "/conducteurs", icon: Users, ready: true },
  { title: "Équipements", url: "/equipements", icon: CreditCard, ready: true },
  { title: "Affectations", url: "/affectations", icon: Link2, ready: true },
];

const suiviItems: NavItem[] = [
  { title: "Dépenses", url: "/depenses", icon: Receipt, ready: true },
  { title: "Locations", url: "/locations", icon: CarFront, ready: true },
  { title: "Sinistres", url: "/sinistres", icon: ShieldAlert, ready: true },
  { title: "Contraventions", url: "/contraventions", icon: FileWarning, ready: true },
  { title: "Assurances", url: "/assurances", icon: Umbrella, ready: true },
  { title: "Crédits-baux", url: "/credits-baux", icon: Landmark, ready: true },
];

const pilotageItems: NavItem[] = [
  { title: "Alertes", url: "/alertes", icon: Sparkle, ready: true },
  { title: "GED", url: "/ged", icon: FolderOpen, ready: false },
  { title: "KPI & Reporting", url: "/kpi", icon: BarChart3, ready: false },
];

const adminItems: NavItem[] = [
  { title: "Administration", url: "/administration", icon: Settings, ready: false },
  { title: "Connecteurs", url: "/connecteurs", icon: Plug, ready: false },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (router) => router.location.pathname });

  const isActive = (url: string) =>
    url === "/" ? pathname === "/" : pathname === url || pathname.startsWith(`${url}/`);

  const renderGroup = (label: string, items: NavItem[]) => (
    <SidebarGroup>
      <SidebarGroupLabel className="text-[0.68rem] uppercase tracking-[0.14em] text-sidebar-foreground/50">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                {item.ready ? (
                  <Link to={item.url} className="flex items-center gap-3">
                    <item.icon className="size-4 shrink-0" />
                    {!collapsed && <span className="truncate">{item.title}</span>}
                  </Link>
                ) : (
                  <span
                    className="flex cursor-default items-center gap-3 opacity-55"
                    title="Écran à concevoir (phase suivante)"
                  >
                    <item.icon className="size-4 shrink-0" />
                    {!collapsed && (
                      <span className="flex w-full items-center justify-between gap-2 truncate">
                        {item.title}
                        <span className="rounded border border-sidebar-border px-1 text-[0.6rem] uppercase">
                          v2
                        </span>
                      </span>
                    )}
                  </span>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-3 px-1 py-2">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-sidebar-primary/15 text-sidebar-primary">
            <Car className="size-5" />
          </span>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-display truncate text-sm font-semibold text-sidebar-accent-foreground">
                FleetManager AI
              </p>
              <p className="truncate text-xs text-sidebar-foreground/60">Gestion de flotte augmentée</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {renderGroup("Flotte", fleetItems)}
        {renderGroup("Suivi & coûts", suiviItems)}
        {renderGroup("Pilotage", pilotageItems)}
        {renderGroup("Paramétrage", adminItems)}
      </SidebarContent>

      <SidebarFooter>
        {!collapsed && (
          <div className="rounded-lg border border-sidebar-border/70 bg-sidebar-accent/50 p-3">
            <p className="text-xs font-semibold text-sidebar-accent-foreground">Nicolas Raclet</p>
            <p className="text-xs text-sidebar-foreground/60">Gestionnaire de flotte</p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
