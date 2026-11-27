import { themeActiveColorModes, tagSizeDefaultMode, tagSizeModes } from './generated/token-modes';
import { rootSize } from './option-helpers';
import { BOOLEAN_VALUES, type RootOption } from './option-types';

/** The looks of the label: a tinted fill, a full fill or a border; no token collection holds them. */
const TAG_VARIANTS = ['soft', 'solid', 'outline'] as const;

/**
 * The options of the Tag. It has no hover, focus or pressed look: it is a label, not a control. Not an interface: an
 * interface has no index signature, which `ThemeConfig` needs.
 */
export type TagOptions = Readonly<{
  variant: RootOption<typeof TAG_VARIANTS>;
  color: RootOption<typeof themeActiveColorModes>;
  size: RootOption<typeof tagSizeModes>;
  dot: RootOption<typeof BOOLEAN_VALUES>;
}>;

/** The options of the Tag. */
export const tagOptions: TagOptions = {
  variant: {
    attrName: 'variant',
    values: TAG_VARIANTS,
    default: 'soft',
    partNames: ['root'],
    description: 'Look of the label: a tinted fill, a full fill or a border.',
  },
  color: {
    attrName: 'cck-color',
    values: themeActiveColorModes,
    default: 'neutral',
    partNames: ['root'],
    description: 'Colour family of the label, for a status or a category.',
  },
  size: rootSize(tagSizeModes, tagSizeDefaultMode, 'Height, padding, text and icon size.'),
  dot: {
    attrName: 'dot',
    values: BOOLEAN_VALUES,
    default: false,
    partNames: ['root'],
    description: 'Shows a small dot in the text colour before the content.',
  },
};
