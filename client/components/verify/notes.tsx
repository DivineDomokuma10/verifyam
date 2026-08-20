import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Props {
  notes: string;
}

export function Notes({ notes }: Props) {
  if (!notes) return null;

  return (
    <Card className="rounded-md">
      <CardHeader>
        <CardTitle className="text-lg">Notes</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{notes}</p>
      </CardContent>
    </Card>
  );
}