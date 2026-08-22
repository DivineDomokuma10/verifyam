import { RiArrowRightLine, RiCheckDoubleFill } from "@remixicon/react";

import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <section className="flex w-full flex-col items-center gap-6 py-20 text-center md:py-28">
      <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium tracking-wide text-primary uppercase">
        <RiCheckDoubleFill className="size-3.5" />
        Transcript-backed apartment listings
      </span>

      <h1 className="font-heading max-w-3xl text-4xl leading-tight font-bold text-balance md:text-6xl">
        Don&apos;t just find it.{" "}
        <span className="text-primary">Verify it.</span>
      </h1>

      <p className="max-w-2xl text-base text-pretty text-muted-foreground md:text-lg">
        We call the agent or landlord behind every listing and confirm it&apos;s
        real, available, and accurate — before you waste a tour or a deposit.
      </p>

      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <Button size="lg" nativeButton={false} render={<a href="/verify" />}>
          Verify a listing
          <RiArrowRightLine data-icon="inline-end" />
        </Button>

        <Button
          size="lg"
          variant="outline"
          nativeButton={false}
          render={<a href="#how-it-works" />}
        >
          See how it works
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        Real checks. Real calls. Answers within minutes.
      </p>
    </section>
  );
};

export default Hero;
