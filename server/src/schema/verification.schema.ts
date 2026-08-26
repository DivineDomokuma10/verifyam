import { z } from "zod";

const httpUrl = z.string().url().refine((value) => {
  const protocol = new URL(value).protocol;

  return protocol === "http:" || protocol === "https:";
}, "URL must start with http:// or https://");

export const parseListingSchema = z.object({
  url: httpUrl,
});

const optionalPositiveNumber = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.coerce.number().positive().optional(),
);

export const createVerificationSchema = z.object({
  source: z.enum(["url", "manual"]),
  listingUrl: httpUrl.optional(),
  listingContext: z.string().optional(),
  address: z.string().min(1, "Address is required"),
  price: optionalPositiveNumber,
  agentName: z.string().trim().optional(),
  agentPhone: z.string().min(3, "Agent phone is required"),
});
