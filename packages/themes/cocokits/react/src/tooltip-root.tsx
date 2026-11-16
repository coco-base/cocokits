'use client';

import { useMemo, type ReactElement } from 'react';
import { Tooltip as BaseTooltip, type TooltipRootProps as BaseTooltipRootProps } from '@cocokits/react/tooltip';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { TooltipThemeContext } from './theme-contexts';

type TooltipOptions = CocokitsThemeConfig['components']['tooltip'];

/** The `size` values of the cocokits theme. */
export type TooltipSize = TooltipOptions['size']['values'][number];

/** Props of the themed {@link Tooltip.Root}: the base props plus the cocokits `size`. */
export interface TooltipRootProps extends BaseTooltipRootProps {
  /**
   * Padding, width and text of the bubble, drawn on the content. The `Tooltip.Content` of this tooltip reads it.
   */
  readonly size?: TooltipSize | null | undefined;
}

function ThemedTooltipRoot({ size, ...props }: TooltipRootProps): ReactElement {
  const parent = useMemo(() => ({ size }), [size]);
  return (
    <TooltipThemeContext value={parent}>
      <BaseTooltip.Root {...props} />
    </TooltipThemeContext>
  );
}

/** The themed {@link Tooltip.Root} component and its `displayName`. */
export interface TooltipRootComponent {
  (props: TooltipRootProps): ReactElement;
  displayName: string;
}

/**
 * The cocokits Tooltip root. It renders the base root and keeps `size` for its `Tooltip.Content`, which draws it. It
 * renders no element and no attribute itself. The option resolves in order: the prop, then the `ThemeProvider`
 * override, then the config default; `null` removes the attribute. The theme needs a `ThemeProvider`.
 *
 * @example
 * <Tooltip.Root size="lg">
 *   <Tooltip.Trigger>Copy</Tooltip.Trigger>
 *   <Tooltip.Content>Copies the link</Tooltip.Content>
 * </Tooltip.Root>
 * @cckPart root
 */
export const TooltipRoot: TooltipRootComponent = Object.assign(ThemedTooltipRoot, { displayName: 'Tooltip.Root' });
