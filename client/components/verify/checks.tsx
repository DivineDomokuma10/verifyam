import {
  RiCheckLine,
  RiCloseLine,
  RiQuestionLine,
} from "@remixicon/react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/utils";
import { IVerificationResultChecks } from "@/interface";
import { CHECK_LABELS, FIELD_STYLES } from "@/utils/constant";

const CONFIDENCE_STYLES = {
  yes: "bg-primary",
  no: "bg-destructive",
  unknown: "bg-muted-foreground/40",
} as const;

const CHECK_ICONS = {
  yes: RiCheckLine,
  no: RiCloseLine,
  unknown: RiQuestionLine,
} as const;

interface Props {
  checks: IVerificationResultChecks;
  confidence: number;
}

export function Checks({ checks, confidence }: Props) {
  const confidencePct = Math.round((confidence ?? 0) * 100);

  return (
    <Card className="rounded-md">
      <CardHeader>
        <CardTitle className="text-lg">Checks</CardTitle>
        <CardDescription>Answers from the recorded call</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Call confidence</span>
            <span className="font-medium tabular-nums text-foreground">
              {confidencePct}%
            </span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={confidencePct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Call confidence"
            className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
          >
            <div
              className={cn(
                "h-full rounded-full transition-all",
                checks.isReal === "no" || checks.priceMatches === "no"
                  ? CONFIDENCE_STYLES.no
                  : CONFIDENCE_STYLES.yes,
              )}
              style={{ width: `${Math.max(confidencePct, 2)}%` }}
            />
          </div>
        </div>

        <ul className="flex flex-col divide-y divide-border">
          {CHECK_LABELS.map(({ key, label }) => {
            const value = checks[key];
            const Icon = CHECK_ICONS[value];

            return (
              <li key={key} className="flex items-center justify-between py-2">
                <span className="flex items-center gap-2 text-sm">
                  <Icon
                    className={cn(
                      "size-4 shrink-0",
                      FIELD_STYLES[value],
                    )}
                    aria-hidden
                  />
                  <span className="text-muted-foreground">{label}</span>
                </span>

                <span
                  className={cn("text-sm font-medium capitalize", FIELD_STYLES[value])}
                >
                  {value}
                </span>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
