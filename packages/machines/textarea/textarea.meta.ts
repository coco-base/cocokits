import type { ComponentMeta } from '@cocokits/shared';
import { formFieldMeta } from '../form-field';

/**
 * Textarea meta: data for tests and docs, never read at runtime. No APG widget pattern applies: it is a
 * native textbox.
 */
export const textareaMeta: ComponentMeta<'root'> = {
  dataAttrs: { root: formFieldMeta.dataAttrs.root },
  ...(formFieldMeta.dataAttrDetails ? { dataAttrDetails: formFieldMeta.dataAttrDetails } : {}),
  roles: { root: null },
  keyboard: [
    {
      key: 'Tab / Shift+Tab',
      context: 'textarea',
      action: 'Moves focus in and out; never trapped. A disabled textarea is skipped; a read-only one stays focusable.',
    },
    {
      key: 'Text keys, IME',
      context: 'textarea',
      action: 'Edit the value. Each `input` event reports the change.',
    },
    { key: 'Enter', context: 'textarea', action: 'Inserts a line break; it never submits the form (native).' },
  ],
  defaultElements: { root: 'textarea' },
  form:
    'Native: the textarea is the form control, so FormData, constraint validation, the `form` attribute and ' +
    'fieldsets work as plain HTML. No hidden input.',
};
