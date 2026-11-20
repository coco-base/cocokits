/** Props of a part of the search, the footer, the count and the option parts: the class from the anatomy. */
export interface SelectExtraPartProps {
  /** The part's class from the anatomy. */
  readonly class: string;
}

/** Props of the search input, a native `input type="search"` with the combobox role. Absent keys are `undefined`. */
export interface SelectSearchProps extends SelectExtraPartProps {
  /** Always `'search'`. */
  readonly type: 'search';
  /** Always `'combobox'`: DOM focus stays in the input while the list is open. */
  readonly role: 'combobox';
  /** Always `'true'`: the input is shown while the list is open. */
  readonly 'aria-expanded': 'true';
  /** The list id. */
  readonly 'aria-controls': string;
  /** Always `'list'`: typing narrows the options. */
  readonly 'aria-autocomplete': 'list';
  /** The highlighted option's id, while one is highlighted and shown. */
  readonly 'aria-activedescendant'?: string | undefined;
  /** The accessible name of the input. */
  readonly 'aria-label': string;
  /** Always `'off'`: the browser suggests nothing. */
  readonly autocomplete: 'off';
  /** The query. */
  readonly value: string;
  /** Sends `SEARCH.INPUT` with the typed text. */
  readonly onInput: (event: Event) => void;
  /** Moves the highlight, chooses, closes (see the search keymap); a key the input needs is left alone. */
  readonly onKeyDown: (event: KeyboardEvent) => void;
}

/** Props of the empty part, shown while no option matches. A polite status. */
export interface SelectEmptyProps extends SelectExtraPartProps {
  /** Always `'status'`: assistive technology announces the text politely. */
  readonly role: 'status';
}

/** Props of the count part: the text of the other selected values. */
export interface SelectCountProps extends SelectExtraPartProps {
  /** `+N`, the number of selected values after the first one. It is part of the trigger text. */
  readonly text: string;
}

/** Props of the description of one option. */
export interface SelectOptionDescriptionProps extends SelectExtraPartProps {
  /** The id the option's `aria-describedby` points at. */
  readonly id: string;
}

/** Props of a decorative part. */
export interface SelectExtraDecorativeProps extends SelectExtraPartProps {
  /** Always `'true'`. */
  readonly 'aria-hidden': 'true';
}

/** One handled key of the search keymap. */
export interface SelectSearchKeyBinding {
  /** `KeyboardEvent.key` values. */
  readonly keys: readonly string[];
  /** What the key does. */
  readonly intent: 'step' | 'choose' | 'escape' | 'tab';
  /** The `key` text of the matching row of the meta keyboard table (its context is `search input`). */
  readonly row: string;
}
