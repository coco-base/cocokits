'use client';

import type { ReactElement } from 'react';
import { Divider as BaseDivider, type DividerProps as BaseDividerProps } from '@cocokits/react/divider';
import { ThemeOptionsProvider } from '@cocokits/react-core';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';

type DividerOptions = CocokitsThemeConfig['components']['divider'];

/** The `size` values of the cocokits theme. */
export type DividerSize = DividerOptions['size']['values'][number];
/** The `color` values of the cocokits theme. */
export type DividerColor = DividerOptions['color']['values'][number];

/** Props of the themed {@link Divider}: the base props plus the two cocokits options. */
export interface DividerProps extends BaseDividerProps {
  /**
   * Thickness of the line.
   */
  readonly size?: DividerSize | null | undefined;
  /**
   * How strong the line is. Rendered as `data-color`.
   */
  readonly color?: DividerColor | null | undefined;
}

function ThemedDivider({ size, color, ...props }: DividerProps): ReactElement {
  return (
    <ThemeOptionsProvider componentName="divider" options={{ size, color }}>
      <BaseDivider {...props} />
    </ThemeOptionsProvider>
  );
}

/** The themed {@link Divider} component and its `displayName`. */
interface DividerComponent {
  (props: DividerProps): ReactElement;
  displayName: string;
}

/**
 * The cocokits Divider. It renders a native `<hr>` and supplies `size` and `color` to the base Divider, which
 * renders the `data-*` attributes. Each option resolves in order: the prop, then the `ThemeProvider` override,
 * then the config default; `null` removes the attribute. The theme needs a `ThemeProvider`.
 *
 * It has no margin. The layout around it, such as a `gap`, sets the space. Where the line is the only cue of a
 * grouping, use `color="dark"`, the one strength that reaches a 3:1 contrast in both colour modes.
 *
 * @example
 * <Divider size="lg" color="dark" />
 * @cckPart root
 */
export const Divider: DividerComponent = Object.assign(ThemedDivider, { displayName: 'Divider' });
