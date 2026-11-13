'use client';

import { useEffect, useRef, type ReactElement } from 'react';
import { svgIconAnatomy, getSvgIconProps } from '@cocokits/machines/svg-icon';
import { toReactProps, useThemeAttrs, useThemeIcons } from '@cocokits/react-core';
import { isDevelopment } from '../internal/dev';
import { mergeProps } from '../internal/merge-props';
import type { SvgIconProps } from './svg-icon.types';

function SvgIconImpl({ iconName, label, ref, ...rest }: SvgIconProps): ReactElement {
  const { icons } = useThemeIcons();
  const themeAttrs = useThemeAttrs(svgIconAnatomy).root;
  const { root, svg, paths } = getSvgIconProps({ iconName, icons, label });
  const found = svg.viewBox !== undefined;

  // Once per mount and per name: StrictMode runs the effect twice, and the ref keeps what it already reported.
  const reported = useRef<string | null>(null);
  useEffect(() => {
    if (found) {
      reported.current = null;
    } else if (reported.current !== iconName && isDevelopment()) {
      reported.current = iconName;
      console.error(
        `CocoKits: the theme has no icon named "${iconName}". Check the name, or add the icon to the icons of the theme config.`,
      );
    }
  }, [iconName, found]);

  const props = mergeProps({ ...themeAttrs, ...toReactProps(root) }, rest);
  // Only `svg` and `path` elements with bound attributes: no icon data is parsed or injected as markup.
  return (
    <span {...props} ref={ref}>
      <svg className={svg.class} viewBox={svg.viewBox}>
        {paths.map((path, index) => (
          <path key={index} d={path.d} fillRule={path['fill-rule']} clipRule={path['clip-rule']} />
        ))}
      </svg>
    </span>
  );
}

/** The {@link SvgIcon} component and its `displayName`. */
interface SvgIconComponent {
  (props: SvgIconProps): ReactElement;
  displayName: string;
}

/**
 * An icon of the provided theme, drawn by name. It renders a `<span>` with an `<svg>` that holds one `<path>` per
 * path of the icon.
 *
 * The icon data is the theme's (`ThemeConfig.icons`). It is bound as attributes only, never parsed
 * or injected as markup, and it is in the server HTML.
 *
 * The icon is decorative by default: the root has `aria-hidden="true"`. Set `label` for a meaningful icon; the root
 * then has `role="img"` and that `aria-label`. Inside a button that has its own name, leave `label` out.
 *
 * Without a theme, or with a name the theme does not have, it renders an empty `<svg>` and, in development, logs a
 * `CocoKits:` error. It never throws. Native `span` props pass through, and `ref` reaches the `<span>`.
 *
 * Unstyled, the browser sizes an `<svg>` that has a `viewBox` and no size to its default and fills it black. Size
 * `.cck-svg-icon__svg` and set `fill: currentColor`.
 *
 * To add an icon or change the icon of a part, provide an extended theme config:
 * `{ ...cocokitsThemeConfig, icons: { ...cocokitsThemeConfig.icons, logo } }`.
 *
 * @example
 * <SvgIcon iconName="heart" />
 * @cckPart root
 * @cckPart svg
 * @param props - The SvgIcon props.
 * @returns The rendered icon.
 */
export const SvgIcon: SvgIconComponent = Object.assign(SvgIconImpl, { displayName: 'SvgIcon' });
