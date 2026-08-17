"use client";
import { useTheme } from "next-themes";
import { RiMoonFill, RiSunFill } from "@remixicon/react";

import { Button } from "@/components/ui/button";

const ThemeToggle = () => {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      size="icon"
      variant="ghost"
      className="cursor-pointer"
      aria-label="Toggle theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <RiSunFill className="size-5 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <RiMoonFill className="absolute size-5 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
    </Button>
  );
};

export default ThemeToggle;
