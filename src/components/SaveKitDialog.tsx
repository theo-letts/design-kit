import * as React from "react";
import { Button, Dialog, Field, FieldDescription, Input, Label } from "./ui";

/* Names the kit and hands it to the dev server, which writes the file. The
   remixer makes a kit; the viewer reads it; this is the join between them. */

export function SaveKitDialog({
  busy,
  error,
  onSave,
  onClose,
}: {
  busy: boolean;
  error: string | null;
  onSave: (name: string, note: string) => void;
  onClose: () => void;
}) {
  const [name, setName] = React.useState("");
  const [note, setNote] = React.useState("");

  const submit = () => {
    if (!name.trim() || busy) return;
    onSave(name.trim(), note.trim());
  };

  return (
    <Dialog
      title="Save as kit"
      description="Writes a file into src/kits, where the specimen viewer picks it up."
      onClose={onClose}
      className="max-w-md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={busy || !name.trim()}>
            {busy ? "Saving…" : "Save kit"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4 p-5 pt-0">
        <Field>
          <Label htmlFor="kit-name">Name</Label>
          <Input
            id="kit-name"
            value={name}
            autoFocus
            placeholder="Carbon"
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
          <FieldDescription>
            The filename follows: {name.trim() ? slug(name) : "carbon"}.ts
          </FieldDescription>
        </Field>
        <Field>
          <Label htmlFor="kit-note">Note</Label>
          <Input
            id="kit-note"
            value={note}
            placeholder="One line on what it is for."
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
          <FieldDescription>Shown under the picker in the viewer.</FieldDescription>
        </Field>
        {error && <p className="text-destructive text-sm">{error}</p>}
      </div>
    </Dialog>
  );
}

/** Mirrors the server's slug, so the filename shown is the filename written. */
const slug = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 38) || "kit";
