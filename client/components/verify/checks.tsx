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

interface Props {
  checks: IVerificationResultChecks;
  confidence: number;
}

export function Checks({ checks, confidence }: Props) {
  return (
    <Card className="rounded-md">
      <CardHeader>
        <CardTitle className="text-lg">Checks</CardTitle>
        <CardDescription>
          Confidence {Math.round((confidence ?? 0) * 100)}%
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
  );
}