"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function VerifyPage() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 px-4 py-16 text-center">
      <h1 className="font-heading text-3xl font-bold">Verify a listing</h1>
      <p className="max-w-lg text-pretty text-muted-foreground">
        Paste a listing link or enter its details and we&apos;ll call the agent
        or landlord to confirm it&apos;s real, available, and accurate.
      </p>
      <p className="rounded-4xl border border-dashed px-6 py-8 text-sm text-muted-foreground">
        The listing submission form is coming next.
      </p>
      <Button
        variant="outline"
        nativeButton={false}
        render={<Link href="/dashboard" />}
      >
        View dashboard
      </Button>
    </main>
  );
}