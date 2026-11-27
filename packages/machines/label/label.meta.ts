import type { ComponentMeta } from '@cocokits/shared';

/** Label meta: data for tests and docs, never read at runtime. */
export const labelMeta: ComponentMeta<'root' | 'requiredMarker'> = {
  dataAttrs: { root: [], requiredMarker: [] },
  roles: { root: null, requiredMarker: null },
  keyboard: [],
  defaultElements: { root: 'label', requiredMarker: 'span' },
  form: 'None: the label names a control through the native `for` attribute and adds no value.',
};
