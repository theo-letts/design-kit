import { Specimens } from "./Specimens";
import { PageOne } from "./PageOne";
import { PageTwo } from "./PageTwo";
import { PageThree } from "./PageThree";
import { PageFour } from "./PageFour";
import { PageFive } from "./PageFive";

/* One board, scrolled. Judging a theme means seeing a lot of it at once, so
   there is nothing to page between — just labelled sections. */
const BOARDS = [
  // The specimen sheet leads: it is the reference you iterate against, and the
  // demo screens below are where you check the result holds up in context.
  { label: "Specimens", Page: Specimens },
  { label: "Dashboard", Page: PageOne },
  { label: "Billing & settings", Page: PageTwo },
  { label: "More components", Page: PageThree },
  { label: "App chrome", Page: PageFour },
  { label: "Editorial", Page: PageFive },
] as const;

export function Preview() {
  return (
    <>
      {BOARDS.map(({ label, Page }, i) => (
        <section key={label} aria-label={label}>
          {i > 0 && <Divider label={label} />}
          <Page />
        </section>
      ))}
    </>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <div className="mx-auto flex w-full max-w-5xl items-center gap-3 px-6 pt-4 sm:px-8">
      <span className="bg-border h-px flex-1" />
      <span className="text-muted-foreground text-[11px] tracking-wide uppercase">{label}</span>
      <span className="bg-border h-px flex-1" />
    </div>
  );
}
