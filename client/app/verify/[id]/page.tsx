"use client";
import { useParams } from "next/navigation";

import { InProgress, Report } from "@/components/verify";
import { useGetVerification } from "@/hook/queries/verifications";

export default function VerificationResultPage() {
  const params = useParams<{ id: string }>();

  const { data, isLoading, error } = useGetVerification(params?.id);

  if (isLoading || !params?.id) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </main>
    );
  }

  if (error || !data?.data) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground">
          Unable to load this verification.
        </p>
      </main>
    );
  }

  const verification = data.data;

  if (verification.status !== "completed") {
    return <InProgress verification={verification} />;
  }

  return <Report verification={verification} />;
}
