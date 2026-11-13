import { defineAnatomy, type Anatomy, type AnatomyPart } from '@cocokits/shared';

/** SvgIcon anatomy: a root that names the icon and wraps the `<svg>` that draws it. */
export const svgIconAnatomy: Anatomy<'svg-icon', { readonly root: AnatomyPart; readonly svg: AnatomyPart }> =
  defineAnatomy({
    block: 'svg-icon',
    parts: {
      root: {
        name: 'Root',
        description:
          'The wrapper. It carries the icon name, is hidden from assistive technology unless it has a label, and ' +
          'then it is an image named by it.',
      },
      svg: {
        name: 'SVG',
        description: 'The `<svg>` with the `viewBox` of the icon and one `<path>` per path of the icon.',
      },
    },
  });
