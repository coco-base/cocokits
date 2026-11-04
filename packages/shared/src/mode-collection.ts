/** One mode of a collection: its name and the value of the attribute that selects it. */
export interface ModeValue {
  /** The mode name, for example `Light`. */
  readonly name: string;
  /** The attribute value that selects the mode, for example `light`. */
  readonly value: string;
}

/**
 * One token collection of a theme that has a mode attribute, as the theme package exports it in `modeCollections`
 * (its modes index). The theme makes the attribute and the values with the code its selectors use, so a consumer
 * assumes no prefix, attribute naming or collection structure.
 */
export interface ModeCollection {
  /** The collection name, for example `Theme / Color`. */
  readonly name: string;
  /** The attribute name without `data-`, as in `ThemeOption.attrName`, for example `cck-color-mode`. */
  readonly attrName: string;
  /**
   * The component a component collection belongs to, for example `button`; absent for a page-wide collection. Two
   * components may use the same `attrName`, so a collection is identified by both.
   */
  readonly componentName?: string;
  /** The modes, in the order the theme lists them. */
  readonly modes: readonly ModeValue[];
  /** The `name` of the default mode, for example `Light`. */
  readonly defaultMode: string;
}
