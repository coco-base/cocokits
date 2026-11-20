/** Props of a part that has only a class: the item leading, trailing, shortcut and the group label's wrapper. */
export interface MenuExtraPartProps {
  /** The part's class from the anatomy. */
  readonly class: string;
}

/** Props of a decorative part: the item leading, trailing and the indicator. */
export interface MenuDecorativeProps extends MenuExtraPartProps {
  /** Always `'true'`: the text of the item names it, an icon-only item is named by its `aria-label`. */
  readonly 'aria-hidden': 'true';
}

/** Props of the indicator of a checkbox or radio item. */
export interface MenuItemIndicatorProps extends MenuDecorativeProps {
  /** `checked` or `unchecked`, as the item it sits in. */
  readonly 'data-state': 'checked' | 'unchecked';
}

/** Props of the supporting text of an item: the item's `aria-describedby` points at it. */
export interface MenuSupportingTextProps extends MenuExtraPartProps {
  /** The id the item's `aria-describedby` points at. */
  readonly id: string;
}

/** What the adapter knows of a group: its id and whether a group label is mounted. */
export interface MenuGroupEntry {
  /** The SSR-stable id of the group, from the adapter. */
  readonly id: string;
  /** Whether a group label is mounted; the group is named by it. @defaultValue false */
  readonly hasLabel?: boolean | undefined;
}

/** Props of a group or a radio group: a `div` with the group role. */
export interface MenuGroupProps extends MenuExtraPartProps {
  /** Always `'group'`. */
  readonly role: 'group';
  /** The id of the group label, only while a group label is mounted. */
  readonly 'aria-labelledby'?: string | undefined;
}

/** Props of the label of a group. */
export interface MenuGroupLabelProps extends MenuExtraPartProps {
  /** The id the group's `aria-labelledby` points at. */
  readonly id: string;
}

/** The group and item content parts of a menu, bound to its state. */
export interface MenuItemContentParts {
  /** The props of a group of items. */
  readonly group: (entry: MenuGroupEntry) => MenuGroupProps;
  /** The props of the label of a group. */
  readonly groupLabel: (entry: Pick<MenuGroupEntry, 'id'>) => MenuGroupLabelProps;
  /** The props of a radio group: the same as a group, with the radio group class. */
  readonly radioGroup: (entry: MenuGroupEntry) => MenuGroupProps;
  /** The props of the indicator of a checkbox or radio item. */
  readonly itemIndicator: (entry: { readonly checked?: boolean | undefined }) => MenuItemIndicatorProps;
  /** The decorative content before the text of an item. */
  readonly itemLeading: MenuDecorativeProps;
  /** The decorative content after the text of an item. */
  readonly itemTrailing: MenuDecorativeProps;
  /** The props of the supporting text of the item with this key. */
  readonly itemSupportingText: (entry: { readonly key: string }) => MenuSupportingTextProps;
  /** The keyboard shortcut text of an item. */
  readonly itemShortcut: MenuExtraPartProps;
}
