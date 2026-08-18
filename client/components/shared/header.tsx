"use client";

import { Logo } from "./utils";
import ThemeToggle from "./theme-toggle";
import { Button, buttonVariants } from "@/components/ui/button";
import SessionStore from "@/store/session";
import { cn, handleLogout } from "@/utils";

const navLinks = [
  { label: "How it works", href: "#how-it-works" },
  { label: "What we verify", href: "#what-we-verify" },
  { label: "For renters", href: "#for-renters" },
  { label: "FAQ", href: "#faq" },
];

const Header = () => {
  const sessionData = SessionStore((state) => state.session);

  return (
    <header className="flex flex-wrap items-center justify-between gap-2 rounded-xl px-4 py-4 md:px-8">
      <Logo />

      <nav className="hidden items-center gap-6 md:flex">
        {navLinks.map(({ label, href }) => (
          <a
            key={href}
            href={href}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {label}
          </a>
        ))}
      </nav>

      <div className="flex items-center gap-2">
        {sessionData ? (
          <>
            <Button
              size="sm"
              variant="ghost"
              nativeButton={false}
              render={<a href="/dashboard" />}
            >
              Dashboard
            </Button>
            <button
              type="button"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
              onClick={() => void handleLogout()}
            >
              Log out
            </button>
          </>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            nativeButton={false}
            render={<a href="/login" />}
          >
            Log in
          </Button>
        )}

        <Button
          size="sm"
          nativeButton={false}
          render={<a href="/verify" />}
          className="hidden sm:inline-flex"
        >
          Verify a listing
        </Button>
        <ThemeToggle />
      </div>
    </header>
  );
};

export default Header;
