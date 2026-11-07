import type { ComponentMeta } from '@cocokits/shared';

/** BadgeContainer meta: data for tests and docs, never read at runtime. */
export const badgeContainerMeta: ComponentMeta<'root'> = {
  dataAttrs: { root: ['data-position'] },
  roles: { root: null },
  keyboard: [],
  defaultElements: { root: 'div' },
  form: 'None: a badge container is layout and takes no part in a form.',
};
