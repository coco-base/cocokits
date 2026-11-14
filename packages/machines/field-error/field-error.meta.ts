import type { ComponentMeta } from '@cocokits/shared';

/** FieldError meta: data for tests and docs, never read at runtime. */
export const fieldErrorMeta: ComponentMeta<'root'> = {
  dataAttrs: { root: [] },
  roles: { root: null },
  keyboard: [],
  defaultElements: { root: 'div' },
  form: 'None: inside a FormField the control lists the error id in `aria-describedby`; the element is empty while the error is hidden.',
};
