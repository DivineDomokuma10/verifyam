import { LOGIN_PAGE_ROUTE } from "./constant";

export const buildLoginUrl = (): string => {
  if (typeof window === "undefined") {
    return LOGIN_PAGE_ROUTE;
  }

  const { pathname, search, hash } = window.location;
  const currentPath = `${pathname}${search}${hash}`;

  return `${LOGIN_PAGE_ROUTE}?next=${encodeURIComponent(currentPath)}`;
};