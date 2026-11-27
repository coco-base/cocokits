'use client';

import { useCallback, useEffect, useRef, useSyncExternalStore, type ReactElement } from 'react';
import { svgIconAnatomy, getSvgIconProps } from '@cocokits/machines/svg-icon';
import { toReactProps, useIconRegistry, useThemeAttrs } from '@cocokits/react-core';
import { isDevelopment } from '../internal/dev';
import { mergeProps } from '../internal/merge-props';
import { parsedSvg } from '../internal/parsed-svg';
import type { SvgIconProps } from './svg-icon.types';

/** The text of a development error, once per mount and per key: StrictMode runs effects twice. */
function useReportOnce(key: string | null, message: string): void {
  const reported = useRef<string | null>(null);
  useEffect(() => {
    if (key === null) {
      reported.current = null;
    } else if (reported.current !== key && isDevelopment()) {
      reported.current = key;
      console.error(message);
    }
  }, [key, message]);
}

const noSubscription = (): (() => void) => () => undefined;

function SvgIconImpl({ iconName, svg, label, ref, ...rest }: SvgIconProps): ReactElement {
  const registry = useIconRegistry();
  const subscribe = useCallback((listener: () => void) => registry.subscribe(listener), [registry]);
  const name = iconName === undefined || iconName === '' ? undefined : iconName;
  const svgText = name === undefined ? svg : undefined;
  const themeAttrs = useThemeAttrs(svgIconAnatomy).root;

  // A registered (eager or loaded) icon is read the same way on the server and on the first client render.
  const registered = useSyncExternalStore(
    subscribe,
    () => (name === undefined ? undefined : registry.get(name)),
    () => (name === undefined ? undefined : registry.get(name)),
  );
  const known = useSyncExternalStore(
    subscribe,
    () => name !== undefined && registry.has(name),
    () => name !== undefined && registry.has(name),
  );
  // An `svg` string is parsed on the client only: the server and the hydration pass see no icon, then it is drawn.
  const parsedIcon = useSyncExternalStore(
    noSubscription,
    () => (svgText === undefined ? undefined : parsedSvg(svgText)),
    () => undefined,
  );
  const svgInvalid = useSyncExternalStore(
    noSubscription,
    () => svgText !== undefined && parsedSvg(svgText) === undefined,
    () => false,
  );

  // After mount: a lazy icon loads, and a name registered later loads too.
  useEffect(() => {
    if (name === undefined) return undefined;
    const check = (): void => {
      if (registry.has(name) && registry.get(name) === undefined) void registry.load(name);
    };
    check();
    return registry.subscribe(check);
  }, [registry, name]);

  const problem = ((): { readonly key: string; readonly message: string } | null => {
    if (name !== undefined && svg !== undefined) {
      return { key: `both:${name}`, message: 'SvgIcon got both iconName and svg. Give one; iconName is used.' };
    }
    if (name === undefined && svg === undefined) {
      return { key: 'neither', message: 'SvgIcon got neither iconName nor svg, so it renders empty. Give one.' };
    }
    if (name !== undefined && !known) {
      return {
        key: `name:${name}`,
        message: `no icon named "${name}" is registered; register it with registerIcons or registerIcon.`,
      };
    }
    if (svgInvalid) {
      return {
        key: `svg:${svgText ?? ''}`,
        message: 'the svg string is not an <svg> element with a viewBox, so SvgIcon renders empty.',
      };
    }
    return null;
  })();
  useReportOnce(problem?.key ?? null, `CocoKits: ${problem?.message ?? ''}`);

  const icon = registered ?? parsedIcon;
  const { root, svg: svgProps, body } = getSvgIconProps({ iconName: name, icon, label });
  const props = mergeProps({ ...themeAttrs, ...toReactProps(root) }, rest);
  // The body is the icon's markup as registered: trusted content only. The component owns the outer `<svg>`.
  return (
    <span {...props} ref={ref}>
      <svg {...toReactProps(svgProps)} dangerouslySetInnerHTML={{ __html: body }} />
    </span>
  );
}

/** The {@link SvgIcon} component and its `displayName`. */
interface SvgIconComponent {
  (props: SvgIconProps): ReactElement;
  displayName: string;
}

/**
 * An icon drawn by name from the icons registered for your app, or from an SVG string. It renders a `<span>` with
 * `data-icon="<name>"`, only with `iconName`. Inside it is the `<svg>` the component owns, with the icon's `viewBox`,
 * `aria-hidden="true"` and `focusable="false"`, and the icon's markup.
 *
 * Register icons with {@link IconProvider} (`icons`, `lazyIcons`) or `useIconRegistry()`. An eager icon is in
 * the server HTML. A lazy icon and an `svg` string are empty on the server and the first client render, then drawn
 * after mount.
 *
 * Trusted content only: the markup of an icon and the `svg` string are inserted as they are, with no sanitising.
 * Never pass text from users or other untrusted sources.
 *
 * The icon is decorative by default: the root has `aria-hidden="true"`. Set `label` for a meaningful icon; the root
 * then has `role="img"` and that `aria-label`. Inside a button that has its own name, leave `label` out.
 *
 * A name that is not registered renders an empty `<svg>` and, in development, logs a `CocoKits:` error. It never
 * throws. Native `span` props pass through, and `ref` reaches the `<span>`.
 *
 * Unstyled, the browser sizes an `<svg>` that has a `viewBox` and no size to its default. The icons draw in
 * `currentColor`, so they take the text colour. Size `.cck-svg-icon__svg`.
 *
 * @example
 * import { IconProvider } from '@cocokits/react-core';
 * import { SvgIcon } from '@cocokits/react/svg-icon';
 * import { heartIcon } from '@cocokits/icons';
 *
 * <IconProvider icons={{ heart: heartIcon }}>
 *   <SvgIcon iconName="heart" />
 * </IconProvider>
 * @example
 * import logoSvg from './logo.svg?raw';
 *
 * <SvgIcon svg={logoSvg} label="Acme" />
 * @cckPart root
 * @cckPart svg
 * @param props - The SvgIcon props.
 * @returns The rendered icon.
 */
export const SvgIcon: SvgIconComponent = Object.assign(SvgIconImpl, { displayName: 'SvgIcon' });
