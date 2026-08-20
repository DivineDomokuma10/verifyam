import Link from "next/link";

import { Button } from "@/components/ui/button";
import { IVerificationResponse } from "@/interface";

import { VerificationCard } from "./verification-card";

interface Props {
  verifications: IVerificationResponse[];
}

export function VerificationList({ verifications }: Props) {
  if (verifications.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-4xl border border-dashed px-6 py-16 text-center">
        <p className="text-muted-foreground">
          You haven&apos;t verified any listings yet.
        </p>
        <Button nativeButton={false} render={<Link href="/verify" />}>
          Verify your first listing
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-heading text-xl font-semibold">History</h2>

      {verifications.map((verification) => (
        <VerificationCard key={verification.id} verification={verification} />
      ))}
    </div>
  );
}