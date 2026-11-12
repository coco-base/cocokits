import type { ComponentMeta } from '@cocokits/shared';
import { formFieldFactDetails, formFieldMeta } from '../form-field';

/** Input meta: data for tests and docs, never read at runtime. */
export const inputMeta: ComponentMeta<'root'> = {
  dataAttrs: { root: formFieldMeta.dataAttrs.root },
  dataAttrDetails: formFieldFactDetails('the input'),
  roles: { root: null },
  keyboard: [
    {
      key: 'Tab / Shift+Tab',
      context: 'input',
      action: 'Moves focus in and out. A disabled input is skipped; a read-only input stays focusable (native).',
    },
    {
      key: 'Text keys, IME',
      context: 'input',
      action: 'Edit the value. Each `input` event reports the change.',
    },
    { key: 'Enter', context: 'input in a form', action: 'Implicit submission of the owner form (native).' },
  ],
  defaultElements: { root: 'input' },
  form:
    'Native: the input is the form control, so FormData, constraint validation, the `form` attribute, ' +
    'implicit submission and fieldsets work as plain HTML. No hidden input.',
};
