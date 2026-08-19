import { z } from "zod";

export const parseListingSchema = z.object({
  url: z.string().url("Enter a valid URL"),
});

export const createVerificationSchema = z.object({
  source: z.enum(["url", "manual"]),
  listingUrl: z.string().url().optional(),
  address: z.string().min(1, "Address is required"),
  price: z.coerce.number().positive().optional(),
  agentName: z.string().trim().optional(),
  agentPhone: z.string().min(3, "Agent phone is required"),
});