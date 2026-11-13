import type { ModeCollection } from './mode-collection';
import type { PartIconNames, SvgIconSet } from './svg-icon';

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

/** A theme's options per component. A missing component is unsupported; `{}` has no options. */
export interface ThemeConfig {
  /** The theme name, for example `cocokits`. */
  readonly name: string;
  /** Options per component name, then per option name. */
  readonly components: Readonly<Record<string, Readonly<Record<string, ThemeOption>>>>;
  /**
   * The token collections that have a mode attribute: the theme's `modeCollections` index. The portal
   * host of an overlay copies the page-wide ones (no `componentName`) from the trigger's ancestors.
   * Optional: a theme without it mirrors no modes.
   */
  readonly modeCollections?: readonly ModeCollection[];
  /**
   * The theme's icon set as path data, by kebab-case name (no markup). SvgIcon draws an icon of the provided theme
   * by name. These are no options and render no attribute. Optional: a theme without it has no icons.
   *
   * @example
   * An app adds an icon without losing the theme's:
   * ```ts
   * const appTheme = { ...cocokitsThemeConfig, icons: { ...cocokitsThemeConfig.icons, logo } };
   * ```
   */
  readonly icons?: SvgIconSet;
  /**
   * The icon name each icon-holding part shows, by component name (the anatomy block), then part name. The part
   * draws it through SvgIcon unless the author gave it content. Optional: a theme without it shows no part icons.
   *
   * @example
   * An app changes the icon of the Select arrow:
   * ```ts
   * const appTheme = {
   *   ...cocokitsThemeConfig,
   *   partIconNames: {
   *     ...cocokitsThemeConfig.partIconNames,
   *     select: { ...cocokitsThemeConfig.partIconNames.select, dropdownIcon: 'arrow-down' },
   *   },
   * };
   * ```
   */
  readonly partIconNames?: PartIconNames;
}

interface RejectReserved<T extends ThemeConfig> {
  readonly components: {
    readonly [C in keyof T['components']]: {
      readonly [O in keyof T['components'][C]]: {
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
