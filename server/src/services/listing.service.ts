import { lookup } from "node:dns/promises";
import net from "node:net";
import * as cheerio from "cheerio";

export interface ListingPreview {
  url: string;
  hostname: string;
  title: string | null;
  description: string | null;
  image: string | null;
  address: string | null;
  price: number | null;
}

const FETCH_TIMEOUT_MS = 10_000;
const MAX_BODY_BYTES = 2 * 1024 * 1024;
const MAX_REDIRECTS = 3;
const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);
const ALLOWED_CONTENT_TYPES = [
  "text/html",
  "application/xhtml+xml",
  "text/plain",
];

const MONTHLY_PRICE_PATTERN =
  /(?:₦|NGN\s?|\$|€|£)\s?(\d+(?:,\d{3})*(?:\.\d{1,2})?)\s*\/?\s*(?:per\s+)?(?:mo|month|p\.?m\.?)/i;

const PRICE_PATTERN = /(?:₦|NGN\s?|\$|€|£)\s?(\d+(?:,\d{3})*(?:\.\d{1,2})?)/;

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

const isPrivateIp = (address: string): boolean => {
  const version = net.isIP(address);

  if (version === 4) {
    const [first = 0, second = 0] = address.split(".").map(Number);

    return (
      first === 0 ||
      first === 10 ||
      first === 127 ||
      first >= 224 ||
      (first === 100 && second >= 64 && second <= 127) ||
      (first === 169 && second === 254) ||
      (first === 172 && second >= 16 && second <= 31) ||
      (first === 192 && second === 168)
    );
  }

  if (version === 6) {
    const normalized = address.toLowerCase();

    return (
      normalized === "::1" ||
      normalized.startsWith("fc") ||
      normalized.startsWith("fd") ||
      normalized.startsWith("fe80:") ||
      normalized.startsWith("::ffff:10.") ||
      normalized.startsWith("::ffff:127.") ||
      normalized.startsWith("::ffff:169.254.") ||
      normalized.startsWith("::ffff:192.168.")
    );
  }

  return false;
};

const assertSafeUrl = async (url: URL): Promise<void> => {
  if (!ALLOWED_PROTOCOLS.has(url.protocol)) {
    throw new ListingParseError("Listing URL must start with http:// or https://");
  }

  const hostname = url.hostname.toLowerCase();

  if (hostname === "localhost" || hostname.endsWith(".localhost")) {
    throw new ListingParseError("Listing URL host is not allowed");
  }

  if (net.isIP(hostname)) {
    if (isPrivateIp(hostname)) {
      throw new ListingParseError("Listing URL host is not allowed");
    }
    return;
  }

  let records: Array<{ address: string }>;

  try {
    records = await lookup(hostname, { all: true, verbatim: true });
  } catch {
    throw new ListingParseError();
  }

  if (records.length === 0 || records.some((record) => isPrivateIp(record.address))) {
    throw new ListingParseError("Listing URL host is not allowed");
  }
};

const fetchListing = async (initialUrl: URL): Promise<Response> => {
  let url = initialUrl;

  for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount += 1) {
    await assertSafeUrl(url);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    let response: Response;

    try {
      response = await fetch(url, {
        redirect: "manual",
        signal: controller.signal,
        headers: { "User-Agent": "Mozilla/5.0 (compatible; VerifyBot/1.0)" },
      });
    } catch {
      throw new ListingParseError();
    } finally {
      clearTimeout(timeout);
    }

    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get("location");

      if (!location) throw new ListingParseError();

      url = new URL(location, url);
      continue;
    }

    return response;
  }

  throw new ListingParseError("Too many redirects while reading listing URL");
};

const readLimitedText = async (response: Response): Promise<string> => {
  const contentLength = Number(response.headers.get("content-length"));

  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    throw new ListingParseError("Listing page is too large to parse");
  }

  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";

  if (
    contentType &&
    !ALLOWED_CONTENT_TYPES.some((allowedType) => contentType.includes(allowedType))
  ) {
    throw new ListingParseError("Listing URL did not return a readable page");
  }

  if (!response.body) return "";

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let totalBytes = 0;
  let html = "";

  while (true) {
    const { done, value } = await reader.read();

    if (done) break;

    totalBytes += value.byteLength;

    if (totalBytes > MAX_BODY_BYTES) {
      await reader.cancel();
      throw new ListingParseError("Listing page is too large to parse");
    }

    html += decoder.decode(value, { stream: true });
  }

  return html + decoder.decode();
};

const collectJsonLd = (
  node: unknown,
  onAddress: (address: string) => void,
  onPrice: (price: number) => void,
): void => {
  if (!node || typeof node !== "object") return;

  if (Array.isArray(node)) {
    node.forEach((item) => collectJsonLd(item, onAddress, onPrice));
    return;
  }

  const obj = node as Record<string, unknown>;
  const address = obj.address;

  if (typeof address === "string" && address.trim()) {
    onAddress(address.trim());
  } else if (address && typeof address === "object" && !Array.isArray(address)) {
    const addressObject = address as Record<string, unknown>;
    const parts = [
      addressObject.streetAddress,
      addressObject.addressLocality,
      addressObject.addressRegion,
      addressObject.postalCode,
      addressObject.addressCountry,
    ].filter((value): value is string => typeof value === "string" && value.trim() !== "");

    if (parts.length > 0) {
      onAddress(parts.join(", "));
    }
  }

  const offers = obj.offers;
  const offersObject =
    offers && typeof offers === "object" && !Array.isArray(offers)
      ? (offers as Record<string, unknown>)
      : null;
  const priceValue =
    typeof obj.price === "string" || typeof obj.price === "number"
      ? obj.price
      : offersObject?.price;

  if (typeof priceValue === "number" && priceValue > 0) {
    onPrice(priceValue);
  } else if (typeof priceValue === "string" && priceValue.trim()) {
    const parsed = Number(priceValue.replace(/[^\d.]/g, ""));
    if (Number.isFinite(parsed) && parsed > 0) {
      onPrice(parsed);
    }
  }

  Object.values(obj).forEach((value) => collectJsonLd(value, onAddress, onPrice));
};

const extractJsonLd = (
  $: cheerio.CheerioAPI,
  fallbackAddress: string | null,
  fallbackPrice: number | null,
): { address: string | null; price: number | null } => {
  let address = fallbackAddress;
  let price = fallbackPrice;

  $('script[type="application/ld+json"]').each((_, element) => {
    const raw = $(element).html();

    if (!raw) return;

    let parsed: unknown;

    try {
      parsed = JSON.parse(raw);
    } catch {
      return;
    }

    collectJsonLd(parsed, (value) => {
      if (address === null) address = value;
    }, (value) => {
      if (price === null) price = value;
    });
  });

  return { address, price };
};

const suggestAddressFromTitle = (title: string | null): string | null => {
  if (!title) return null;

  const cleaned = title
    .replace(/\s*\|\s*[^|]+$/, "")
    .replace(/\s+[-–—]\s+[^-–—]+$/, "")
    .trim();

  if (!cleaned || cleaned.length < 5) return null;

  return cleaned;
};

const matchPrice = (texts: Array<string | null>, pattern: RegExp): number | null => {
  for (const text of texts) {
    if (!text) continue;

    const match = text.match(pattern);

    if (match) {
      const value = Number(match[1].replace(/,/g, ""));

      if (Number.isFinite(value) && value > 0) {
        return value;
      }
    }
  }

  return null;
};

export async function parseListingUrl(rawUrl: string): Promise<ListingPreview> {
  const url = new URL(rawUrl);
  const response = await fetchListing(url);

  if (!response.ok) {
    throw new ListingParseError();
  }

  const html = await readLimitedText(response);
  const finalUrl = new URL(response.url || url.toString());
  const $ = cheerio.load(html);

  const ogTitle = $('meta[property="og:title"]').attr("content");
  const ogDescription = $('meta[property="og:description"]').attr("content");
  const ogImage = $('meta[property="og:image"]').attr("content");

  const title = ogTitle?.trim() || $("title").first().text().trim() || null;
  const description = ogDescription?.trim() || null;

  const titleSuggestion = suggestAddressFromTitle(title);
  const { address, price } = extractJsonLd($, titleSuggestion, null);

  const suggestedPrice =
    matchPrice([description, title], MONTHLY_PRICE_PATTERN) ??
    price ??
    matchPrice([description, title], PRICE_PATTERN);

  return {
    url: finalUrl.toString(),
    hostname: finalUrl.hostname.replace(/^www\./, ""),
    title,
    description,
    image: resolveUrl(ogImage?.trim(), finalUrl.toString()),
    address,
    price: suggestedPrice,
  };
}
