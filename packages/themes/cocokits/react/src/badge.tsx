'use client';

import type { ReactElement } from 'react';
import { Badge as BaseBadge, type BadgeProps as BaseBadgeProps } from '@cocokits/react/badge';
import { ThemeOptionsProvider } from '@cocokits/react-core';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';

type BadgeOptions = CocokitsThemeConfig['components']['badge'];

/** The `variant` values of the cocokits theme. */
export type BadgeVariant = BadgeOptions['variant']['values'][number];
/** The `color` values of the cocokits theme. */
export type BadgeColor = BadgeOptions['color']['values'][number];
/** The `size` values of the cocokits theme. */
export type BadgeSize = BadgeOptions['size']['values'][number];

/** Props of the themed {@link Badge}: the base props plus the three cocokits options. */
export interface BadgeProps extends BaseBadgeProps {
  /**
   * Corner radius: a pill or a small radius.
   */
  readonly variant?: BadgeVariant | null | undefined;
  /**
   * Color family, rendered as `data-cck-color`.
   */
  readonly color?: BadgeColor | null | undefined;
  /**
   * Height, padding, dot size and text size.
   */
  readonly size?: BadgeSize | null | undefined;
}

function ThemedBadge({ variant, color, size, ...props }: BadgeProps): ReactElement {
  return (
    <ThemeOptionsProvider componentName="badge" options={{ variant, color, size }}>
      <BaseBadge {...props} />
    </ThemeOptionsProvider>
  );
}

/** The themed {@link Badge} component and its `displayName`. */
interface BadgeComponent {
  (props: BadgeProps): ReactElement;
  displayName: string;
}

/**
 * The cocokits Badge. By default it renders a `<span>` with a count, a short text or a dot, and supplies
 * `variant`, `color` and `size` to the base Badge, which renders the `data-*` attributes. Each
 * option resolves in order: the prop, then the `ThemeProvider` override, then the config default;
 * `null` removes the attribute. The theme needs a `ThemeProvider`.
 *
 * It has no role. A dot has no text: put the meaning in the host's name, for example
 * `aria-label="Messages, 2 new"` on an Icon button.
 *
 * @example
 * <Badge content={5} variant="rectangle" color="danger" size="lg" />
 * @cckPart root
 */
export const Badge: BadgeComponent = Object.assign(ThemedBadge, { displayName: 'Badge' });
