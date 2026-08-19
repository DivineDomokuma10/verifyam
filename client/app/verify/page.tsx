"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { verifyListingSchema } from "@/schemas/verification";
import type { TVerifyListingValues } from "@/schemas/verification";
import { useCreateVerification, useParseListing } from "@/hook/queries/verifications";
import type { IListingPreview } from "@/interface";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getMutationError } from "@/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type SubmitSource = "url" | "manual";

export default function VerifyPage() {
  const router = useRouter();

  const [url, setUrl] = useState("");
  const [source, setSource] = useState<SubmitSource>("url");
  const [preview, setPreview] = useState<IListingPreview | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  const parseMutation = useParseListing();
  const createMutation = useCreateVerification();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TVerifyListingValues>({
    resolver: zodResolver(verifyListingSchema),
    defaultValues: { address: "", price: undefined, agentName: "", agentPhone: "" },
  });

  const handleParse = () => {
    if (!url.trim()) return;

    setParseError(null);
    parseMutation.mutate(url, {
      onSuccess: (res) => {
        if (res.data) {
          setPreview(res.data);
          setSource("url");
        }
      },
      onError: (error) => {
        setPreview(null);
        setSource("manual");
        setParseError(getMutationError(error, "We couldn't read that listing. Enter the details manually instead."));
      },
    });
  };

  const handleManualEntry = () => {
    setSource("manual");
    setPreview(null);
    setParseError(null);
  };

  const onSubmit = (values: TVerifyListingValues) => {
    createMutation.mutate(
      {
        source,
        listingUrl: preview?.url,
        address: values.address,
        price: values.price,
        agentName: values.agentName,
        agentPhone: values.agentPhone,
      },
      {
        onSuccess: (res) => {
          if (res.data) {
            router.push(`/verify/${res.data.id}`);
          }
        },
      },
    );
  };

  const submitError = createMutation.error
    ? getMutationError(createMutation.error, "Could not start the verification. Please try again.")
    : null;

  const isPending = parseMutation.isPending || createMutation.isPending;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-16">
      <div className="text-center">
        <h1 className="font-heading text-3xl font-bold">Verify a listing</h1>
        <p className="mx-auto mt-2 max-w-lg text-pretty text-muted-foreground">
          Paste a listing link, or enter the details manually, and we&apos;ll
          call the agent or landlord to confirm it&apos;s real, available, and
          accurate.
        </p>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl">Listing details</CardTitle>
          <CardDescription>
            The agent phone is required — that&apos;s who we call.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-6">
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
                onChange={(e) => setUrl(e.target.value)}
                className="h-12 rounded-md p-4"
              />

              <Button
                type="button"
                variant="outline"
                onClick={handleParse}
                disabled={isPending || !url.trim()}
                className="h-12 rounded-md px-6 sm:w-auto"
              >
                {parseMutation.isPending ? "Reading…" : "Preview"}
              </Button>
            </div>

            {parseError && (
              <p role="alert" className="text-sm text-destructive">
                {parseError}
              </p>
            )}

            {!preview && (
              <button
                type="button"
                onClick={handleManualEntry}
                className="self-start text-sm font-medium text-primary hover:underline"
              >
                Enter the details manually instead
              </button>
            )}
          </div>

          {preview && (
            <div className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center">
              {preview.image && (
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
                {preview.description && (
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {preview.description}
                  </p>
                )}
              </div>
            </div>
          )}

          <form noValidate className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="address" className="text-sm font-medium">
                Address
              </label>

              <Input
                id="address"
                placeholder="e.g. 1234 Maple St, Austin, TX"
                aria-invalid={Boolean(errors.address)}
                {...register("address")}
                className="h-12 rounded-md p-4"
              />

              {errors.address && (
                <p className="text-sm text-destructive">{errors.address.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="price" className="text-sm font-medium">
                Monthly price (optional)
              </label>

              <Input
                id="price"
                type="number"
                min="1"
                step="0.01"
                placeholder="e.g. 1800"
                aria-invalid={Boolean(errors.price)}
                {...register("price")}
                className="h-12 rounded-md p-4"
              />

              {errors.price && (
                <p className="text-sm text-destructive">{errors.price.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="agentName" className="text-sm font-medium">
                Agent or landlord name (optional)
              </label>

              <Input
                id="agentName"
                placeholder="e.g. Jane Doe"
                {...register("agentName")}
                className="h-12 rounded-md p-4"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="agentPhone" className="text-sm font-medium">
                Agent or landlord phone
              </label>

              <Input
                id="agentPhone"
                type="tel"
                placeholder="e.g. +1 555 010 1234"
                aria-invalid={Boolean(errors.agentPhone)}
                {...register("agentPhone")}
                className="h-12 rounded-md p-4"
              />

              {errors.agentPhone && (
                <p className="text-sm text-destructive">{errors.agentPhone.message}</p>
              )}
            </div>

            {submitError && (
              <p role="alert" className="text-sm text-destructive">
                {submitError}
              </p>
            )}

            <Button
              type="submit"
              disabled={isPending}
              className="h-12 rounded-md p-4"
            >
              {createMutation.isPending ? "Starting…" : "Verify this listing"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}