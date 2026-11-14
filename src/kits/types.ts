import type { Config } from "@/lib/config";

/** One saved design system. Each kit is its own file in this folder; the index
 *  globs them, so adding one means writing a file and nothing else. */
export type Kit = {
  id: string;
  name: string;
  /** One line on what the kit is for, shown under the picker. */
  note: string;
  config: Config;
  /** Lower sorts first; kits without one fall back to their name. */
  order?: number;
};
