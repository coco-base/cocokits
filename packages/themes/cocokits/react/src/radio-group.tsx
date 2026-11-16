'use client';

import { useMemo, type ReactElement } from 'react';
import { RadioGroup as BaseRadioGroup, type RadioGroupProps as BaseRadioGroupProps } from '@cocokits/react/radio-group';
import { ThemeOptionsProvider } from '@cocokits/react-core';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { RadioGroupThemeContext } from './theme-contexts';

type RadioGroupOptions = CocokitsThemeConfig['components']['radio-group'];

/** The `size` values of the cocokits theme. */
export type RadioGroupSize = RadioGroupOptions['size']['values'][number];
/** The `color` values of the cocokits theme. */
export type RadioGroupColor = RadioGroupOptions['color']['values'][number];
/** The `labelPosition` values of the cocokits theme. */
export type RadioGroupLabelPosition = RadioGroupOptions['labelPosition']['values'][number];

/** Props of the themed {@link RadioGroup}: the base props plus the three cocokits options. */
export interface RadioGroupProps extends BaseRadioGroupProps {
  /**
   * Size of the radios that set none of their own.
   */
  readonly size?: RadioGroupSize | null | undefined;
  /**
   * Color family of the radios that set none of their own, rendered as `data-cck-color`.
   */
  readonly color?: RadioGroupColor | null | undefined;
  /**
   * Label side of the radios that set none of their own.
   */
  readonly labelPosition?: RadioGroupLabelPosition | null | undefined;
}

function ThemedRadioGroup({ size, color, labelPosition, ...props }: RadioGroupProps): ReactElement {
  const parent = useMemo(() => ({ size, color, labelPosition }), [size, color, labelPosition]);
  return (
    <RadioGroupThemeContext value={parent}>
      <ThemeOptionsProvider componentName="radio-group" options={{ size, color, labelPosition }}>
        <BaseRadioGroup {...props} />
      </ThemeOptionsProvider>
    </RadioGroupThemeContext>
  );
}

/** The themed {@link RadioGroup} component and its `displayName`. */
interface RadioGroupComponent {
  (props: RadioGroupProps): ReactElement;
  displayName: string;
}

/**
 * The cocokits RadioGroup. It renders the base group and supplies `size`, `color` and `labelPosition` to it, which
 * render the `data-*` attributes on the root. The options exist to be inherited: a `Radio` that sets none of its own
 * takes the one of its group. Each option resolves in order: the prop, then the `ThemeProvider` override, then the
 * config default (none); `null` removes the attribute. The theme needs a `ThemeProvider`.
 *
 * @example
 * <RadioGroup size="lg" color="success" aria-label="Plan">
 *   <Radio value="free">Free</Radio>
 *   <Radio value="pro">Pro</Radio>
 * </RadioGroup>
 * @cckPart root
 */
export const RadioGroup: RadioGroupComponent = Object.assign(ThemedRadioGroup, { displayName: 'RadioGroup' });
