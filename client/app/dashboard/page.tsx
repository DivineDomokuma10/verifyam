"use client";
import Link from "next/link";

import { useGetMe } from "@/hook/queries/user";
import { useListVerifications } from "@/hook/queries/verifications";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const STATUS_LABELS = {
  pending: "Queued",
  calling: "In progress",
  completed: "Completed",
} as const;

const RESULT_STYLES = {
  verified: "text-emerald-600 dark:text-emerald-400",
  warning: "text-amber-600 dark:text-amber-400",
  inconclusive: "text-muted-foreground",
} as const;

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

      {verifications.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-4xl border border-dashed px-6 py-16 text-center">
          <p className="text-muted-foreground">
            You haven&apos;t verified any listings yet.
          </p>
          <Button nativeButton={false} render={<Link href="/verify" />}>
            Verify your first listing
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <h2 className="font-heading text-xl font-semibold">History</h2>

          {verifications.map((verification) => (
            <Link key={verification.id} href={`/verify/${verification.id}`}>
              <Card className="transition-colors hover:bg-muted/40">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg">{verification.address}</CardTitle>
                      <CardDescription>
                        {verification.listingUrl ?? "Manual submission"}
                        {verification.price ? ` · $${verification.price}/month` : ""}
                      </CardDescription>
                    </div>

                    <span
                      className={cn(
                        "text-sm font-medium capitalize",
                        verification.result ? RESULT_STYLES[verification.result] : undefined,
                      )}
                    >
                      {verification.result ?? STATUS_LABELS[verification.status]}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground">
                    {new Date(verification.createdAt).toLocaleDateString()}
                    {verification.status !== "completed"
                      ? ` · ${STATUS_LABELS[verification.status]}`
                      : ` · confidence ${Math.round((verification.confidence ?? 0) * 100)}%`}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}