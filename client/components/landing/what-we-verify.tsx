import { CHECKS } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const WhatWeVerify = () => {
  return (
    <section id="what-we-verify" className="w-full flex flex-col space-y-10">
      <div className="flex flex-col items-center space-y-2 text-center">
        <h2 className="font-heading text-3xl font-bold text-balance md:text-4xl">
          What we verify
        </h2>

        <p className="text-pretty text-muted-foreground">
          Six checks behind every listing — so one report tells you everything.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {CHECKS.map(({ icon: Icon, title, body }) => (
          <Card key={title} className="py-7 shadow-sm rounded-md">
            <CardHeader className="flex items-center space-x-3">
              <span className="mb-2 flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="size-5" />
              </span>

              <CardTitle>{title}</CardTitle>
            </CardHeader>

            <CardContent>
              <p className="text-sm text-pretty text-muted-foreground">
                {body}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default WhatWeVerify;
