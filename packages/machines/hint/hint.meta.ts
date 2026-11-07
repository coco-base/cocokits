import type { ComponentMeta } from '@cocokits/shared';

/** Hint meta: data for tests and docs, never read at runtime. */
export const hintMeta: ComponentMeta<'root'> = {
  dataAttrs: { root: [] },
  roles: { root: null },
  keyboard: [],
  defaultElements: { root: 'div' },
  form: 'None: the author links the hint to a control with `aria-describedby`.',
};
