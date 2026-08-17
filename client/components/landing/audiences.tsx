import { RiCheckLine } from "@remixicon/react";

import { Button } from "@/components/ui/button";
import { AUDIENCES } from "@/lib/constants";

const Audiences = () => {
  return (
    <section id="for-renters" className="w-full flex scroll-mt-28 flex-col space-y-10">
      <div className="grid gap-6 lg:grid-cols-2">
        {AUDIENCES.map(({ id, heading, points, cta, href }) => (
          <div
            key={id}
            className="flex flex-col justify-between gap-8 rounded-md border border-border bg-card p-8 shadow-sm"
          >
            <div>
              <h3 className="font-heading text-2xl font-bold">{heading}</h3>
              <ul className="mt-6 space-y-4">
                {points.map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <RiCheckLine className="size-3" />
                    </span>
                    <span className="text-sm text-pretty text-muted-foreground">
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <Button nativeButton={false} render={<a href={href} />}>{cta}</Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Audiences;