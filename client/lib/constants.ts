import {
  RiHome5Line,
  RiCalendarCheckLine,
  RiPriceTag3Line,
  RiShieldCheckLine,
  RiFileList3Line,
  RiLink,
  RiPhoneLine,
  RiFileCheckLine,
} from "@remixicon/react";

export const CHECKS = [
  {
    icon: RiHome5Line,
    title: "It's real",
    body: "The property exists, confirmed with the owner or agent behind it.",
  },
  {
    icon: RiCalendarCheckLine,
    title: "It's available",
    body: 'We don\'t trust the "Available now" button. We ask the person who would rent it to you.',
  },
  {
    icon: RiPriceTag3Line,
    title: "It's accurate",
    body: "Price, photos, size, amenities, and move-in date match what's actually offered.",
  },
  {
    icon: RiShieldCheckLine,
    title: "It's not a scam",
    body: 'Deposit-before-tour, wire-only, "I\'m abroad" — we catch the classic fraud tells.',
  },
  {
    icon: RiFileList3Line,
    title: "Instant report",
    body: "A shareable verdict with call summary, confidence score, and red flags.",
  },
  {
    icon: RiLink,
    title: "Works with any listing",
    body: "Zillow, Apartments.com, Facebook, Craigslist, or your own site. If it's online, we'll verify it.",
  },
];

export const STEPS = [
  {
    icon: RiLink,
    title: "Paste any listing",
    body: "A link from any platform. No signup walls, no paperwork.",
  },
  {
    icon: RiPhoneLine,
    title: "We call to confirm",
    body: "An AI voice agent calls the agent or landlord, asks the hard questions, and checks the listing is real, available, and accurate. The call identifies itself as an automated verification service.",
  },
  {
    icon: RiFileCheckLine,
    title: "Get your verdict",
    body: "A clear Verified or Warning report — usually within 24 hours.",
  },
];

export const AUDIENCES = [
  {
    id: "for-renters",
    heading: "For renters",
    points: [
      "Stop wasting weekends on tours that were never going to happen.",
      "Catch scams before they catch your deposit.",
      "Walk in knowing the price, photos, and availability are real.",
    ],
    cta: "Verify a listing free",
    href: "#verify",
  },
];

export const FAQS = [
  {
    q: "How is this different from a background check?",
    a: "We don't guess. We talk to the person behind the listing and confirm what's actually available today.",
  },
  {
    q: "Does it work for any listing site?",
    a: "Yes — paste a link from any platform.",
  },
  {
    q: "How fast is it?",
    a: "Most listings are verified within minutes of submitting.",
  },
  {
    q: "What if a verified listing turns out wrong?",
    a: "Your report documents everything, including the full call transcript. It reflects what the contact said — it's not an independent guarantee.",
  },
  {
    q: "Who does the calling?",
    a: "An AI voice agent calls the agent or landlord directly and identifies itself as an automated verification service, so you never play phone tag.",
  },
];
