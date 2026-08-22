import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { verifyListingSchema } from "@/schemas/verification";
import type { TVerifyListingValues } from "@/schemas/verification";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  defaultValues: { address?: string; price?: number };
  onSubmit: (values: TVerifyListingValues) => void;
  isSubmitting: boolean;
  submitError: string | null;
  disabled: boolean;
}

export function DetailsForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  submitError,
  disabled,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TVerifyListingValues>({
    resolver: zodResolver(verifyListingSchema),
    defaultValues: {
      address: defaultValues.address ?? "",
      price: defaultValues.price,
      agentName: "",
      agentPhone: "",
    },
  });

  return (
    <form
      noValidate
      className="flex flex-col gap-4"
      onSubmit={handleSubmit(onSubmit)}
    >
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
        disabled={disabled}
        className="h-12 rounded-md p-4"
      >
        {isSubmitting ? "Starting…" : "Verify this listing"}
      </Button>

      <p className="text-xs text-pretty text-muted-foreground">
        An AI voice agent will call this number and identify itself as an
        automated verification service. Please only submit numbers you are
        authorized to have contacted.
      </p>
    </form>
  );
}