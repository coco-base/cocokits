import type { ComponentMeta } from '@cocokits/shared';

/** FieldError meta: data for tests and docs, never read at runtime. */
export const fieldErrorMeta: ComponentMeta<'root'> = {
  dataAttrs: { root: [] },
  roles: { root: null },
  keyboard: [],
  defaultElements: { root: 'div' },
  form: 'None: the message sits in the feedback wrapper, which the control already names with `aria-describedby`.',
};
