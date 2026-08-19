import Link from "next/link";
import { RiArrowLeftFill } from "@remixicon/react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { cn } from "@/utils";
import { IVerificationResponse } from "@/interface";
import { CHECK_LABELS, FIELD_STYLES, VERDICT_STYLES } from "@/utils/constant";

interface Props {
  verification: IVerificationResponse;
}

interface VerdictBadgeProps {
  result: NonNullable<IVerificationResponse["result"]>;
}

export function VerdictBadge({ result }: VerdictBadgeProps) {
  const style = VERDICT_STYLES[result];

  return (
    <span
      className={cn(
        "rounded-full px-4 py-1.5 text-sm font-semibold",
        style.badge,
      )}
    >
      {style.label}
    </span>
  );
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
        <Card className="rounded-md">
          <CardHeader>
            <CardTitle className="text-lg">Checks</CardTitle>
            <CardDescription>
              Confidence {Math.round((structured.confidence ?? 0) * 100)}%
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {CHECK_LABELS.map(({ key, label }) => (
              <div
                key={key}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span className="text-muted-foreground">{label}</span>
                <span
                  className={cn(
                    "font-medium capitalize",
                    FIELD_STYLES[checks[key]],
                  )}
                >
                  {checks[key]}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          {scamSignals.length > 0 && (
            <Card className="rounded-md">
              <CardHeader>
                <CardTitle className="text-lg text-destructive">
                  Red flags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="flex flex-col gap-1.5 text-sm">
                  {scamSignals.map((signal) => (
                    <li key={signal} className="capitalize text-destructive">
                      {signal.replaceAll("_", " ")}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <Card className="rounded-md">
            <CardHeader>
              <CardTitle className="text-lg">Call summary</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {structured.summary && (
                <p className="text-sm text-muted-foreground">
                  {structured.summary}
                </p>
              )}

              {structured.evidence.length > 0 && (
                <ul className="flex flex-col gap-1.5">
                  {structured.evidence.map((item, index) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      • {item}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {checks.notes && (
        <Card className="rounded-md">
          <CardHeader>
            <CardTitle className="text-lg">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{checks.notes}</p>
          </CardContent>
        </Card>
      )}

      {structured.transcript.length > 0 && (
        <Card className="rounded-md">
          <CardHeader>
            <CardTitle className="text-lg">Transcript</CardTitle>
          </CardHeader>
          <CardContent className="flex max-h-96 flex-col gap-3 overflow-y-auto">
            {structured.transcript.map((turn, index) => (
              <p key={index} className="text-sm">
                <span className="mr-2 font-semibold capitalize">
                  {turn.speaker === "bot" ? "VERIFY" : "Agent"}:
                </span>
                {turn.text}
              </p>
            ))}
          </CardContent>
        </Card>
      )}
    </main>
  );
}
