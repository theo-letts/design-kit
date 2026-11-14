import { describe, expect, it } from "vitest";

import { ensureContrast, mix, over, ratio, readableOn } from "../color";

const WHITE = { l: 1, c: 0, h: 0 };
const BLACK = { l: 0, c: 0, h: 0 };
const BLUE = { l: 0.55, c: 0.2, h: 262 };

describe("mix", () => {
  it("takes the short way round the hue wheel", () => {
    // 350 → 10 is 20° forward, not 340° back.
    expect(mix({ l: 0.5, c: 0.1, h: 350 }, { l: 0.5, c: 0.1, h: 10 }, 0.5).h).toBeCloseTo(0, 5);
  });

  it("drags a chromatic hue toward zero when the other end is neutral", () => {
    /* Not a bug to fix — a trap to remember. A neutral colour still has
       h: 0, so mixing a blue brand with a grey page lands in violet. The
       Offset ink carries the hue across instead of interpolating it. */
    expect(mix(WHITE, BLUE, 0.68).h).toBeGreaterThan(280);
  });
});

describe("ensureContrast", () => {
  it("leaves a colour that already clears the bar alone", () => {
    const already = { l: 0.2, c: 0, h: 0 };
    expect(ensureContrast(already, WHITE, 4.5)).toBe(already);
  });

  it("moves only lightness, never hue or chroma", () => {
    const fixed = ensureContrast({ l: 0.75, c: 0.2, h: 262 }, WHITE, 4.5);
    expect(fixed.h).toBe(262);
    expect(fixed.c).toBe(0.2);
    expect(fixed.l).not.toBe(0.75);
  });

  it("clears the bar with room for the rounding that CSS will do", () => {
    const fixed = ensureContrast({ l: 0.7, c: 0.1, h: 30 }, WHITE, 3);
    expect(ratio(fixed, WHITE)).toBeGreaterThan(3);
  });

  it("returns the closest it can rather than pretending, when the target is impossible", () => {
    // Nothing is 21:1 against mid grey; the best available is still returned.
    const grey = { l: 0.5, c: 0, h: 0 };
    const best = ensureContrast(grey, grey, 21);
    expect(ratio(best, grey)).toBeGreaterThan(1);
  });
});

describe("readableOn", () => {
  it("clears AA on every hue around the wheel", () => {
    for (let h = 0; h < 360; h += 15) {
      for (const l of [0.45, 0.55, 0.65, 0.75]) {
        const bg = { l, c: 0.18, h };
        expect(ratio(bg, readableOn(bg))).toBeGreaterThanOrEqual(4.5);
      }
    }
  });
});

describe("over", () => {
  it("composites a translucent colour onto what is behind it", () => {
    expect(over(BLACK, 0.5, WHITE).l).toBeCloseTo(0.5, 5);
  });

  it("is a no-op at full alpha", () => {
    expect(over(BLUE, 1, WHITE)).toMatchObject({ l: BLUE.l, c: BLUE.c });
  });
});
