import { z } from "zod";

export const verifyListingSchema = z.object({
  address: z.string().min(1, "Address is required"),
  price: z.coerce
    .number()
    .positive("Enter a valid monthly price")
    .optional(),
  agentName: z.string().trim().optional(),
  agentPhone: z.string().min(3, "Agent phone is required"),
});

export type TVerifyListingValues = z.infer<typeof verifyListingSchema>;