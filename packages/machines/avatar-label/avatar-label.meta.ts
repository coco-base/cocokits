import type { ComponentMeta } from '@cocokits/shared';

/** AvatarLabel meta: data for tests and docs, never read at runtime. */
export const avatarLabelMeta: ComponentMeta<'root' | 'text' | 'name' | 'description'> = {
  dataAttrs: { root: [], text: [], name: [], description: [] },
  roles: { root: null, text: null, name: null, description: null },
  keyboard: [],
  defaultElements: { root: 'div', text: 'span', name: 'span', description: 'span' },
  form: 'None: an avatar is an image and takes no part in a form.',
};
