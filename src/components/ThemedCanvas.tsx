import * as React from "react";
import { isShader } from "@/lib/backdrop";
import type { Config } from "@/lib/config";
import { entranceCss } from "@/lib/entrances";
import { fontUrl, loadFontCss } from "@/lib/fonts";
import { interactCss } from "@/lib/interact";
import { mobileCss } from "@/lib/mobile";
import { caseCss, headingSizeCss } from "@/lib/wording";
import { buttonOutlineCss, outlineCss } from "@/lib/outline";
import { buildTheme, themeVars, toBackdropSvg } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { ShaderBackdrop } from "./ShaderBackdrop";

/* Everything it takes to put a config on screen: the token variables, the font
   faces, the duotone filter, and the rules the export generates. Both products
   render through here, so the remixer and the specimen viewer cannot drift —
   a kit that looks right in one looks right in the other by construction. */

export function ThemedCanvas({
  config,
  className,
  children,
}: {
  config: Config;
  className?: string;
  children: React.ReactNode;
}) {
  const theme = React.useMemo(() => buildTheme(config), [config]);

  // Only the faces in use are fetched, so the library can be 34 deep without
  // every page load paying for it.
  React.useEffect(() => {
    loadFontCss(fontUrl([config.fontSans, config.fontHeading, config.fontMono]), "dk-fonts-active");
  }, [config.fontSans, config.fontHeading, config.fontMono]);

  // `filter: url(#id)` only resolves against a filter in the document, so the
  // duotone defs have to be rendered, not merely exported.
  const duotone = React.useMemo(() => toBackdropSvg(theme, config.mode), [theme, config.mode]);

  /* The same generators the export uses, scoped to the canvas — so what you
     see here and what you paste into a project cannot drift apart. */
  const outline = React.useMemo(
    () => outlineCss(config.outline, `.themed[data-outline="${config.outline}"] `),
    [config.outline],
  );
  const buttonOutline = React.useMemo(
    () =>
      buttonOutlineCss(
        config.buttonOutline,
        `.themed[data-button-outline="${config.buttonOutline}"] `,
      ),
    [config.buttonOutline],
  );
  const behaviour = React.useMemo(
    () =>
      [
        interactCss(config.interact, ".themed "),
        entranceCss(config.entrance, ".themed "),
        caseCss(
          { heading: config.headingCase, label: config.labelCase, body: config.bodyCase },
          ".themed ",
        ),
        headingSizeCss(config.headingSize, ".themed "),
        /* Not config-dependent — the kit's mobile contract applies to every
           theme, so it is emitted once rather than switched by an axis. */
        mobileCss(".themed "),
      ]
        .filter(Boolean)
        .join("\n\n"),
    [
      config.interact,
      config.entrance,
      config.headingCase,
      config.labelCase,
      config.bodyCase,
      config.headingSize,
    ],
  );

  return (
    <>
      {duotone && <div aria-hidden dangerouslySetInnerHTML={{ __html: duotone }} />}
      {outline && <style>{outline}</style>}
      {buttonOutline && <style>{buttonOutline}</style>}
      {behaviour && <style>{behaviour}</style>}
      <div
        data-surface={config.surface}
        data-backdrop={
          config.backdrop === "None"
            ? undefined
            : isShader(config.backdrop)
              ? "shader"
              : config.backdrop
        }
        data-tilt={config.tilt === "None" ? undefined : "on"}
        data-outline={config.outline === "Default" ? undefined : config.outline}
        data-button-outline={config.buttonOutline === "Default" ? undefined : config.buttonOutline}
        className={cn("themed bg-background text-foreground", className)}
        style={themeVars(theme, config.mode)}
      >
        {isShader(config.backdrop) && (
          <ShaderBackdrop
            shader={config.backdrop}
            background={theme.colors[config.mode].background}
            brand={theme.colors[config.mode].primary}
            accent={theme.colors[config.mode].accent}
          />
        )}
        {children}
      </div>
    </>
  );
}
