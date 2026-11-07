import type { ComponentMeta } from '@cocokits/shared';

/** Badge meta: data for tests and docs, never read at runtime. */
export const badgeMeta: ComponentMeta<'root' | 'content' | 'maxIndicator'> = {
  dataAttrs: {
    root: ['data-empty', 'data-truncated'],
    content: [],
    maxIndicator: [],
  },
  roles: { root: null, content: null, maxIndicator: null },
  keyboard: [],
  defaultElements: { root: 'span', content: 'span', maxIndicator: 'span' },
  form: 'None: a badge is static text and takes no part in a form.',
};
