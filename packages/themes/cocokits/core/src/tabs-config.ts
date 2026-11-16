import type { RootOption } from './option-types';
import { rootSize } from './option-helpers';
import {
  type ThemeActiveColorMode,
  tabsSizeDefaultMode,
  tabsSizeModes,
  themeActiveColorModes,
} from './generated/token-modes';

const TABS_VARIANTS = ['border', 'fill', 'line', 'basic'] as const;
/** Where the list sits across the tabs, in the writing direction; no token collection holds it. */
const TABS_HEADER_ALIGNS = ['start', 'center', 'end', 'stretch'] as const;
/** The Tabs indicator is neutral until the author picks a family; the type makes a value that is not a mode an error. */
const TABS_DEFAULT_COLOR: ThemeActiveColorMode = 'neutral';

/**
 * The options of Tabs and TabNav (they share the look and the tokens). Not an interface: an interface has no index
 * signature, which `ThemeConfig` needs.
 */
export type TabsOptions = Readonly<{
  variant: RootOption<typeof TABS_VARIANTS>;
  color: RootOption<typeof themeActiveColorModes>;
  size: RootOption<typeof tabsSizeModes>;
  headerAlign: RootOption<typeof TABS_HEADER_ALIGNS>;
}>;

/** The options of Tabs and TabNav. */
export const tabsOptions: TabsOptions = {
  variant: {
    attrName: 'variant',
    values: TABS_VARIANTS,
    default: 'border',
    partNames: ['root'],
    description: 'Look of the list and the indicator: a bordered list, a filled list, a line, or the indicator alone.',
  },
  color: {
    attrName: 'cck-color',
    values: themeActiveColorModes,
    default: TABS_DEFAULT_COLOR,
    partNames: ['root'],
    description: 'Colour family of the indicator.',
  },
  size: rootSize(tabsSizeModes, tabsSizeDefaultMode, 'Height, padding and text of the triggers.'),
  headerAlign: {
    attrName: 'header-align',
    values: TABS_HEADER_ALIGNS,
    default: 'start',
    partNames: ['root'],
    description: 'Where the list sits across the tabs, or stretched over their whole width.',
  },
};
