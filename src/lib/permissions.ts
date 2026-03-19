/**
 * Vault OS — Role-Based Permission System
 *
 * Roles:  owner | admin | coach | athlete | parent
 * Permissions are declarative — never hardcode role checks inline.
 * Always use `hasPermission(roles, "permission.name")`.
 */

export type VaultRole = "owner" | "admin" | "coach" | "athlete" | "parent";

export type Permission =
  // Platform
  | "platform.settings"
  | "platform.revenue"
  | "platform.intelligence"
  | "platform.pricing"
  // Roles
  | "roles.view"
  | "roles.assign"
  // Users
  | "users.list"
  | "users.manage"
  // Coaches
  | "coaches.list"
  | "coaches.manage"
  | "coaches.approve"
  // Athletes
  | "athletes.view_own"
  | "athletes.view_assigned"
  | "athletes.manage"
  // Lessons
  | "lessons.deliver"
  | "lessons.book"
  | "lessons.view_own"
  // Content
  | "content.create"
  | "content.approve"
  | "content.view"
  // Courses
  | "courses.view"
  | "courses.manage"
  // Analytics
  | "analytics.own"
  | "analytics.athletes"
  | "analytics.platform"
  // Community
  | "community.post"
  | "community.moderate"
  // Profile
  | "profile.edit_own"
  | "profile.view_child"
  // Certifications
  | "certifications.take"
  | "certifications.manage"
  // Dashboard
  | "dashboard.owner"
  | "dashboard.admin"
  | "dashboard.coach"
  | "dashboard.athlete"
  | "dashboard.parent";

/**
 * Permission matrix — each role maps to the set of permissions it grants.
 * Owner has everything. Coach has operational access. Athlete/Parent are scoped.
 */
const PERMISSION_MATRIX: Record<VaultRole, ReadonlySet<Permission>> = {
  owner: new Set<Permission>([
    "platform.settings", "platform.revenue", "platform.intelligence", "platform.pricing",
    "roles.view", "roles.assign",
    "users.list", "users.manage",
    "coaches.list", "coaches.manage", "coaches.approve",
    "athletes.view_own", "athletes.view_assigned", "athletes.manage",
    "lessons.deliver", "lessons.book", "lessons.view_own",
    "content.create", "content.approve", "content.view",
    "courses.view", "courses.manage",
    "analytics.own", "analytics.athletes", "analytics.platform",
    "community.post", "community.moderate",
    "profile.edit_own",
    "certifications.take", "certifications.manage",
    "dashboard.owner", "dashboard.admin", "dashboard.coach", "dashboard.athlete",
  ]),
  admin: new Set<Permission>([
    "platform.settings",
    "roles.view", "roles.assign",
    "users.list", "users.manage",
    "coaches.list", "coaches.manage", "coaches.approve",
    "athletes.view_own", "athletes.view_assigned", "athletes.manage",
    "lessons.deliver", "lessons.book", "lessons.view_own",
    "content.create", "content.approve", "content.view",
    "courses.view", "courses.manage",
    "analytics.own", "analytics.athletes", "analytics.platform",
    "community.post", "community.moderate",
    "profile.edit_own",
    "certifications.take", "certifications.manage",
    "dashboard.admin", "dashboard.coach", "dashboard.athlete",
  ]),
  coach: new Set<Permission>([
    "coaches.list",
    "athletes.view_assigned",
    "lessons.deliver", "lessons.view_own",
    "content.create", "content.view",
    "courses.view",
    "analytics.own", "analytics.athletes",
    "community.post",
    "profile.edit_own",
    "certifications.take",
    "dashboard.coach",
  ]),
  athlete: new Set<Permission>([
    "athletes.view_own",
    "lessons.book", "lessons.view_own",
    "content.view",
    "courses.view",
    "analytics.own",
    "community.post",
    "profile.edit_own",
    "certifications.take",
    "dashboard.athlete",
  ]),
  parent: new Set<Permission>([
    "profile.view_child",
    "lessons.view_own",
    "content.view",
    "courses.view",
    "analytics.own",
    "dashboard.parent",
  ]),
};

/**
 * Check if any of the user's roles grant the requested permission.
 * This is the ONLY function that should be used for access control.
 */
export function hasPermission(userRoles: VaultRole[], permission: Permission): boolean {
  return userRoles.some((role) => PERMISSION_MATRIX[role]?.has(permission));
}

/**
 * Get the highest-priority role for routing/UI decisions.
 * Priority: owner > admin > coach > athlete > parent
 */
export function getPrimaryRole(userRoles: VaultRole[]): VaultRole | null {
  const priority: VaultRole[] = ["owner", "admin", "coach", "athlete", "parent"];
  for (const role of priority) {
    if (userRoles.includes(role)) return role;
  }
  return null;
}

/**
 * Get the default dashboard route for a given primary role.
 */
export function getDashboardRoute(role: VaultRole | null): string {
  switch (role) {
    case "owner": return "/owner";
    case "admin": return "/admin";
    case "coach": return "/coach-dashboard";
    case "parent": return "/dashboard";
    case "athlete":
    default:
      return "/dashboard";
  }
}

/**
 * All permissions for a given set of roles (union).
 */
export function getAllPermissions(userRoles: VaultRole[]): Permission[] {
  const perms = new Set<Permission>();
  for (const role of userRoles) {
    PERMISSION_MATRIX[role]?.forEach((p) => perms.add(p));
  }
  return Array.from(perms);
}
