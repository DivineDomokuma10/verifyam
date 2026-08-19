import { parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js";

import { env } from "@/config";

export function normalizePhone(
  input: string,
  defaultRegion: string = env.DEFAULT_PHONE_REGION,
): string {
  const parsed = parsePhoneNumberFromString(input, defaultRegion as CountryCode);

  if (!parsed?.isValid()) {
    throw new Error("Invalid phone number");
  }

  return parsed.number;
}