import { IVerificationResponse } from "@/interface";

export function InProgress({
  verification,
}: {
  verification: IVerificationResponse;
}) {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col items-center gap-6 px-4 py-16 text-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-3 w-3 animate-pulse rounded-full bg-primary" />
        <h1 className="font-heading text-3xl font-bold">
          {verification.status === "pending" ? "Queued" : "Calling the agent…"}
        </h1>
        <p className="max-w-md text-muted-foreground">
          We&apos;re{" "}
          {verification.status === "pending"
            ? "preparing to call"
            : "on the phone with"}{" "}
          the agent behind{" "}
          <span className="font-medium text-foreground">
            {verification.address}
          </span>
          .
          {verification.attempt > 1 &&
            " (attempt " + verification.attempt + ")"}
        </p>
      </div>

      <p className="text-sm text-muted-foreground">
        This page updates automatically. Results usually arrive within 24 hours.
      </p>
    </main>
  );
}
