import Link from "next/link";

import { cn } from "@/utils";
import { IVerificationResponse } from "@/interface";
import { RESULT_STYLES, STATUS_LABELS } from "@/utils/constant";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Props {
  verification: IVerificationResponse;
}

export function VerificationCard({ verification }: Props) {
  return (
    <Link href={`/verify/${verification.id}`}>
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
  );
}