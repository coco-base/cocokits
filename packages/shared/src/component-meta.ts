/** A keyboard row of a component meta. */
export interface MetaKeyboardRow {
  /** The key or key combination, for example `Enter` or `Tab / Shift+Tab`. */
  readonly key: string;
  /** The element or state in which the key applies. */
  readonly context: string;
  /** What the key does. */
  readonly action: string;
  /**
   * The frameworks the row applies to. Leave it out when the row applies to every framework; a list is never empty.
   * List the frameworks that have the row; the docs of a framework not in the list do not show it.
   */
  readonly frameworks?: readonly ('angular' | 'react' | 'vue')[];
}

/** The values of a `data-*` attribute and when it is set. */
export interface DataAttrDetail {
  /** The values the attribute takes. Leave it out for a presence-only attribute, which is set to `""` or not at all. */
  readonly values?: readonly string[];
  /** One sentence: when the attribute is on the element. For an enumerated attribute, also what each value means. */
  readonly setWhen: string;
}

/**
 * What code cannot express about a component: data attributes per part, keyboard table,
 * expected roles and form contract. Data for tests and docs, never read at runtime.
 */
export interface ComponentMeta<Part extends string = string> {
  /** Link to the WAI-ARIA Authoring Practices pattern; leave it out when no pattern applies (a Badge is static text). */
  readonly apg?: string;
  /** Every base `data-*` name each part emits (theme options excluded). */
  readonly dataAttrs: Readonly<Record<Part, readonly string[]>>;
  /** The values of each base `data-*` attribute and when it is set, by attribute name. Leave it out when no part emits one. */
  readonly dataAttrDetails?: Readonly<Record<string, DataAttrDetail>>;
  /** Expected role per part; `null` when the native element's role is used. */
  readonly roles: Readonly<Partial<Record<Part, string | null>>>;
  /** Keys the component handles or relies on. */
  readonly keyboard: readonly MetaKeyboardRow[];
  /** The form contract in one sentence. */
  readonly form: string;
  /**
   * The default element of each part, for docs and tests. Set it where the author may choose
   * another element; leave it out for a part that has no element of its own.
   */
  readonly defaultElements?: Readonly<Partial<Record<Part, string>>>;
}
