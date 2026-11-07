import type { ThemeConfig } from './theme-config';

/** Option values by option name. `null` removes the option; `undefined` defers to the next level. */
export type ThemeOptionValues = Readonly<Record<string, string | boolean | null | undefined>>;

/** The theme attributes of one part: only `data-*` names, so a record is safe to apply to an element. */
export type ThemeAttrs = Readonly<Record<`data-${string}`, string>>;

/** The theme attributes of every part of an anatomy, by part name. */
export type ThemeAttrsByPart<A extends { readonly parts: object }> = {
  readonly [P in keyof A['parts']]: ThemeAttrs;
};

/**
 * Resolves the theme options of every part of a component to `data-*` attributes. Pure: no input
 * is mutated and a new object is returned. The anatomy is the only source of the part names.
 * Per option the value is: `ownValues`, then `overrideValues`, then the config default.
 * `null` renders nothing; `true` renders `''`; `false` renders nothing.
 *
 * @param themeConfig - The theme's options and defaults.
 * @param anatomy - The component anatomy; its block names the component in `themeConfig` and its
 *   parts are the parts resolved. Only options that list a part in `partNames` (default `root`) apply to it.
 * @param ownValues - The component's own option values (a theme component's inputs).
 * @param overrideValues - Option values from the nearest theme provider.
 * @returns For each part, attribute name (`data-size`) to value. Absent attributes are not in the
 *   record. Every record is `{}` when the component is not in the config.
 */
export function resolveThemeAttrs<A extends { readonly block: string; readonly parts: object }>(
  themeConfig: ThemeConfig,
  anatomy: A,
  ownValues: ThemeOptionValues = {},
  overrideValues: ThemeOptionValues = {},
): ThemeAttrsByPart<A> {
  const options = Object.entries(themeConfig.components[anatomy.block] ?? {});
  return Object.fromEntries(
    Object.keys(anatomy.parts).map((partName) => {
      const attrs: Partial<Record<`data-${string}`, string>> = {};
      for (const [optionName, option] of options) {
        if (!(option.partNames ?? ['root']).includes(partName)) continue;
        let value = ownValues[optionName];
        if (value === undefined) value = overrideValues[optionName];
        if (value === undefined) value = option.default;
        if (value === null || value === false) continue;

        attrs[`data-${option.attrName}`] = value === true ? '' : value;
      }
      return [partName, attrs];
    }),
  ) as ThemeAttrsByPart<A>;
}
