import type { Request, Response } from "express";

import { parseListingSchema } from "@/schema";
import { ListingParseError, parseListingUrl } from "@/services";
import { AppError, ok, parseOrThrow } from "@/utils";

const parseListingController = async (req: Request, res: Response) => {
  const { url } = parseOrThrow(parseListingSchema, req.body, "Invalid URL");

  try {
    const preview = await parseListingUrl(url);

    return ok(res, {
      message: "Listing parsed",
      data: preview,
    });
  } catch (error) {
    if (error instanceof ListingParseError) {
      throw AppError.unprocessable(error.message, { cause: error });
    }

    throw AppError.unprocessable("Unable to read this listing URL", {
      cause: error,
    });
  }
};

export default parseListingController;
