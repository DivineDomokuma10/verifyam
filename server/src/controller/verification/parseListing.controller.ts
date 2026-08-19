import type { Request, Response } from "express";

import { parseListingSchema } from "@/schema";
import { ListingParseError, parseListingUrl } from "@/services";

const parseListingController = async (req: Request, res: Response) => {
  const parsed = parseListingSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ status: "error", message: "Invalid URL" });
    return;
  }

  try {
    const preview = await parseListingUrl(parsed.data.url);

    res.json({
      status: "success",
      message: "Listing parsed",
      data: preview,
    });
  } catch (error) {
    const message =
      error instanceof ListingParseError ? error.message : "Unable to read this listing URL";

    res.status(422).json({ status: "error", message });
  }
};

export default parseListingController;