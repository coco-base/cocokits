/**
 * The default icon of each icon-holding part: anatomy block, then part name, then the name of a base icon. A part
 * shows its own content first, then the icon its theme names in `components.<block>.icons`, then this default.
 */
export const defaultPartIcons: {
  readonly select: { readonly dropdownIcon: 'chevron-down'; readonly optionIndicator: 'check' };
  readonly accordion: { readonly indicator: 'chevron-down' };
  readonly checkbox: { readonly background: 'check' };
} = {
  select: { dropdownIcon: 'chevron-down', optionIndicator: 'check' },
  accordion: { indicator: 'chevron-down' },
  checkbox: { background: 'check' },
};
