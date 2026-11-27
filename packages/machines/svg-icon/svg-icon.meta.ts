import type { ComponentMeta } from '@cocokits/shared';

/** SvgIcon meta: data for tests and docs, never read at runtime. */
export const svgIconMeta: ComponentMeta<'root' | 'svg'> = {
  dataAttrs: { root: ['data-icon'], svg: [] },
  dataAttrDetails: {
    'data-icon': {
      setWhen: 'The `iconName` input is set: it holds that name, also when no icon of that name is registered.',
    },
  },
  // The root has no role without a label. With a label it is `img` and carries `aria-label`; without one it is
  // `aria-hidden`. The type takes one role per part, so the meta records `null`.
  roles: { root: null, svg: null },
  defaultElements: { root: 'span', svg: 'svg' },
  keyboard: [],
  form: 'Not a form control: it is decorative or an image and takes no value.',
};
