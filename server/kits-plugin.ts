import { existsSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import type { Plugin } from "vite";

import { DEFAULT_CONFIG } from "../src/lib/config.ts";

/* Saving a kit from the remixer means writing a file into the repo, which the
   browser cannot do — so the dev server does it. Dev-only, same as the vision
   endpoint: it never ships, and it only ever writes one known folder. */

const FOLDER = "src/kits";
/** Lowercase letters, digits and dashes. Anything else is not a filename. */
const ID = /^[a-z0-9][a-z0-9-]{0,38}$/;
/** The names the folder uses for its own plumbing. */
const RESERVED = new Set(["index", "types", "build"]);

const slug = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 38);

/** A line of prose, safe to sit inside a double-quoted TS string. */
const oneLine = (s: unknown, max: number) =>
  String(s ?? "")
    .replace(/\s+/g, " ")
    .replace(/[^\x20-\x7e]/g, "")
    .slice(0, max)
    .trim();

async function readJson(req: any): Promise<any> {
  const chunks: Buffer[] = [];
  for await (const c of req) chunks.push(c as Buffer);
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

/** Keep only the keys a Config actually has, so a stray field from an older
 *  browser tab cannot end up written into the repo. */
function clean(config: any): Record<string, unknown> {
  if (!config || typeof config !== "object") throw new Error("Expected a config object.");
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(DEFAULT_CONFIG)) {
    if (key in config) out[key] = config[key];
  }
  /* Every kit file is imported by the glob, so one malformed kit takes down
     both products on the next reload. Check the shape here, where it can still
     be refused, rather than letting it become a file that throws. */
  const colors = out.colors as Record<string, any> | undefined;
  if (!colors || typeof colors !== "object") throw new Error("That config has no colours.");
  for (const slot of ["background", "foreground", "primary", "accent", "destructive"]) {
    const c = colors[slot];
    const ok = c && ["l", "c", "h"].every((k) => typeof c[k] === "number" && Number.isFinite(c[k]));
    if (!ok) throw new Error(`The colour "${slot}" is missing or not an oklch triple.`);
  }
  return out;
}

export function saveKit(): Plugin {
  return {
    name: "design-kit:save-kit",
    configureServer(server) {
      const root = server.config.root;

      server.middlewares.use("/api/save-kit", async (req, res) => {
        const send = (code: number, body: unknown) => {
          res.statusCode = code;
          res.setHeader("content-type", "application/json");
          res.end(JSON.stringify(body));
        };
        if (req.method !== "POST") return send(405, { error: "POST only" });

        try {
          const body = await readJson(req);
          const name = oneLine(body?.name, 40);
          if (!name) return send(400, { error: "bad-name", message: "Give the kit a name." });

          const id = slug(body?.id ? String(body.id) : name);
          if (!ID.test(id) || RESERVED.has(id)) {
            return send(400, {
              error: "bad-name",
              message: `"${name}" does not make a usable filename.`,
            });
          }

          // Resolve and then check: the only defence against traversal that
          // actually holds is comparing the resolved path to the folder.
          const folder = resolve(root, FOLDER);
          const file = resolve(folder, `${id}.ts`);
          if (!file.startsWith(folder + "/")) {
            return send(400, { error: "bad-name", message: "That name escapes the kits folder." });
          }
          const existed = existsSync(file);

          const note = oneLine(body?.note, 160) || "Saved from the remixer.";
          const config = clean(body?.config);

          /* JSON.stringify is what makes this safe: whatever the config holds
             comes back out as a quoted literal, never as code. */
          /* Spread over the default rather than writing a bare literal. A
             saved kit is a full snapshot of Config, so the day an axis is
             added every previously saved kit stops typechecking — and the
             glob means one broken kit takes both products down. Spreading
             costs nothing and makes a saved kit survive the next axis. */
          const source = `import { DEFAULT_CONFIG } from "@/lib/config";

import type { Kit } from "./types";

/* Saved from the remixer on ${new Date().toISOString().slice(0, 10)}.
   Edit freely — this is an ordinary source file. */
export default {
  id: ${JSON.stringify(id)},
  name: ${JSON.stringify(name)},
  note: ${JSON.stringify(note)},
  config: {
    ...DEFAULT_CONFIG,
    ...${JSON.stringify(config, null, 2).replace(/\n/g, "\n    ")},
  },
} satisfies Kit;
`;
          writeFileSync(file, source, "utf8");
          server.config.logger.info(
            `  \x1b[32m➜\x1b[0m  kit ${existed ? "updated" : "saved"}: ${join(FOLDER, `${id}.ts`)}`,
          );
          send(200, { id, name, path: join(FOLDER, `${id}.ts`), replaced: existed });
        } catch (err: any) {
          const message = err?.message ?? String(err);
          server.config.logger.error(`[save-kit] ${message}`);
          // A bad config is the caller's problem, not a server fault.
          const bad = /colour|config/i.test(message);
          send(bad ? 400 : 500, { error: bad ? "bad-config" : "write-failed", message });
        }
      });
    },
  };
}
