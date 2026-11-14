import { hexToOklch } from "@/lib/color";
import { applyPalette, paletteById, type PaletteId } from "@/lib/palettes";
import { applyBase, applyThemeColor, DEFAULT_CONFIG, type Config } from "@/lib/config";
import type { BaseName, ThemeName } from "@/lib/scales";

/** Build a config the way the sidebar would: a neutral ramp, a brand hue, then
 *  whatever the kit overrides. */
export function make(base: BaseName, theme: ThemeName, over: Partial<Config> = {}): Config {
  return { ...applyThemeColor(applyBase(DEFAULT_CONFIG, base), theme), ...over };
}

/** For a kit read off a real page, where the colours are the point. */
export function withColors(config: Config, hex: Record<keyof Config["colors"], string>): Config {
  return {
    ...config,
    colors: {
      background: hexToOklch(hex.background),
      foreground: hexToOklch(hex.foreground),
      primary: hexToOklch(hex.primary),
      accent: hexToOklch(hex.accent),
      destructive: hexToOklch(hex.destructive),
    },
  };
}

/** A kit built on one of the collected palettes. The palette fills only the
 *  slots it can — see src/lib/palettes.ts — so the rest of the config still
 *  decides the page where a palette has no neutral of its own. */
export function withPalette(config: Config, id: PaletteId): Config {
  return applyPalette(config, paletteById(id));
}
