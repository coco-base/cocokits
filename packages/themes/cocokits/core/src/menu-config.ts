import type { Option } from './option-types';
import { menuContentSizeDefaultMode, menuContentSizeModes } from './generated/token-modes';
import type { ThemeIconName } from './theme-icons';

/** The colour of a Menu item: the text colour, or the danger colour for an action that cannot be undone. */
const MENU_ITEM_COLORS = ['default', 'danger'] as const;
/** The Menu parts that are an item: the plain item, the checkbox item, the radio item and the sub-trigger. */
const MENU_ITEM_PARTS = ['item', 'checkboxItem', 'radioItem', 'subTrigger'] as const;

/**
 * The options of the Menu. Item icons are the author's content; the indicator of a checkbox or radio item is the one
 * icon the theme draws. Not an interface: an interface has no index signature, which `ThemeConfig` needs.
 */
export type MenuOptions = Readonly<{
  size: Option<typeof menuContentSizeModes, readonly ['content', 'subContent']>;
  color: Option<typeof MENU_ITEM_COLORS, typeof MENU_ITEM_PARTS>;
  icons: { readonly itemIndicator: ThemeIconName };
}>;

/** The options of the Menu. */
export const menuOptions: MenuOptions = {
  size: {
    attrName: 'size',
    values: menuContentSizeModes,
    default: menuContentSizeDefaultMode,
    partNames: ['content', 'subContent'],
    description: 'Height of the items, set on the content or the submenu content; the items follow it.',
  },
  color: {
    attrName: 'color',
    values: MENU_ITEM_COLORS,
    default: 'default',
    partNames: MENU_ITEM_PARTS,
    description: 'Colour of the item: the text colour, or the danger colour for an action that cannot be undone.',
  },
  icons: { itemIndicator: 'check' },
};
