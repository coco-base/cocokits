/** A keyboard row of a component meta. */
export interface MetaKeyboardRow {
  /** The key or key combination, for example `Enter` or `Tab / Shift+Tab`. */
  readonly key: string;
  /** The element or state in which the key applies. */
  readonly context: string;
  /** What the key does. */
  readonly action: string;
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
