import { CheckField } from "@/types";

export const OPEN_ROUTE = [
  "/api/auth/login",
  "/api/auth/signup",
  "/api/auth/logout",
];

export const AUTH_PAGE_ROUTES = ["/login", "/signup"];

export const PUBLIC_PAGE_ROUTES = ["/"];

export const LOGIN_PAGE_ROUTE = "/login";

export const CHECK_LABELS: Array<{ key: CheckField; label: string }> = [
  { key: "isReal", label: "Listing is real" },
  { key: "isAvailable", label: "Still available" },
  { key: "priceMatches", label: "Price matches" },
  { key: "photosAccurate", label: "Photos accurate" },
  { key: "sizeMatches", label: "Size matches" },
  { key: "amenitiesMatch", label: "Amenities match" },
  { key: "moveInDateConfirmed", label: "Move-in date confirmed" },
];

export const VERDICT_STYLES = {
  verified: {
    badge: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    label: "Verified",
  },
  warning: {
    badge: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    label: "Warning",
  },
  inconclusive: {
    badge: "bg-muted text-muted-foreground",
    label: "Inconclusive",
  },
} as const;

export const FIELD_STYLES = {
  yes: "text-emerald-600 dark:text-emerald-400",
  no: "text-destructive",
  unknown: "text-muted-foreground",
} as const;

export const STATUS_LABELS = {
  pending: "Queued",
  calling: "In progress",
  completed: "Completed",
} as const;

export const RESULT_STYLES = {
  verified: "text-emerald-600 dark:text-emerald-400",
  warning: "text-amber-600 dark:text-amber-400",
  inconclusive: "text-muted-foreground",
} as const;