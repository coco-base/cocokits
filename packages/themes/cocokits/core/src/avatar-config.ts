import {
  type ThemeActiveColorMode,
  themeActiveColorModes,
  avatarGroupSizeDefaultMode,
  avatarGroupSizeModes,
  avatarLabelSizeDefaultMode,
  avatarLabelSizeModes,
  avatarSizeDefaultMode,
  avatarSizeModes,
} from './generated/token-modes';
import type { RootOption } from './option-types';

/** A circle, or a square with rounded corners; no token collection holds it. */
const AVATAR_SHAPES = ['circle', 'square'] as const;
/** Which side of the text the avatar sits on, physical (left stays left in a right-to-left page); no token collection holds it. */
const AVATAR_POSITIONS = ['left', 'top', 'right', 'bottom'] as const;
/** Name and description on two lines (vertical) or side by side (horizontal); no token collection holds it. */
const LABEL_ALIGNMENTS = ['horizontal', 'vertical'] as const;
/** The fallback is the quiet grey family; the type makes a value that is not a mode an error. */
const AVATAR_DEFAULT_COLOR: ThemeActiveColorMode = 'neutral';

/**
 * The options of the three avatar components; an avatar's own size wins over the one of its container. Not an
 * interface: an interface has no index signature, which `ThemeConfig` needs.
 */
export type AvatarComponentsConfig = Readonly<{
  readonly avatar: {
    readonly size: RootOption<typeof avatarSizeModes>;
    readonly color: RootOption<typeof themeActiveColorModes>;
    readonly shape: RootOption<typeof AVATAR_SHAPES>;
  };
  readonly 'avatar-group': { readonly size: RootOption<typeof avatarGroupSizeModes> };
  readonly 'avatar-label': {
    readonly size: RootOption<typeof avatarLabelSizeModes>;
    readonly avatarPosition: RootOption<typeof AVATAR_POSITIONS>;
    readonly labelAlignment: RootOption<typeof LABEL_ALIGNMENTS>;
  };
}>;

export const avatarComponents: AvatarComponentsConfig = {
  avatar: {
    size: {
      attrName: 'size',
      values: avatarSizeModes,
      default: avatarSizeDefaultMode,
      partNames: ['root'],
      description: 'Side of the avatar and size of the fallback text.',
    },
    color: {
      attrName: 'cck-color',
      values: themeActiveColorModes,
      default: AVATAR_DEFAULT_COLOR,
      partNames: ['root'],
      description: 'Colour of the fallback; the default is neutral.',
    },
    shape: {
      attrName: 'shape',
      values: AVATAR_SHAPES,
      default: 'circle',
      partNames: ['root'],
      description: 'A circle, or a square with rounded corners.',
    },
  },
  'avatar-group': {
    size: {
      attrName: 'size',
      values: avatarGroupSizeModes,
      default: avatarGroupSizeDefaultMode,
      partNames: ['root'],
      description: 'Overlap and ring; its avatars that set no size of their own take its size.',
    },
  },
  'avatar-label': {
    size: {
      attrName: 'size',
      values: avatarLabelSizeModes,
      default: avatarLabelSizeDefaultMode,
      partNames: ['root'],
      description: 'Gap and text size; its avatar that sets no size of its own takes its size.',
    },
    avatarPosition: {
      attrName: 'avatar-position',
      values: AVATAR_POSITIONS,
      default: 'left',
      partNames: ['root'],
      description: 'Which side of the text the avatar sits on: left, top, right or bottom.',
    },
    labelAlignment: {
      attrName: 'label-alignment',
      values: LABEL_ALIGNMENTS,
      default: 'vertical',
      partNames: ['root'],
      description: 'Name and description on two lines or side by side.',
    },
  },
};
