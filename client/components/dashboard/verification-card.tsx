import Link from "next/link";

import { IVerificationResponse } from "@/interface";
import { STATUS_LABELS } from "@/utils/constant";
import { formatRelativeTime } from "@/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { VerdictBadge } from "@/components/verify/verdict-badge";

interface Props {
  verification: IVerificationResponse;
}

export function VerificationCard({ verification }: Props) {
  const isCompleted = verification.status === "completed";

  return (
    <Link href={`/verify/${verification.id}`} className="group">
      <Card className="transition-colors hover:bg-muted/40">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <CardTitle className="truncate text-lg transition-colors group-hover:text-primary">
                {verification.address}
              </CardTitle>
              <CardDescription className="truncate">
                {verification.listingUrl ?? "Manual submission"}
                {verification.price ? ` · $${verification.price}/month` : ""}
              </CardDescription>
            </div>

            {isCompleted && verification.result ? (
              <VerdictBadge result={verification.result} />
            ) : (
              <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
                <span className="size-1.5 animate-pulse rounded-full bg-current" />
                {STATUS_LABELS[verification.status]}
              </span>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <p className="text-xs text-muted-foreground">
            {formatRelativeTime(verification.createdAt)}
            {isCompleted
              ? ` · confidence ${Math.round((verification.confidence ?? 0) * 100)}%`
              : ` · ${STATUS_LABELS[verification.status].toLowerCase()} — updates automatically`}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
