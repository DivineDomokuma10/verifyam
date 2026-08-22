"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  RiArrowLeftLine,
  RiCheckLine,
  RiPhoneLine,
} from "@remixicon/react";

import { cn } from "@/utils";
import { IVerificationResponse } from "@/interface";

const STEPS = ["Queued", "Calling", "Report"] as const;

function formatElapsed(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function InProgress({
  verification,
}: {
  verification: IVerificationResponse;
}) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const startedAt = new Date(verification.createdAt).getTime();

    const tick = () => {
      setElapsedSeconds(
        Math.max(0, Math.floor((Date.now() - startedAt) / 1000)),
      );
    };

    tick();
    const interval = setInterval(tick, 1000);

    return () => clearInterval(interval);
  }, [verification.createdAt]);

  const currentStep =
    verification.status === "pending"
      ? 0
      : verification.status === "calling"
        ? 1
        : 2;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col items-center gap-10 px-4 py-16">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="relative flex size-14 items-center justify-center rounded-full bg-primary/10">
          <RiPhoneLine
            className={cn(
              "size-6 text-primary",
              verification.status === "calling" && "animate-pulse",
            )}
          />
          {verification.status === "calling" && (
            <span className="absolute inset-0 animate-ping rounded-full bg-primary/10" />
          )}
        </span>

        <h1 className="font-heading text-3xl font-bold">
          {verification.status === "pending"
            ? "Queued for verification"
            : "Calling the agent…"}
        </h1>
        <p className="max-w-md text-pretty text-muted-foreground">
          We&apos;re{" "}
          {verification.status === "pending"
            ? "preparing to call"
            : "on the phone with"}{" "}
          the agent behind{" "}
          <span className="font-medium text-foreground">
            {verification.address}
          </span>
          . This page updates automatically every few seconds — no need to
          refresh.
        </p>
      </div>

      <ol className="flex w-full max-w-sm items-center">
        {STEPS.map((step, index) => {
          const isDone = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <li key={step} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <span
                  className={cn(
                    "flex size-7 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
                    isDone &&
                      "border-primary bg-primary text-primary-foreground",
                    isCurrent &&
                      "border-primary bg-primary/10 text-primary",
                    !isDone &&
                      !isCurrent &&
                      "border-border bg-muted text-muted-foreground",
                  )}
                >
                  {isDone ? (
                    <RiCheckLine className="size-4" />
                  ) : (
                    index + 1
                  )}
                </span>
                <span
                  className={cn(
                    "text-xs font-medium",
                    isCurrent ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {step}
                </span>
              </div>

              {index < STEPS.length - 1 && (
                <span
                  className={cn(
                    "mx-2 mb-5 h-px flex-1",
                    index < currentStep ? "bg-primary" : "bg-border",
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>

      <div className="flex flex-col items-center gap-1 text-sm text-muted-foreground">
        <span className="font-mono text-lg font-medium tabular-nums text-foreground">
          {formatElapsed(elapsedSeconds)}
        </span>
        <span>elapsed · results usually arrive within minutes</span>
        {verification.attempt > 1 && (
          <span className="text-xs">attempt {verification.attempt} of 2</span>
        )}
      </div>

      <Link
        href="/dashboard"
        className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <RiArrowLeftLine className="size-4" />
        Back to dashboard
      </Link>
    </main>
  );
}
