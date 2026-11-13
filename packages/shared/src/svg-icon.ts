/** One `<path>` of an icon. Only these three fields reach the rendered element. */
export interface SvgIconPath {
  /** The path data, written to the `d` attribute. Text only; it is never parsed as markup. */
  readonly d: string;
  /** The `fill-rule` attribute. Leave it out to render none. */
  readonly fillRule?: 'nonzero' | 'evenodd';
  /** The `clip-rule` attribute. Leave it out to render none. */
  readonly clipRule?: 'nonzero' | 'evenodd';
}

/** One icon: the `viewBox` of its `<svg>` and one `<path>` per entry of `paths`. */
export interface SvgIconDefinition {
  /** The `viewBox` attribute, for example `0 0 24 24`. */
  readonly viewBox: string;
  /** The paths, drawn in order. */
  readonly paths: readonly SvgIconPath[];
}

/** A set of icons by name; names are kebab-case, for example `chevron-down`. */
export type SvgIconSet = Readonly<Record<string, SvgIconDefinition>>;

/**
 * The icon each icon-holding part of a component shows: component name (the anatomy block), then part name,
 * then an icon name of the theme's `icons`.
 */
export type PartIconNames = Readonly<Record<string, Readonly<Record<string, string>>>>;

/** The icons of a theme as the components read them. */
export interface ThemeIcons {
  /** The theme's icons by name; empty when the theme has none. */
  readonly icons: SvgIconSet;
  /** The icon name per component part; empty when the theme names none. */
  readonly partIconNames: PartIconNames;
}
