import { JetBrains_Mono, Merriweather, Raleway } from "next/font/google";
import type { Metadata } from "next";

import "./globals.css";
import { cn } from "@/lib/utils";
import Header from "@/components/shared/header";
import { ThemeProvider } from "@/providers/theme-provider";

const raleway = Raleway({ subsets: ["latin"], variable: "--font-sans" });

const merriweatherHeading = Merriweather({
  subsets: ["latin"],
  variable: "--font-heading",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "VERIFY — Don't just find it. Verify it.",
  description:
    "We call the agent or landlord behind every listing and confirm it's real, available, and accurate — before you waste a tour or a deposit.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "h-full",
        "font-sans",
        "antialiased",
        raleway.variable,
        jetbrainsMono.variable,
        merriweatherHeading.variable,
      )}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider
          enableSystem
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
        >
          <Header />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
