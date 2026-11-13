import type { ComponentMeta } from '@cocokits/shared';

/** Avatar meta: data for tests and docs, never read at runtime. */
export const avatarMeta: ComponentMeta<'root' | 'image' | 'fallback'> = {
  dataAttrs: { root: [], image: [], fallback: [] },
  roles: { root: null, image: null, fallback: null },
  keyboard: [],
  defaultElements: { root: 'span', image: 'img', fallback: 'span' },
  form: 'None: an avatar is an image and takes no part in a form.',
};
