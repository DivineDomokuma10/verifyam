import { Logo } from "./utils";
import ThemeToggle from "./theme-toggle";
import { Button } from "@/components/ui/button";

const navLinks = [
  { label: "How it works", href: "#how-it-works" },
  { label: "What we verify", href: "#what-we-verify" },
  { label: "For renters", href: "#for-renters" },
  { label: "FAQ", href: "#faq" },
];

const Header = () => {
  return (
    <header className="flex items-center justify-between rounded-xl px-4 py-4 md:px-8">
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
        <Button size="sm" nativeButton={false} render={<a href="#verify" />}>
          Verify a listing
        </Button>
        <ThemeToggle />
      </div>
    </header>
  );
};

export default Header;