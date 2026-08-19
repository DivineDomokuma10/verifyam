import * as cheerio from "cheerio";

export interface ListingPreview {
  url: string;
  hostname: string;
  title: string | null;
  description: string | null;
  image: string | null;
}

const FETCH_TIMEOUT_MS = 10_000;
const MAX_BODY_BYTES = 2 * 1024 * 1024;

const resolveUrl = (value: string | undefined, base: string): string | null => {
  if (!value || !value.trim()) return null;

  try {
    return new URL(value, base).toString();
  } catch {
    return null;
  }
};

export class ListingParseError extends Error {
  constructor(message = "Unable to read this listing URL") {
    super(message);
    this.name = "ListingParseError";
  }
}

export async function parseListingUrl(rawUrl: string): Promise<ListingPreview> {
  const url = new URL(rawUrl);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let response: Response;

  try {
    response = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; VerifyBot/1.0)" },
    });
  } catch {
    throw new ListingParseError();
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new ListingParseError();
  }

  const html = await response.text();
  const $ = cheerio.load(html.slice(0, MAX_BODY_BYTES));

  const ogTitle = $('meta[property="og:title"]').attr("content");
  const ogDescription = $('meta[property="og:description"]').attr("content");
  const ogImage = $('meta[property="og:image"]').attr("content");

  return {
    url: url.toString(),
    hostname: url.hostname.replace(/^www\./, ""),
    title: ogTitle?.trim() || $("title").first().text().trim() || null,
    description: ogDescription?.trim() || null,
    image: resolveUrl(ogImage?.trim(), url.toString()),
  };
}