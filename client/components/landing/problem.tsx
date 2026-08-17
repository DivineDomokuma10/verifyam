const Problem = () => {
  return (
    <section id="why" className="w-full flex flex-col space-y-10">
      <div className="flex flex-col items-center space-y-2 text-center">
        <h2 className="font-heading text-3xl font-bold text-balance md:text-4xl">
          The listing is real.{" "}
          <span className="text-destructive">Until it isn&apos;t.</span>
        </h2>

        <p className="max-w-2xl text-pretty text-muted-foreground">
          Photos can be stolen, apartments can be rented already, and
          &quot;available&quot; often means &quot;I forgot to take it
          down.&quot; Renters lose weekends and deposits. Landlords lose
          credibility to a market full of fakes. VERIFY puts a real
          conversation behind every claim — before you commit anything.
        </p>
      </div>
    </section>
  );
};

export default Problem;