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
    body: "Our team reaches out to the agent or landlord, asks the hard questions, and checks the listing is real, available, and accurate.",
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
  {
    id: "for-agents",
    heading: "For landlords / agents",
    points: [
      "Back your listings with a Verified badge no one else offers.",
      "Answer \"is this real?\" once — with a third-party check.",
      "Reduce time-wasters and dead leads from stale listings.",
    ],
    cta: "Get your listings verified",
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
    a: "Most listings verified within 24 hours.",
  },
  {
    q: "What if a verified listing turns out wrong?",
    a: "Your report documents everything. If we got it wrong, we'll make it right.",
  },
  {
    q: "Who does the calling?",
    a: "Our verification team reaches the agent or landlord directly, so you never play phone tag.",
  },
];
