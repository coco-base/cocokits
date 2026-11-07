'use client';

import type { ReactElement } from 'react';
import { Radio as BaseRadio, type RadioProps as BaseRadioProps } from '@cocokits/react/radio';
import { ThemeOptionsProvider } from '@cocokits/react-core';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';

type RadioOptions = CocokitsThemeConfig['components']['radio'];

/** The `size` values of the cocokits theme. */
export type RadioSize = RadioOptions['size']['values'][number];
/** The `color` values of the cocokits theme. */
export type RadioColor = RadioOptions['color']['values'][number];
/** The `labelPosition` values of the cocokits theme. */
export type RadioLabelPosition = RadioOptions['labelPosition']['values'][number];

/** Props of the themed {@link Radio}: the base props plus the three cocokits options. */
export interface RadioProps extends BaseRadioProps {
  /**
   * Size of the radio and its label text.
   */
  readonly size?: RadioSize | null | undefined;
  /**
   * Color family of the checked state, rendered as `data-cck-color`.
   */
  readonly color?: RadioColor | null | undefined;
  /**
   * Whether the label follows the radio or precedes it, in the writing direction.
   */
  readonly labelPosition?: RadioLabelPosition | null | undefined;
}

function ThemedRadio({ size, color, labelPosition, ...props }: RadioProps): ReactElement {
  return (
    <ThemeOptionsProvider componentName="radio" options={{ size, color, labelPosition }}>
      <BaseRadio {...props} />
    </ThemeOptionsProvider>
  );
}

/** The themed {@link Radio} component and its `displayName`. */
interface RadioComponent {
  (props: RadioProps): ReactElement;
  displayName: string;
}

/**
 * The cocokits Radio. It renders the base Radio and supplies `size`, `color` and `labelPosition` to it,
 * which renders the `data-*` attributes on the root. Each option resolves in order: the prop, then the
 * `ThemeProvider` override, then the config default; `null` removes the attribute. The theme needs a
 * `ThemeProvider`.
 *
 * @example
 * <Radio size="lg" color="success" labelPosition="before">Label</Radio>
 * @cckPart root
 */
export const Radio: RadioComponent = Object.assign(ThemedRadio, { displayName: 'Radio' });
