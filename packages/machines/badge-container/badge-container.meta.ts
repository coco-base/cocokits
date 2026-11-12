import type { ComponentMeta } from '@cocokits/shared';

/** BadgeContainer meta: data for tests and docs, never read at runtime. */
export const badgeContainerMeta: ComponentMeta<'root'> = {
  dataAttrs: { root: ['data-position'] },
  dataAttrDetails: {
    'data-position': {
      values: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
      setWhen: 'Always set: the corner of the container the badge is pinned to.',
    },
  },
  roles: { root: null },
  keyboard: [],
  defaultElements: { root: 'div' },
  form: 'None: a badge container is layout and takes no part in a form.',
};
