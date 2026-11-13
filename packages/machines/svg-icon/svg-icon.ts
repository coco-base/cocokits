import { svgIconAnatomy } from './svg-icon.anatomy';
import type { SvgIconPathProps, SvgIconProps, SvgIconRenderProps, SvgIconRootProps } from './svg-icon.types';

/** A theme from untyped data can hold any string; only the two values the SVG attribute allows are bound. */
function isSvgFillRule(value: unknown): value is 'nonzero' | 'evenodd' {
  return value === 'nonzero' || value === 'evenodd';
}

/**
 * Computes what an SvgIcon renders. Pure: no DOM, no mutation of `icons`, same result on server and client.
 * An icon that is not found (no icons, unknown name) gives an `<svg>` with no `viewBox` and no path; the adapter
 * reports it. Only `d`, `fill-rule` and `clip-rule` leave the icon data (a rule other than `nonzero` or `evenodd` is dropped), and they are values to bind as attributes,
 * never markup to parse.
 *
 * @param props - The icon name, the theme icons and the optional label.
 * @returns The root props, the `<svg>` props and the paths.
 */
export function getSvgIconProps({ iconName, icons, label }: SvgIconProps): SvgIconRenderProps {
  const classes = svgIconAnatomy.classes;
  const named = label !== undefined && label !== '';
  const root: SvgIconRootProps = {
    class: classes.root,
    'data-icon-name': iconName,
    ...(named ? { role: 'img', 'aria-label': label } : { 'aria-hidden': 'true' }),
  };
  const icon = Object.hasOwn(icons, iconName) ? icons[iconName] : undefined;
  if (icon === undefined) return { root, svg: { class: classes.svg }, paths: [] };
  const paths = icon.paths.map(({ d, fillRule, clipRule }): SvgIconPathProps => ({
    d,
    ...(isSvgFillRule(fillRule) ? { 'fill-rule': fillRule } : {}),
    ...(isSvgFillRule(clipRule) ? { 'clip-rule': clipRule } : {}),
  }));
  return { root, svg: { class: classes.svg, viewBox: icon.viewBox }, paths };
}
