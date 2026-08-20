import Link from "next/link";
import { RiArrowLeftFill } from "@remixicon/react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { IVerificationResponse } from "@/interface";

import { VerdictBadge } from "./verdict-badge";
import { Checks } from "./checks";
import { RedFlags } from "./red-flags";
import { CallSummary } from "./call-summary";
import { Notes } from "./notes";
import { Transcript } from "./transcript";

interface Props {
  verification: IVerificationResponse;
}

export function Report({ verification }: Props) {
  const structured = verification.structuredResult;

  if (!structured) {
    return (
      <main className="mx-auto flex w-full max-w-2xl px-4 py-16">
        <Card className="w-full">
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              The report for this verification is unavailable.
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  const checks = structured.checks;
  const scamSignals = checks.scamSignals.filter((signal) => signal !== "none");

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-16">
      <Button
        nativeButton={false}
        className="self-start"
        render={<Link href="/dashboard" />}
      >
        <RiArrowLeftFill />
        Back to dashboard
      </Button>

      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-heading text-3xl font-bold">
            {verification.address}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {verification.listingUrl ? (
              <a
                href={verification.listingUrl}
                target="_blank"
                rel="noreferrer"
                className="hover:underline"
              >
                View original listing
              </a>
            ) : (
              "Manual submission"
            )}
          </p>
        </div>

        <VerdictBadge result={verification.result ?? "inconclusive"} />
      </div>

      {verification.price && (
        <p className="text-sm text-muted-foreground">
          Listed at{" "}
          <span className="font-medium text-foreground">
            ${verification.price}/month
          </span>
          {verification.agentName ? ` · ${verification.agentName}` : ""}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Checks checks={checks} confidence={structured.confidence} />

        <div className="flex flex-col gap-4">
          <RedFlags signals={scamSignals} />
          <CallSummary
            summary={structured.summary}
            evidence={structured.evidence}
          />
        </div>
      </div>

      <Notes notes={checks.notes} />
      <Transcript turns={structured.transcript} />
    </main>
  );
}