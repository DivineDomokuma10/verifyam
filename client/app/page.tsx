import Audiences from "@/components/landing/audiences";
import Faq from "@/components/landing/faq";
import FinalCta from "@/components/landing/final-cta";
import Hero from "@/components/landing/hero";
import HowItWorks from "@/components/landing/how-it-works";
import Problem from "@/components/landing/problem";
import WhatWeVerify from "@/components/landing/what-we-verify";

export default function Home() {
  return (
    <main className="flex w-full flex-1 flex-col items-center gap-20 bg-background p-5 md:gap-24 md:p-10">
      <Hero />
      <Problem />
      <HowItWorks />
      <WhatWeVerify />
      <Audiences />
      <Faq />
      <FinalCta />
    </main>
  );
}
