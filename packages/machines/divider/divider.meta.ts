import type { ComponentMeta } from '@cocokits/shared';

/** Divider meta: data for tests and docs, never read at runtime. */
export const dividerMeta: ComponentMeta<'root'> = {
  dataAttrs: { root: ['data-orientation'] },
  dataAttrDetails: {
    'data-orientation': {
      values: ['horizontal', 'vertical'],
      setWhen: 'Always set: the direction of the line, `horizontal` unless `orientation` says otherwise.',
    },
  },
  roles: { root: null },
  keyboard: [],
  defaultElements: { root: 'hr' },
  form: 'None: a divider is not a form control.',
};
