import { z } from "zod";

const optionalPositiveNumber = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.coerce.number().positive("Enter a valid monthly price").optional(),
);

export const verifyListingSchema = z.object({
  address: z.string().min(1, "Address is required"),
  price: optionalPositiveNumber,
  agentName: z.string().trim().optional(),
  agentPhone: z.string().min(3, "Agent phone is required"),
});

export type TVerifyListingValues = z.infer<typeof verifyListingSchema>;
