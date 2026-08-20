import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Props {
  summary: string | null;
  evidence: string[];
}

export function CallSummary({ summary, evidence }: Props) {
  return (
    <Card className="rounded-md">
      <CardHeader>
        <CardTitle className="text-lg">Call summary</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {summary && (
          <p className="text-sm text-muted-foreground">{summary}</p>
        )}

        {evidence.length > 0 && (
          <ul className="flex flex-col gap-1.5">
            {evidence.map((item, index) => (
              <li key={index} className="text-sm text-muted-foreground">
                • {item}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}