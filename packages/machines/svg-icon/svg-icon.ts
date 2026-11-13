import { svgIconAnatomy } from './svg-icon.anatomy';
import type { SvgIconProps, SvgIconRenderProps, SvgIconRootProps } from './svg-icon.types';

/**
 * Computes what an SvgIcon renders. Pure: no DOM, no mutation of `icon`, same result on server and client.
 * Without an `icon` (not found, still loading, not yet mounted) the `<svg>` has no `viewBox` and an empty body;
 * the adapter reports a name that is not registered. The body is the icon's markup as it is: trusted content only.
 *
 * @param props - The icon name, the resolved icon and the optional label.
 * @returns The root props, the `<svg>` props and the body.
 */
export function getSvgIconProps({ iconName, icon, label }: SvgIconProps): SvgIconRenderProps {
  const classes = svgIconAnatomy.classes;
  const named = label !== undefined && label !== '';
  const root: SvgIconRootProps = {
    class: classes.root,
    ...(iconName === undefined || iconName === '' ? {} : { 'data-icon': iconName }),
    ...(named ? { role: 'img', 'aria-label': label } : { 'aria-hidden': 'true' }),
  };
  return {
    root,
    svg: {
      class: classes.svg,
      ...(icon === undefined ? {} : { viewBox: icon.viewBox }),
      'aria-hidden': 'true',
      focusable: 'false',
    },
    body: icon?.body ?? '',
  };
}
