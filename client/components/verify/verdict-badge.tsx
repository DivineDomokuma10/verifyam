import { cn } from "@/utils";
import { IVerificationResponse } from "@/interface";
import { VERDICT_STYLES } from "@/utils/constant";

interface Props {
  result: NonNullable<IVerificationResponse["result"]>;
}

export function VerdictBadge({ result }: Props) {
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