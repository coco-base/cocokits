/** Inputs of `getChipProps`. */
export interface ChipProps {
  /** The id of the chip: the author's, or an SSR-stable generated one. The content id derives from it. */
  readonly id: string;
  /** Renders the remove button. @defaultValue false */
  readonly removable?: boolean | undefined;
  /** The chip is disabled. @defaultValue false */
  readonly disabled?: boolean | undefined;
}

/** Props of the root part. */
export interface ChipRootProps {
  /** The `cck-chip` block class. */
  readonly class: string;
  /** The chip id. */
  readonly id: string;
  /** Present while the chip is disabled. */
  readonly 'data-disabled'?: '' | undefined;
}

/** Props of the content wrapper part. */
export interface ChipContentWrapperProps {
  /** The `cck-chip__content-wrapper` class. */
  readonly class: string;
  /** `<chip id>-content`: the remove button points to it. */
  readonly id: string;
}

/** Props of the remove button part. */
export interface ChipRemoveProps {
  /** The `cck-chip__remove` class. */
  readonly class: string;
  /** Always `'button'`: the remove button never submits a form. */
  readonly type: 'button';
  /** The id of the content wrapper: the button name is the chip text. */
  readonly 'aria-labelledby': string;
  /** Native `disabled` while the chip is disabled. */
  readonly disabled?: true | undefined;
  /** Present while the button is disabled. */
  readonly 'data-disabled'?: '' | undefined;
}

/** What `getChipProps` returns. */
export interface ChipParts {
  /** The root props. */
  readonly root: ChipRootProps;
  /** The content wrapper props. */
  readonly contentWrapper: ChipContentWrapperProps;
  /** The remove button props; `null` while the chip is not removable. */
  readonly remove: ChipRemoveProps | null;
}
