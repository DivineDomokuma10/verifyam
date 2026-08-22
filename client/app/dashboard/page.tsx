"use client";
import Link from "next/link";

import { useGetMe } from "@/hook/queries/user";
import { useListVerifications } from "@/hook/queries/verifications";
import { Button } from "@/components/ui/button";

import { VerificationList } from "@/components/dashboard/verification-list";

function SkeletonCard() {
  return (
    <div
      aria-hidden
      className="h-[104px] animate-pulse rounded-md border border-border bg-card"
    />
  );
}

export default function DashboardPage() {
  const { data, isLoading, error } = useGetMe();
  const verificationsQuery = useListVerifications();

  if (isLoading) {
    return (
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-16">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <div className="h-8 w-40 animate-pulse rounded-md bg-muted" />
            <div className="h-4 w-56 animate-pulse rounded-md bg-muted" />
          </div>
          <div className="h-10 w-36 animate-pulse rounded-md bg-muted" />
        </div>

        <div className="flex flex-col gap-4" aria-busy="true" aria-live="polite">
          <span className="sr-only">Loading your verifications…</span>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
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

  const verified = verifications.filter((v) => v.result === "verified").length;
  const warnings = verifications.filter((v) => v.result === "warning").length;
  const inProgress = verifications.filter((v) => v.status !== "completed").length;

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

      {verifications.length > 0 && (
        <dl className="grid grid-cols-3 gap-3 text-center sm:max-w-md sm:text-left">
          <div className="rounded-md border border-border bg-card px-3 py-3">
            <dt className="text-xs text-muted-foreground">Verified</dt>
            <dd className="font-heading text-2xl font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
              {verified}
            </dd>
          </div>
          <div className="rounded-md border border-border bg-card px-3 py-3">
            <dt className="text-xs text-muted-foreground">Warnings</dt>
            <dd className="font-heading text-2xl font-semibold tabular-nums text-amber-600 dark:text-amber-400">
              {warnings}
            </dd>
          </div>
          <div className="rounded-md border border-border bg-card px-3 py-3">
            <dt className="text-xs text-muted-foreground">In progress</dt>
            <dd className="font-heading text-2xl font-semibold tabular-nums text-primary">
              {inProgress}
            </dd>
          </div>
        </dl>
      )}

      <VerificationList verifications={verifications} />
    </main>
  );
}
