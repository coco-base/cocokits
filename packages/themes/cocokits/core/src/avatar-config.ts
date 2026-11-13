import {
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

/**
 * The options of the three avatar components; a container's size wins over its direct avatars' own. Not an
 * interface: an interface has no index signature, which `ThemeConfig` needs.
 */
export type AvatarComponentsConfig = Readonly<{
  readonly avatar: { readonly size: RootOption<typeof avatarSizeModes> };
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
  },
  'avatar-group': {
    size: {
      attrName: 'size',
      values: avatarGroupSizeModes,
      default: avatarGroupSizeDefaultMode,
      partNames: ['root'],
      description: 'Overlap, ring and the size of its direct avatars; it wins over their own size.',
    },
  },
  'avatar-label': {
    size: {
      attrName: 'size',
      values: avatarLabelSizeModes,
      default: avatarLabelSizeDefaultMode,
      partNames: ['root'],
      description: 'Gap, text size and the size of its direct avatar; it wins over its own size.',
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
