import type { ComponentMeta } from '@cocokits/shared';

/** Tag meta: data for tests and docs, never read at runtime. */
export const tagMeta: ComponentMeta<'root'> = {
  dataAttrs: { root: [] },
  roles: { root: null },
  keyboard: [],
  defaultElements: { root: 'span' },
  form: 'None: a tag is static text and takes no part in a form.',
};
