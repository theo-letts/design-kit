import * as React from "react";
import { KITS, DEFAULT_KIT } from "@/kits";

/* Which kit you are looking at, shared by the specimen sheet and the studies
   page under one key — so picking a kit on one and crossing to the other
   keeps the theme you were in. The URL wins over the stored value, which is
   what makes a particular view linkable. */
const STORE_KEY = "design-kit.viewer.kit";

export function useKit() {
  const [id, setId] = React.useState(() => {
    const fromUrl = new URLSearchParams(location.search).get("kit");
    if (fromUrl && KITS.some((k) => k.id === fromUrl)) return fromUrl;
    try {
      return localStorage.getItem(STORE_KEY) ?? DEFAULT_KIT;
    } catch {
      return DEFAULT_KIT;
    }
  });

  React.useEffect(() => {
    try {
      localStorage.setItem(STORE_KEY, id);
    } catch {
      /* private browsing */
    }
    const url = new URL(location.href);
    url.searchParams.set("kit", id);
    history.replaceState(null, "", url);
  }, [id]);

  return [id, setId] as const;
}
