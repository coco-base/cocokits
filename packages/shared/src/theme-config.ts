import type { ModeCollection } from './mode-collection';

/** Base `data-*` names a theme option cannot reuse. */
export type ReservedDataName =
  | 'disabled'
  | 'selected'
  | 'checked'
  | 'indeterminate'
  | 'open'
  | 'invalid'
  | 'readonly'
  | 'required'
  | 'highlighted'
  | 'orientation'
  | 'state'
  | 'value'
  | 'touched'
  | 'dirty'
  | 'pending'
  | 'submitted'
  | 'focused'
  | 'filled';

/** One visual option of a component. It renders as `data-<attrName>`. */
export interface ThemeOption {
  /** Attribute name without `data-`. Must not be a reserved base name. */
  readonly attrName: string;
  /** The allowed values. */
  readonly values: readonly (string | boolean)[];
  /** One of `values`, or `null` to render nothing unless the option is given. */
  readonly default: string | boolean | null;
  /** Names of the anatomy parts that render the attribute; `['root']` when omitted. */
  readonly partNames?: readonly string[];
  /** One sentence for the docs. */
  readonly description?: string;
}

/** The icon name each icon-holding part of a component shows, by part name. Names are plain strings. */
export type ThemePartIcons = Readonly<Record<string, string>>;

/**
 * One component of a theme: its options by option name, and the icons of its parts. `icons` is no option: it
 * renders no attribute, and no option may be named `icons`.
 *
 * @example
 * The Select names the icons of its arrow and its selected option:
 * ```ts
 * const select = { icons: { dropdownIcon: 'chevron-down', optionIndicator: 'check' } };
 * ```
 */
export interface ThemeComponentConfig {
  /** The icon each part shows, by part name. The part draws it unless the author gave it content. */
  readonly icons?: ThemePartIcons;
  readonly [optionName: string]: ThemeOption | ThemePartIcons | undefined;
}

/** A theme's options per component. A missing component is unsupported; `{}` has no options. */
export interface ThemeConfig {
  /** The theme name, for example `cocokits`. */
  readonly name: string;
  /** Options per component name, then per option name. */
  readonly components: Readonly<Record<string, ThemeComponentConfig>>;
  /**
   * The token collections that have a mode attribute: the theme's `modeCollections` index. The portal
   * host of an overlay copies the page-wide ones (no `componentName`) from the trigger's ancestors.
   * Optional: a theme without it mirrors no modes.
   */
  readonly modeCollections?: readonly ModeCollection[];
}

interface RejectReserved<T extends ThemeConfig> {
  readonly components: {
    readonly [C in keyof T['components']]: {
      readonly [O in Exclude<keyof T['components'][C], 'icons'>]: {
        readonly attrName: T['components'][C][O] extends { attrName: infer A }
          ? A extends ReservedDataName
            ? never
            : unknown
          : unknown;
      };
    };
  };
}

/**
 * Declares a theme's options. Literal types are kept, and a reserved base name in `attrName`
 * is a type error.
 */
export function defineThemeConfig<const T extends ThemeConfig>(themeConfig: T & RejectReserved<T>): T {
  return themeConfig;
}
