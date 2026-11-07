'use client';

import type { ReactElement } from 'react';
import { Switch as BaseSwitch, type SwitchProps as BaseSwitchProps } from '@cocokits/react/switch';
import { ThemeOptionsProvider } from '@cocokits/react-core';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';

type SwitchOptions = CocokitsThemeConfig['components']['switch'];

/** The `size` values of the cocokits theme. */
export type SwitchSize = SwitchOptions['size']['values'][number];
/** The `color` values of the cocokits theme. */
export type SwitchColor = SwitchOptions['color']['values'][number];
/** The `labelPosition` values of the cocokits theme. */
export type SwitchLabelPosition = SwitchOptions['labelPosition']['values'][number];

/** Props of the themed {@link Switch}: the base props plus the three cocokits options. */
export interface SwitchProps extends BaseSwitchProps {
  /**
   * Size of the track and its label text.
   */
  readonly size?: SwitchSize | null | undefined;
  /**
   * Color family of the checked state, rendered as `data-cck-color`.
   */
  readonly color?: SwitchColor | null | undefined;
  /**
   * Whether the label follows the track or precedes it, in the writing direction.
   */
  readonly labelPosition?: SwitchLabelPosition | null | undefined;
}

function ThemedSwitch({ size, color, labelPosition, ...props }: SwitchProps): ReactElement {
  return (
    <ThemeOptionsProvider componentName="switch" options={{ size, color, labelPosition }}>
      <BaseSwitch {...props} />
    </ThemeOptionsProvider>
  );
}

/** The themed {@link Switch} component and its `displayName`. */
interface SwitchComponent {
  (props: SwitchProps): ReactElement;
  displayName: string;
}

/**
 * The cocokits Switch. It renders the base Switch and supplies `size`, `color` and `labelPosition` to it,
 * which renders the `data-*` attributes on the root. Each option resolves in order: the prop, then the
 * `ThemeProvider` override, then the config default; `null` removes the attribute. The theme needs a
 * `ThemeProvider`.
 *
 * @example
 * <Switch size="lg" color="success" labelPosition="before">Label</Switch>
 * @cckPart root
 */
export const Switch: SwitchComponent = Object.assign(ThemedSwitch, { displayName: 'Switch' });
