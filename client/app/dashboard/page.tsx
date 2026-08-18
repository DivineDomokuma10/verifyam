"use client";
import Link from "next/link";

import { useGetMe } from "@/hook/queries/user";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { data, isLoading, error } = useGetMe();

  if (isLoading) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </main>
    );
  }

  if (error || !data?.data) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground">Unable to load profile.</p>
      </main>
    );
  }

  const user = data.data;

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-16">
      <div>
        <h1 className="font-heading text-3xl font-bold">Dashboard</h1>
        <p className="break-words text-muted-foreground">
          Welcome back, {user.email}.
        </p>
      </div>

      <div className="flex flex-col items-center gap-4 rounded-4xl border border-dashed px-6 py-16 text-center">
        <p className="text-muted-foreground">
          You haven&apos;t verified any listings yet.
        </p>
        <Button nativeButton={false} render={<Link href="/verify" />}>
          Verify your first listing
        </Button>
      </div>
    </main>
  );
}
