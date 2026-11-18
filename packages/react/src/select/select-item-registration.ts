/** What an item tells the Root about itself. */
export interface SelectItemRegistration<T> {
  /** The registration key, never derived from the value. */
  readonly key: string;
  /** The item element. */
  readonly element: HTMLElement;
  /** The item's latest value, read live. */
  readonly value: T;
  /** Whether the item, or its group, is disabled. */
  readonly disabled: boolean;
  /** The item's own `id`. */
  readonly id: string | undefined;
  /** Whether a description part is mounted in the item; read live. */
  readonly hasDescription: boolean;
  /** The key of the group the item is in, `undefined` outside a group. */
  readonly groupKey: string | undefined;
  /** The text type-to-search matches: the `textValue`, else the text of the `Select.ItemText`; read live. */
  readonly text: string | undefined;
}
