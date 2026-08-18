import { RiArrowRightLine, RiCheckDoubleFill } from "@remixicon/react";

import { Button } from "@/components/ui/button";

const FinalCta = () => {
  return (
    <section id="verify" className="flex w-full max-w-5xl scroll-mt-28 flex-col px-4">
      <div className="flex flex-col items-center gap-6 rounded-md bg-primary px-6 py-16 text-center text-primary-foreground shadow-lg md:py-20">
        <span className="flex size-12 items-center justify-center rounded-full bg-primary-foreground/15">
          <RiCheckDoubleFill className="size-6" />
        </span>

        <h2 className="font-heading max-w-xl text-3xl font-bold text-balance md:text-5xl">
          Don&apos;t just find it. Verify it.
        </h2>

        <p className="max-w-lg text-pretty text-primary-foreground/85">
          One paste. One check. One clear answer — real, available, and
          accurate, or not.
        </p>

        <Button
          size="lg"
          variant="secondary"
          nativeButton={false}
          render={<a href="/verify" />}
          className="whitespace-normal"
        >
          Verify your first listing free
          <RiArrowRightLine data-icon="inline-end" />
        </Button>
      </div>
    </section>
  );
};

export default FinalCta;