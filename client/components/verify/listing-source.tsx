import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  url: string;
  onUrlChange: (value: string) => void;
  onParse: () => void;
  onManual: () => void;
  parseError: string | null;
  hasPreview: boolean;
  isParsing: boolean;
  disabled: boolean;
}

export function ListingSource({
  url,
  onUrlChange,
  onParse,
  onManual,
  parseError,
  hasPreview,
  isParsing,
  disabled,
}: Props) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="url" className="text-sm font-medium">
        Listing URL (optional)
      </label>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          id="url"
          type="url"
          placeholder="https://www.zillow.com/…"
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          className="h-12 rounded-md p-4"
        />

        <Button
          type="button"
          variant="outline"
          onClick={onParse}
          disabled={disabled || !url.trim()}
          className="h-12 rounded-md px-6 sm:w-auto"
        >
          {isParsing ? "Reading…" : "Preview"}
        </Button>
      </div>

      {parseError && (
        <p role="alert" className="text-sm text-destructive">
          {parseError}
        </p>
      )}

      {!hasPreview && (
        <button
          type="button"
          onClick={onManual}
          className="self-start text-sm font-medium text-primary hover:underline"
        >
          Enter the details manually instead
        </button>
      )}
    </div>
  );
}