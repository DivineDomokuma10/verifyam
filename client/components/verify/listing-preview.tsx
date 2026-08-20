import { IListingPreview } from "@/interface";

interface Props {
  preview: IListingPreview;
}

export function ListingPreview({ preview }: Props) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center">
      {preview.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview.image}
          alt=""
          className="h-24 w-full rounded-lg object-cover sm:w-32"
        />
      )}

      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {preview.hostname}
        </p>
        <p className="font-medium">{preview.title ?? "Listing preview"}</p>
        {(preview.address || preview.price) && (
          <p className="text-sm font-medium text-primary">
            {[preview.address, preview.price ? `$${preview.price}/month` : null]
              .filter(Boolean)
              .join(" · ")}
          </p>
        )}
        {preview.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {preview.description}
          </p>
        )}
      </div>
    </div>
  );
}