import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/utils";

interface Props {
  turns: Array<{ speaker: string; text: string }>;
}

export function Transcript({ turns }: Props) {
  if (turns.length === 0) return null;

  return (
    <Card className="rounded-md">
      <CardHeader>
        <CardTitle className="text-lg">Transcript</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex max-h-96 flex-col gap-4 overflow-y-auto rounded-lg border bg-muted/40 p-4">
          {turns.map((turn, index) => {
            const isBot = turn.speaker === "bot";

            return (
              <div
                key={index}
                className={cn(
                  "flex flex-col gap-1",
                  isBot ? "items-start" : "items-end",
                )}
              >
                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {isBot ? "VERIFY" : "Agent"}
                </span>
                <div
                  className={cn(
                    "max-w-[80%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm",
                    isBot
                      ? "rounded-bl-sm bg-primary text-primary-foreground"
                      : "rounded-br-sm border bg-card text-foreground",
                  )}
                >
                  {turn.text}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}