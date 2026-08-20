"use client";
import Link from "next/link";

import { useGetMe } from "@/hook/queries/user";
import { useListVerifications } from "@/hook/queries/verifications";
import { Button } from "@/components/ui/button";

import { VerificationList } from "@/components/dashboard/verification-list";

export default function DashboardPage() {
  const { data, isLoading, error } = useGetMe();
  const verificationsQuery = useListVerifications();

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
  const verifications = verificationsQuery.data?.data ?? [];

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-16">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-heading text-3xl font-bold">Dashboard</h1>
          <p className="break-words text-muted-foreground">
            Welcome back, {user.email}.
          </p>
        </div>

        <Button nativeButton={false} render={<Link href="/verify" />}>
          Verify a listing
        </Button>
      </div>

      <VerificationList verifications={verifications} />
    </main>
  );
}