/** Inputs of `getChipProps`. */
export interface ChipProps {
  /** The id of the chip: the author's, or an SSR-stable generated one. The content and remove ids derive from it. */
  readonly id: string;
  /** Renders the remove button. A disabled chip renders none. @defaultValue false */
  readonly removable?: boolean | undefined;
  /** The chip is disabled. @defaultValue false */
  readonly disabled?: boolean | undefined;
  /**
   * The model of a selectable chip. A chip is selectable while this is `true` or `false`; `undefined` is a plain
   * chip with no toggle and no check.
   */
  readonly selected?: boolean | undefined;
  /**
   * The accessible name of the remove button. When not set, the name is "Remove" and the chip text, for example
   * "Remove Pizza". An empty string counts as not set.
   */
  readonly removeLabel?: string | undefined;
  /** The word the default remove name starts with. @defaultValue 'Remove' */
  readonly removeText?: string | undefined;
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

/** Props of the content wrapper part: a `span`, or the toggle `button` while the chip is selectable. */
export interface ChipContentWrapperProps {
  /** The `cck-chip__content-wrapper` class. */
  readonly class: string;
  /** `<chip id>-content`: the remove button points to it. */
  readonly id: string;
  /** `'button'` while selectable, so the toggle never submits a form; the part is then a native `button`. */
  readonly type?: 'button' | undefined;
  /** `'true'` while selected, `'false'` while not; present only on a selectable chip. */
  readonly 'aria-pressed'?: 'true' | 'false' | undefined;
  /** Native `disabled` on a disabled selectable chip. */
  readonly disabled?: true | undefined;
  /** Present while the chip is selected. */
  readonly 'data-selected'?: '' | undefined;
}

/** Props of the check part, rendered inside a selectable chip. */
export interface ChipCheckProps {
  /** The `cck-chip__check` class. */
  readonly class: string;
  /** Always `'true'`: the pressed state is `aria-pressed`, and the label never changes. */
  readonly 'aria-hidden': 'true';
  /** `'checked'` while the chip is selected. */
  readonly 'data-state'?: 'checked' | undefined;
}

/** Props of the remove button part. */
export interface ChipRemoveProps {
  /** The `cck-chip__remove` class. */
  readonly class: string;
  /** `<chip id>-remove`: the default name points to it. */
  readonly id: string;
  /** Always `'button'`: the remove button never submits a form. */
  readonly type: 'button';
  /** The author's name, else the word "Remove": the first part of the default name. */
  readonly 'aria-label': string;
  /** `<remove id> <content id>` ("Remove Pizza"); absent when the author gave `removeLabel`. */
  readonly 'aria-labelledby'?: string | undefined;
}

/** What `getChipProps` returns. */
export interface ChipParts {
  /** The root props. */
  readonly root: ChipRootProps;
  /** The content wrapper props. */
  readonly contentWrapper: ChipContentWrapperProps;
  /** The check props; `null` while the chip is not selectable. */
  readonly check: ChipCheckProps | null;
  /** The remove button props; `null` while the chip is not removable or is disabled. */
  readonly remove: ChipRemoveProps | null;
}
