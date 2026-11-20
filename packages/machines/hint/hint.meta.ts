import type { ComponentMeta } from '@cocokits/shared';

/** Hint meta: data for tests and docs, never read at runtime. */
export const hintMeta: ComponentMeta<'root'> = {
  dataAttrs: { root: [] },
  roles: { root: null },
  keyboard: [],
  defaultElements: { root: 'div' },
  form: 'None: inside a FormField the control lists the hint id in `aria-describedby`; outside one the author links it by hand.',
};
