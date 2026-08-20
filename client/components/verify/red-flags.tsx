import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Props {
  signals: string[];
}

export function RedFlags({ signals }: Props) {
  if (signals.length === 0) return null;

  return (
    <Card className="rounded-md">
      <CardHeader>
        <CardTitle className="text-lg text-destructive">
          Red flags
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-1.5 text-sm">
          {signals.map((signal) => (
            <li key={signal} className="capitalize text-destructive">
              {signal.replaceAll("_", " ")}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}