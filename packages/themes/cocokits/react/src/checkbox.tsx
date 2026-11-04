'use client';

import type { ReactElement } from 'react';
import { Checkbox as BaseCheckbox, type CheckboxProps as BaseCheckboxProps } from '@cocokits/react/checkbox';
import { ThemeOptionsProvider } from '@cocokits/react-core';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';

type CheckboxOptions = CocokitsThemeConfig['components']['checkbox'];

/** The `size` values of the cocokits theme. */
export type CheckboxSize = CheckboxOptions['size']['values'][number];
/** The `color` values of the cocokits theme. */
export type CheckboxColor = CheckboxOptions['color']['values'][number];
/** The `labelPosition` values of the cocokits theme. */
export type CheckboxLabelPosition = CheckboxOptions['labelPosition']['values'][number];

/** Props of the themed {@link Checkbox}: the base props plus the three cocokits options. */
export interface CheckboxProps extends BaseCheckboxProps {
  /**
   * Size of the box and its label text.
   */
  readonly size?: CheckboxSize | null | undefined;
  /**
   * Color family of the checked state, rendered as `data-cck-color`.
   */
  readonly color?: CheckboxColor | null | undefined;
  /**
   * Whether the label follows the box or precedes it, in the writing direction.
   */
  readonly labelPosition?: CheckboxLabelPosition | null | undefined;
}

function ThemedCheckbox({ size, color, labelPosition, ...props }: CheckboxProps): ReactElement {
  return (
    <ThemeOptionsProvider componentName="checkbox" options={{ size, color, labelPosition }}>
      <BaseCheckbox {...props} />
    </ThemeOptionsProvider>
  );
}

/** The themed {@link Checkbox} component and its `displayName`. */
interface CheckboxComponent {
  (props: CheckboxProps): ReactElement;
  displayName: string;
}

/**
 * The cocokits Checkbox. It renders the base Checkbox and supplies `size`, `color` and `labelPosition` to it,
 * which renders the `data-*` attributes on the root. Each option resolves in order: the prop, then the
 * `ThemeProvider` override, then the config default; `null` removes the attribute. The theme needs a
 * `ThemeProvider`.
 *
 * @example
 * <Checkbox size="lg" color="success" labelPosition="before">Label</Checkbox>
 * @cckPart root
 */
export const Checkbox: CheckboxComponent = Object.assign(ThemedCheckbox, { displayName: 'Checkbox' });
