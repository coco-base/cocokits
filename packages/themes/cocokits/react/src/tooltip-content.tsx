'use client';

import { useContext, type ReactElement } from 'react';
import { Tooltip as BaseTooltip, type TooltipContentProps } from '@cocokits/react/tooltip';
import { ThemeOptionsProvider } from '@cocokits/react-core';
import { TooltipThemeContext } from './theme-contexts';

function ThemedTooltipContent(props: TooltipContentProps): ReactElement {
  const root = useContext(TooltipThemeContext); // a portal keeps the context
  return (
    <ThemeOptionsProvider componentName="tooltip" options={{ size: root.size }}>
      <BaseTooltip.Content {...props} />
    </ThemeOptionsProvider>
  );
}

/** The themed {@link Tooltip.Content} component and its `displayName`. */
export interface TooltipContentComponent {
  (props: TooltipContentProps): ReactElement;
  displayName: string;
}

/**
 * The cocokits Tooltip content. It renders the base content and supplies the `size` of its `Tooltip.Root` to it, which
 * renders `data-size` on the bubble. The option resolves in order: the `size` of the root, then the `ThemeProvider`
 * override, then the config default; `null` removes the attribute. The theme needs a `ThemeProvider`.
 *
 * @example
 * <Tooltip.Content>Copies the link</Tooltip.Content>
 * @cckPart content
 */
export const TooltipContent: TooltipContentComponent = Object.assign(ThemedTooltipContent, {
  displayName: 'Tooltip.Content',
});
