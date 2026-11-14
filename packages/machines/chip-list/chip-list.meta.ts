import type { ComponentMeta } from '@cocokits/shared';
import { formFieldMeta } from '../form-field';

/** Chip list meta: data for tests and docs, never read at runtime. */
export const chipListMeta: ComponentMeta<'root' | 'input'> = {
  dataAttrs: { root: formFieldMeta.dataAttrs.root, input: [] },
  ...(formFieldMeta.dataAttrDetails ? { dataAttrDetails: formFieldMeta.dataAttrDetails } : {}),
  roles: { root: null, input: null },
  keyboard: [
    {
      key: 'Enter',
      context: 'text box with text',
      action:
        'Adds the text, trimmed, as a chip unless it is already there, clears the text box and keeps the form from submitting. Ignored while an IME composition runs or a modifier is held.',
    },
    {
      key: 'Enter',
      context: 'text box without text',
      action: 'Nothing is added; the implicit submission of the owner form goes on (native).',
    },
    {
      key: 'Enter, Space',
      context: 'remove button',
      action: 'Removes the chip (native button activation) and moves focus to the text box.',
    },
    {
      key: 'Tab, Shift+Tab',
      context: 'chip list',
      action: 'Native order: each enabled remove button, then the text box.',
    },
  ],
  defaultElements: { root: 'div', input: 'input' },
  form:
    'Native through hidden inputs, as the multiple Select: `name` and `form` go to one hidden input per value, ' +
    'and to one empty input while required and empty, so FormData, constraint validation and the `form` attribute ' +
    'work as plain HTML. The text box has no `name`. A reset restores the default value.',
};
