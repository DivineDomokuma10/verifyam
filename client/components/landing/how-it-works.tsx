import { STEPS } from "@/lib/constants";

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="w-full flex flex-col space-y-10">
      <div className="flex flex-col items-center space-y-2 text-center">
        <h2 className="font-heading text-3xl font-bold text-balance md:text-4xl">
          How it works
        </h2>

        <p className="max-w-xl text-pretty text-muted-foreground">
          Three steps between a suspicious listing and a confident answer.
        </p>
      </div>

      <ol className="grid gap-6 md:grid-cols-3">
        {STEPS.map(({ icon: Icon, title, body }, index) => (
          <li
            key={title}
            className="flex flex-col items-start gap-4 rounded-md border border-border bg-card p-6 shadow-sm"
          >
            <div className="flex w-full items-center justify-between">
              <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="size-5" />
              </span>
              <span className="font-mono text-sm text-muted-foreground">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>
            <h3 className="font-heading text-lg font-semibold">{title}</h3>
            <p className="text-sm text-pretty text-muted-foreground">{body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
};

export default HowItWorks;