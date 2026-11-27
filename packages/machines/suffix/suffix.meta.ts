import type { ComponentMeta } from '@cocokits/shared';

/** Suffix meta: data for tests and docs, never read at runtime. */
export const suffixMeta: ComponentMeta<'root'> = {
  dataAttrs: { root: [] },
  roles: { root: null },
  keyboard: [],
  defaultElements: { root: 'div' },
  form: 'None: a plain wrapper that adds no ARIA; the control does not take its name or description from it.',
};
