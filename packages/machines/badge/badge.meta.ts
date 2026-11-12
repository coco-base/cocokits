import type { ComponentMeta } from '@cocokits/shared';

/** Badge meta: data for tests and docs, never read at runtime. */
export const badgeMeta: ComponentMeta<'root' | 'content' | 'maxIndicator'> = {
  dataAttrs: {
    root: ['data-empty', 'data-truncated'],
    content: [],
    maxIndicator: [],
  },
  dataAttrDetails: {
    'data-empty': { setWhen: 'The badge shows no text: the content is empty, undefined, null or 0.' },
    'data-truncated': { setWhen: 'The content is a number above `max`, so the badge shows `max` instead.' },
  },
  roles: { root: null, content: null, maxIndicator: null },
  keyboard: [],
  defaultElements: { root: 'span', content: 'span', maxIndicator: 'span' },
  form: 'None: a badge is static text and takes no part in a form.',
};
