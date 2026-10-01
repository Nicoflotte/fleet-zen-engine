export type GedRole = "admin" | "contributeur" | "lecteur";
export type GedAction = "consulter" | "deposer" | "archiver" | "gerer";

export const roleLabels: Record<GedRole, string> = {
  admin: "Administrateur",
  contributeur: "Contributeur",
  lecteur: "Lecteur",
};

export const roleActions: Record<GedRole, GedAction[]> = {
  admin: ["consulter", "deposer", "archiver", "gerer"],
  contributeur: ["consulter", "deposer"],
  lecteur: ["consulter"],
};

/** Une attribution = un rôle sur une société ("all" = toutes les sociétés). */
export type GedGrant = { entityId: string; role: GedRole };
export type GedUser = { id: string; name: string; grants: GedGrant[] };

export const seedGedUsers: GedUser[] = [
  { id: "u-admin", name: "Nicolas Raclet", grants: [{ entityId: "all", role: "admin" }] },
  {
    id: "u-contrib",
    name: "Hélène Vasseur",
    grants: [
      { entityId: "MET", role: "contributeur" },
      { entityId: "ODESA", role: "lecteur" },
    ],
  },
  { id: "u-lect", name: "Damien Roux", grants: [{ entityId: "OF", role: "lecteur" }] },
];

export function can(user: GedUser | undefined, action: GedAction, entityId: string) {
  if (!user) return false;
  return user.grants.some(
    (g) => (g.entityId === "all" || g.entityId === entityId) && roleActions[g.role].includes(action),
  );
}

/** Sociétés pour lesquelles l'utilisateur peut effectuer l'action. */
export function entitiesAllowed(user: GedUser | undefined, action: GedAction, allIds: string[]) {
  return allIds.filter((id) => can(user, action, id));
}
