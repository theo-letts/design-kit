import * as React from "react";

/* Line-drawn icons in the "Loose line" idiom from Bleep Bloop: no fills, round
   caps and joins, one solid shape at most, and a turbulence wobble so the stroke
   reads as drawn rather than plotted.
   The wobble is a filter, not baked geometry, so the same paths stay crisp when
   it is switched off — and every icon takes its colour from `currentColor`, so
   they retint with the theme like the lucide set beside them. */

export const WOBBLE_ID = "dk-wobble";

/** One shared filter for the whole set. Rendered once; icons point at it by id,
 *  and an icon whose filter is missing simply draws clean. */
export function IconDefs() {
  return (
    <svg width="0" height="0" aria-hidden className="absolute">
      <defs>
        {/* Both numbers are in user units, so they scale with the viewBox. The
            house settings are 0.035 and 1.1 over a 170pt art space; this set is
            drawn in 24, so the frequency multiplies by 170/24 and the
            displacement divides by it — otherwise the noise period is wider than
            the whole icon and the filter just nudges it sideways. */}
        <filter id={WOBBLE_ID} x="-14%" y="-14%" width="128%" height="128%">
          <feTurbulence type="fractalNoise" baseFrequency="0.25" numOctaves="2" seed="7" />
          <feDisplacementMap in="SourceGraphic" scale="0.8" />
        </filter>
      </defs>
    </svg>
  );
}

/** Paths are drawn in a 24 box with a deliberately loose hand — slight
 *  asymmetry is the point, and the wobble supplies the rest. */
export const ICONS = {
  search: "M16.7,10.4 a6.3,6.3 0 1 1 -12.6,0 a6.3,6.3 0 1 1 12.6,0 M15.1,15.2 L20.4,20.6",
  plus: "M12,4.4 L12,19.6 M4.4,12 L19.6,12",
  minus: "M4.4,12.1 L19.6,11.9",
  check: "M4.6,12.6 L9.6,18.1 L19.5,6.1",
  close: "M5.6,5.4 L18.4,18.6 M18.6,5.6 L5.4,18.4",
  chevron: "M9.2,4.6 L16.2,12 L9,19.4",
  arrow: "M3.9,12.1 L19.6,11.9 M13.1,5.4 L19.6,12 L12.9,18.6",
  user: "M15.8,8.4 a3.8,3.8 0 1 1 -7.6,0 a3.8,3.8 0 1 1 7.6,0 M4.7,19.9 C5.4,15.5 8.4,13.5 12,13.5 C15.7,13.5 18.7,15.6 19.3,20",
  bell: "M7,10.6 C7,6.9 9.2,4.5 12,4.5 C14.9,4.5 17,7 17,10.5 C17,14 17.9,15.6 19.1,17.1 L4.9,16.9 C6.2,15.5 7,14.1 7,10.6 Z M10,19.5 q2,1.7 4.1,-0.1",
  settings:
    "M4.4,7.6 L19.6,7.4 M4.4,16.4 L19.6,16.6 M11.8,7.5 a2.3,2.3 0 1 1 -4.6,0 a2.3,2.3 0 1 1 4.6,0 M16.9,16.5 a2.3,2.3 0 1 1 -4.6,0 a2.3,2.3 0 1 1 4.6,0",
  calendar:
    "M4.6,6.5 L19.4,6.4 L19.5,19.5 L4.5,19.4 Z M4.6,10.5 L19.4,10.4 M8.6,4.3 L8.5,7.7 M15.4,4.3 L15.5,7.7",
  clock: "M19.6,12 a7.6,7.6 0 1 1 -15.2,0 a7.6,7.6 0 1 1 15.2,0 M12,7.1 L12.1,12.3 L15.7,14.5",
  file: "M6.4,3.7 L13.5,3.6 L17.9,8.2 L18,20.4 L6.3,20.3 Z M13.4,3.8 L13.5,8.2 L17.9,8.1",
  folder: "M3.8,6.6 L9.4,6.5 L11.3,9 L20.2,8.9 L20.1,19.4 L3.9,19.5 Z",
  image:
    "M4.4,5.6 L19.6,5.5 L19.5,18.4 L4.5,18.5 Z M4.8,15.5 L9.4,10.8 L13.4,14.8 L16,12.4 L19.5,15.9 M10.7,9.4 a1.7,1.7 0 1 1 -3.4,0 a1.7,1.7 0 1 1 3.4,0",
  trash:
    "M5.2,6.8 L18.8,6.7 M9.4,6.6 L9.5,4.6 L14.6,4.5 L14.5,6.6 M6.8,6.9 L7.9,19.5 L16.2,19.4 L17.2,6.9",
  edit: "M4.6,19.4 L5.7,15.3 L15.8,5.2 L18.9,8.2 L8.7,18.4 Z M14.2,6.8 L17.3,9.8",
  download: "M12,4.1 L12.1,15.2 M7.4,10.6 L12,15.3 L16.6,10.5 M4.8,19.4 L19.2,19.3",
  upload: "M12,19.4 L12.1,8.3 M7.4,12.9 L12,8.2 L16.6,13 M4.8,4.7 L19.2,4.6",
  link: "M9.6,14.5 L14.5,9.5 M13.4,6.6 L15.3,4.7 a3.9,3.9 0 0 1 5.5,5.6 L18.9,12.1 M10.6,17.4 L8.7,19.3 a3.9,3.9 0 0 1 -5.5,-5.6 L5.1,11.9",
  heart:
    "M12,19.4 C6.4,15.6 3.6,12.6 3.6,9.4 C3.6,6.7 5.6,4.9 8,4.9 C9.9,4.9 11.2,6 12,7.4 C12.8,6 14.1,4.9 16,4.9 C18.5,4.9 20.4,6.8 20.4,9.4 C20.4,12.6 17.6,15.6 12,19.4 Z",
  star: "M12,3.8 L14.6,9.4 L20.6,10.2 L16.2,14.4 L17.3,20.3 L12,17.4 L6.7,20.4 L7.8,14.4 L3.4,10.3 L9.4,9.4 Z",
  eye: "M2.9,12 C5.4,7.8 8.6,5.8 12,5.8 C15.4,5.8 18.6,7.9 21.1,12 C18.6,16.2 15.4,18.2 12,18.2 C8.6,18.2 5.4,16.1 2.9,12 Z M15.1,12 a3.1,3.1 0 1 1 -6.2,0 a3.1,3.1 0 1 1 6.2,0",
  lock: "M6.6,10.6 L17.4,10.5 L17.5,19.5 L6.5,19.4 Z M8.8,10.4 L8.8,8 a3.2,3.2 0 0 1 6.4,0 L15.2,10.5",
  mail: "M3.8,6 L20.2,5.9 L20.1,18 L3.9,18.1 Z M3.9,6.4 L12,13.1 L20.1,6.3",
  home: "M3.8,11.3 L12,4.2 L20.2,11.2 M6,10.1 L6.1,19.6 L17.9,19.5 L18,10",
  grid: "M4.4,4.5 L10.4,4.4 L10.5,10.4 L4.5,10.5 Z M13.6,4.4 L19.6,4.5 L19.5,10.5 L13.5,10.4 Z M4.4,13.6 L10.4,13.5 L10.5,19.5 L4.5,19.6 Z M13.6,13.5 L19.6,13.6 L19.5,19.6 L13.5,19.5 Z",
  filter: "M3.8,5.6 L20.2,5.5 L13.7,13 L13.8,19.3 L10.2,17.3 L10.1,13 Z",
  refresh: "M19.9,12.2 a7.9,7.9 0 1 1 -2.4,-5.8 L20.4,8.8 M20.4,4.6 L20.5,8.8 L16.2,8.9",
  play: "M8.4,5.2 L18.3,12 L8.5,18.8 Z",
  info: "M19.8,12 a7.8,7.8 0 1 1 -15.6,0 a7.8,7.8 0 1 1 15.6,0 M12,11 L12.1,16.5",
  warning: "M12,4.2 L21,19.4 L3,19.5 Z M12,9.6 L12.1,14.1",
  help: "M19.8,12 a7.8,7.8 0 1 1 -15.6,0 a7.8,7.8 0 1 1 15.6,0 M9.4,9.7 a2.7,2.7 0 1 1 3.5,3.3 q-0.9,0.4 -0.9,1.7",

  /* --- the chrome the components themselves need --- */
  circle: "M16.4,12 a4.4,4.4 0 1 1 -8.8,0 a4.4,4.4 0 1 1 8.8,0",
  grip: "",
  loader: "M19.8,12 a7.8,7.8 0 1 1 -3.9,-6.8",
  inbox:
    "M3.8,12.6 L6.7,5.2 L17.3,5.1 L20.2,12.6 L20.1,18.9 L3.9,18.8 Z M3.8,12.6 L8.6,12.5 Q9.5,15.1 12,15 Q14.6,15.1 15.4,12.5 L20.2,12.6",
  paperclip:
    "M17.9,11.2 L10.6,18.5 a3.6,3.6 0 0 1 -5.1,-5.1 L13.4,5.4 a2.5,2.5 0 0 1 3.5,3.5 L9.2,16.4 a1.2,1.2 0 0 1 -1.7,-1.7 L14.3,7.6",
  archive:
    "M3.8,4.6 L20.2,4.5 L20.1,8.6 L3.9,8.7 Z M5.3,8.7 L5.4,19.4 L18.6,19.5 L18.7,8.6 M9.6,12.5 L14.4,12.4",
  "arrow-up-right": "M7.1,16.9 L16.9,7.1 M8.8,7.1 L16.9,7.1 L17,15.2",
  chart: "M4.4,19.6 L19.6,19.5 M7.6,19.4 L7.5,11.6 M12,19.5 L12.1,6.4 M16.5,19.4 L16.4,14.4",
  bold: "M7.4,4.6 L13,4.5 a3.8,3.8 0 0 1 0,7.6 L7.5,12.1 Z M7.5,12.1 L13.8,12 a3.9,3.9 0 0 1 0,7.8 L7.4,19.9 Z",
  italic: "M10.2,4.6 L18.4,4.5 M5.6,19.5 L13.8,19.4 M14.4,4.7 L9.6,19.4",
  underline: "M6.6,4.5 L6.7,11.4 a5.3,5.3 0 0 0 10.6,0 L17.4,4.6 M5.4,20.2 L18.6,20.1",
  boxes:
    "M3.6,13.6 L8.4,13.5 L8.5,19.5 L3.7,19.6 Z M15.6,13.5 L20.4,13.6 L20.3,19.6 L15.5,19.5 Z M9.6,4.6 L14.4,4.5 L14.5,10.5 L9.7,10.6 Z",
  card: "M3.6,6.4 L20.4,6.3 L20.3,17.7 L3.7,17.8 Z M3.6,10.2 L20.4,10.1 M7,14.5 L10.6,14.4",
  sparkles:
    "M10.6,3.8 L12.2,8.5 L16.9,10.1 L12.2,11.7 L10.6,16.4 L9,11.7 L4.3,10.1 L9,8.5 Z M17.4,15.2 L18.2,17.5 L20.5,18.3 L18.2,19.1 L17.4,21.4 L16.6,19.1 L14.3,18.3 L16.6,17.5 Z",
  users:
    "M13.6,8.4 a3.3,3.3 0 1 1 -6.6,0 a3.3,3.3 0 1 1 6.6,0 M3.7,19.5 C4.3,15.9 7,14.1 10.3,14.1 C13.6,14.1 16.3,16 16.9,19.5 M16.2,5.6 a3.1,3.1 0 0 1 0,5.8 M18.4,13.9 C20,14.6 21,16.3 21.2,19.5",
  wrench:
    "M18.9,4.1 a5.1,5.1 0 0 0 -6.9,6.9 L4.4,18.6 a2.4,2.4 0 0 0 3.4,3.4 L15.4,14.4 a5.1,5.1 0 0 0 6.2,-6.6 L18,11.4 L14.6,8 Z",
  zap: "M12.8,2.8 L4.6,13.6 L11.2,13.5 L10.4,21.2 L19.4,10.4 L12.6,10.5 Z",
} as const;

export type IconName = keyof typeof ICONS;
export const ICON_NAMES = Object.keys(ICONS) as IconName[];

/** Icons with a dot — the one solid shape the style allows. */
const DOTS: Partial<Record<IconName, [number, number][]>> = {
  info: [[12, 8.1]],
  warning: [[12, 16.9]],
  help: [[12, 17.4]],
  grip: [
    [9, 6.4],
    [15, 6.4],
    [9, 12],
    [15, 12],
    [9, 17.6],
    [15, 17.6],
  ],
};

/** Dots are the solid shape the style allows, so they vary in size by icon. */
const DOT_R: Partial<Record<IconName, number>> = { grip: 1.35 };

export function Icon({
  name,
  size = 24,
  weight,
  wobble = true,
  className,
  ...props
}: {
  name: IconName;
  size?: number;
  /** Stroke width in the 24 box. Defaults to the token the theme sets. */
  weight?: number;
  wobble?: boolean;
  className?: string;
} & Omit<React.ComponentProps<"svg">, "name">) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={weight ?? "var(--icon-stroke, 1.75)"}
      strokeLinecap="round"
      strokeLinejoin="round"
      data-slot="icon"
      className={className}
      aria-hidden
      {...props}
    >
      <g filter={wobble ? `url(#${WOBBLE_ID})` : undefined}>
        {ICONS[name] && <path d={ICONS[name]} />}
        {DOTS[name]?.map(([cx, cy]) => (
          <circle
            key={`${cx}-${cy}`}
            cx={cx}
            cy={cy}
            r={DOT_R[name] ?? 0.95}
            fill="currentColor"
            stroke="none"
          />
        ))}
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------- drop-ins */

/* Named wrappers shaped like the lucide components they replace, so swapping a
   file over is an import change rather than a rewrite — every call site keeps
   its own `className="size-4"` and the sizing behaves as before.
   The chevrons are the one glyph drawn once and turned, which is also why they
   stay consistent with each other however the drawing is tweaked. */
type Named = Omit<React.ComponentProps<"svg">, "name"> & { className?: string };

function named(name: IconName, rotate = 0) {
  return function NamedIcon({ style, ...props }: Named) {
    return (
      <Icon
        name={name}
        style={rotate ? { transform: `rotate(${rotate}deg)`, ...style } : style}
        {...props}
      />
    );
  };
}

export const Check = named("check");
export const X = named("close");
export const Minus = named("minus");
export const Circle = named("circle");
export const GripVertical = named("grip");
export const Inbox = named("inbox");
export const LoaderCircle = named("loader");
export const Paperclip = named("paperclip");

export const ChevronRight = named("chevron");
export const ChevronDown = named("chevron", 90);
export const ChevronLeft = named("chevron", 180);
export const ChevronUp = named("chevron", 270);

export const Archive = named("archive");
export const ArrowUpRight = named("arrow-up-right");
export const BarChart3 = named("chart");
export const Bell = named("bell");
export const Bold = named("bold");
export const Boxes = named("boxes");
export const Calendar = named("calendar");
export const CreditCard = named("card");
export const FileText = named("file");
export const Folder = named("folder");
export const Home = named("home");
export const Image = named("image");
export const Info = named("info");
export const Italic = named("italic");
export const Lock = named("lock");
export const Mail = named("mail");
export const Search = named("search");
export const Settings2 = named("settings");
export const Sparkles = named("sparkles");
export const Star = named("star");
export const Trash2 = named("trash");
export const TriangleAlert = named("warning");
export const Underline = named("underline");
export const Upload = named("upload");
export const Users = named("users");
export const Wrench = named("wrench");
export const Zap = named("zap");
