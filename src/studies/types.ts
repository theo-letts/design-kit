import type * as React from "react";

/** One study: a small, self-contained piece built out of the kit's own tokens.
 *
 *  A study is not a component in `ui.tsx`. Those are the shadcn contract and
 *  have to stay recognisable. A study is the opposite — somewhere to try a
 *  thing, keep it if it works, and lift it into a project later. The page
 *  shows each one running and hands you its source, so "lift it later" means
 *  copying the file rather than rebuilding from a screenshot. */
export type Study = {
  id: string;
  name: string;
  /** One line on what it is and what it is for. */
  note: string;
  Component: React.ComponentType;
  /** Lower sorts first; studies without one fall back to their name. */
  order?: number;
};

/** A study plus the slice of its own file that is worth copying. */
export type StudyEntry = Study & { source: string };
