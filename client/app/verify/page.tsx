"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useCreateVerification, useParseListing } from "@/hook/queries/verifications";
import type { TVerifyListingValues } from "@/schemas/verification";
import type { IListingPreview } from "@/interface";
import { getMutationError } from "@/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { ListingSource } from "@/components/verify/listing-source";
import { ListingPreview } from "@/components/verify/listing-preview";
import { DetailsForm } from "@/components/verify/details-form";

type SubmitSource = "url" | "manual";

export default function VerifyPage() {
  const router = useRouter();

  const [url, setUrl] = useState("");
  const [source, setSource] = useState<SubmitSource>("url");
  const [preview, setPreview] = useState<IListingPreview | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  const parseMutation = useParseListing();
  const createMutation = useCreateVerification();

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

  const handleSubmit = (values: TVerifyListingValues) => {
    createMutation.mutate(
      {
        source,
        listingUrl: preview?.url,
        listingContext: preview
          ? JSON.stringify({ title: preview.title, description: preview.description })
          : undefined,
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
          <ListingSource
            url={url}
            onUrlChange={setUrl}
            onParse={handleParse}
            onManual={handleManualEntry}
            parseError={parseError}
            hasPreview={Boolean(preview)}
            isParsing={parseMutation.isPending}
            disabled={isPending}
          />

          {preview && <ListingPreview preview={preview} />}

          <DetailsForm
            key={preview?.url ?? source}
            defaultValues={{
              address: preview?.address ?? undefined,
              price: preview?.price ?? undefined,
            }}
            onSubmit={handleSubmit}
            isSubmitting={createMutation.isPending}
            submitError={submitError}
            disabled={isPending}
          />
        </CardContent>
      </Card>
    </main>
  );
}