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

/** Which side of the text the avatar sits on, in the writing direction; no token collection holds it. */
const AVATAR_POSITIONS = ['start', 'end', 'top', 'bottom'] as const;
/** Name and description on two lines or side by side; no token collection holds it. */
const TEXT_LAYOUTS = ['stacked', 'inline'] as const;
/** The fallback is the neutral dark family the design's frames use; the type makes a value that is not a mode an error. */
const AVATAR_DEFAULT_COLOR: ThemeActiveColorMode = 'contrast';

/**
 * The options of the three avatar components; an avatar's own size wins over the one of its container. Not an
 * interface: an interface has no index signature, which `ThemeConfig` needs.
 */
export type AvatarComponentsConfig = Readonly<{
  readonly avatar: {
    readonly size: RootOption<typeof avatarSizeModes>;
    readonly color: RootOption<typeof themeActiveColorModes>;
  };
  readonly 'avatar-group': { readonly size: RootOption<typeof avatarGroupSizeModes> };
  readonly 'avatar-label': {
    readonly size: RootOption<typeof avatarLabelSizeModes>;
    readonly avatarPosition: RootOption<typeof AVATAR_POSITIONS>;
    readonly textLayout: RootOption<typeof TEXT_LAYOUTS>;
  };
}>;

export const avatarComponents: AvatarComponentsConfig = {
  avatar: {
    size: {
      attrName: 'size',
      values: avatarSizeModes,
      default: avatarSizeDefaultMode,
      partNames: ['root'],
      description: 'Side of the circle and size of the fallback text.',
    },
    color: {
      attrName: 'cck-color',
      values: themeActiveColorModes,
      default: AVATAR_DEFAULT_COLOR,
      partNames: ['root'],
      description: 'Color family of the fallback; renders the Active Color marker data-cck-color.',
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
      default: 'start',
      partNames: ['root'],
      description: 'Which side of the text the avatar sits on, in the writing direction.',
    },
    textLayout: {
      attrName: 'text-layout',
      values: TEXT_LAYOUTS,
      default: 'stacked',
      partNames: ['root'],
      description: 'Name and description on two lines or side by side.',
    },
  },
};
