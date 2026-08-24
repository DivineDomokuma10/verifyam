import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const SYNTHETIC_USERS = [
  { email: "demo@verifyam.test", password: "demo-password-123" },
  { email: "reviewer@verifyam.test", password: "reviewer-password-123" },
];

const SYNTHETIC_VERIFICATIONS = [
  {
    source: "url",
    listingUrl: "https://example-rentals.test/listings/42",
    address: "100 Fictional Ave, Sample City, TX 70000",
    price: 1450.0,
    agentName: "Jordan Placeholder",
    agentPhone: "+15555550101",
  },
  {
    source: "manual",
    listingUrl: null,
    address: "7 Demo Lane, Faketown, Lagos",
    price: 800.0,
    agentName: "Alex Sample",
    agentPhone: "+15555550102",
  },
];

function structuredResult(summary: string) {
  return JSON.stringify({
    verdict: "verified",
    confidence: 0.9,
    checks: {
      isReal: "yes",
      isAvailable: "yes",
      priceMatches: "yes",
      photosAccurate: "yes",
      sizeMatches: "yes",
      amenityMatch: "yes",
      moveInDateConfirmed: "yes",
      scamSignals: ["none"],
      notes: summary,
    },
    summary,
    evidence: ["Synthetic call transcript generated for demo purposes."],
    transcript: [
      { speaker: "bot", text: "Hi, I'm calling about the rental listing you posted." },
      { speaker: "user", text: "Yes, the unit is still available for viewing." },
      { speaker: "bot", text: "Great. Can you confirm the monthly rent and move-in date?" },
      { speaker: "user", text: "The rent matches the listing, and move-in is flexible." },
    ],
  });
}

async function main() {
  console.log("Seeding SYNTHETIC demo data — all names, emails, and phone numbers are fabricated.");

  for (const { email, password } of SYNTHETIC_USERS) {
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        passwordHash: await bcrypt.hash(password, 10),
      },
    });

    const existing = await prisma.verification.findFirst({ where: { userId: user.id } });
    if (existing) continue;

    for (const v of SYNTHETIC_VERIFICATIONS) {
      await prisma.verification.create({
        data: {
          userId: user.id,
          ...v,
          status: "completed",
          result: "verified",
          confidence: 0.9,
          calleCallId: `mock_${crypto.randomUUID()}`,
          structuredResult: structuredResult("All checks passed on this synthetic listing."),
        },
      });
    }
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
