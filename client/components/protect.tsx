"use client";
import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import SessionStore from "@/store/session";
import { AUTH_PAGE_ROUTES, PUBLIC_PAGE_ROUTES } from "@/utils/constant";
import { buildLoginUrl } from "@/utils/redirect";

const ProtectRoutes = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();

  const sessionData = SessionStore((state) => state.session);
  const isLoading = SessionStore((state) => state.isLoading);
  const initSession = SessionStore((state) => state.initSession);

  useEffect(() => {
    void initSession();
  }, [initSession]);

  useEffect(() => {
    if (isLoading) return;

    const isAuthPage = AUTH_PAGE_ROUTES.some((route) =>
      pathname.startsWith(route),
    );

    const isPublicPage = PUBLIC_PAGE_ROUTES.includes(pathname);

    if (!sessionData && !isAuthPage && !isPublicPage) {
      router.replace(buildLoginUrl());
      return;
    }

    if (sessionData && isAuthPage) {
      router.replace("/dashboard");
      return;
    }
  }, [isLoading, sessionData, pathname, router]);

  const isAuthPage = AUTH_PAGE_ROUTES.some((route) =>
    pathname.startsWith(route),
  );

  const isPublicPage = PUBLIC_PAGE_ROUTES.includes(pathname);

  const isRedirecting =
    (isAuthPage && sessionData) || (!isAuthPage && !isPublicPage && !sessionData);

  if (isLoading || isRedirecting) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </main>
    );
  }

  return <>{children}</>;
};

export default ProtectRoutes;
