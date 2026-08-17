import { RiAddLine } from "@remixicon/react";

import { FAQS } from "@/lib/constants";

const Faq = () => {
  return (
    <section id="faq" className="w-full flex flex-col space-y-10">
      <div className="flex flex-col items-center space-y-2 text-center">
        <h2 className="font-heading text-3xl font-bold text-balance md:text-4xl">
          Frequently asked questions
        </h2>
      </div>

      <div className="mx-auto w-full max-w-3xl space-y-4">
        {FAQS.map(({ q, a }) => (
          <details
            key={q}
            className="group rounded-md border border-border bg-card px-6 shadow-sm open:pb-6"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-medium marker:hidden [&::-webkit-details-marker]:hidden">
              {q}
              <RiAddLine className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-45" />
            </summary>
            <p className="text-sm text-pretty text-muted-foreground">{a}</p>
          </details>
        ))}
      </div>
    </section>
  );
};

export default Faq;