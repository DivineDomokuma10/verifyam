"use client";

import { useState } from "react";
import Link from "next/link";
import { RiCloseLine, RiMenuLine } from "@remixicon/react";

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
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="relative flex flex-wrap items-center justify-between gap-2 rounded-xl px-4 py-4 md:px-8">
      <Logo />

      <nav className="hidden items-center gap-6 md:flex" aria-label="Primary">
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
              render={<Link href="/dashboard" />}
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
            render={<Link href="/login" />}
          >
            Log in
          </Button>
        )}

        <Button
          size="sm"
          nativeButton={false}
          render={<Link href="/verify" />}
          className="hidden sm:inline-flex"
        >
          Verify a listing
        </Button>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className="flex size-9 items-center justify-center rounded-md border border-border text-foreground transition-colors hover:bg-muted md:hidden"
        >
          {menuOpen ? (
            <RiCloseLine className="size-5" />
          ) : (
            <RiMenuLine className="size-5" />
          )}
        </button>

        <ThemeToggle />
      </div>

      {menuOpen && (
        <nav
          id="mobile-nav"
          aria-label="Mobile"
          className="absolute inset-x-0 top-full z-50 mx-4 mt-1 flex-col gap-1 rounded-md border border-border bg-card p-3 shadow-lg md:hidden"
        >
          {navLinks.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="rounded-sm px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {label}
            </a>
          ))}

          <Link
            href="/verify"
            onClick={() => setMenuOpen(false)}
            className={cn(
              buttonVariants({ size: "sm", variant: "outline" }),
              "mt-2 justify-center",
            )}
          >
            Verify a listing
          </Link>
        </nav>
      )}
    </header>
  );
};

export default Header;
