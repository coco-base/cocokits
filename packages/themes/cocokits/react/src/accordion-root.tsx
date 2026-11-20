'use client';

import type { ReactElement } from 'react';
import {
  Accordion as BaseAccordion,
  type AccordionRootProps as BaseAccordionRootProps,
} from '@cocokits/react/accordion';
import { ThemeOptionsProvider } from '@cocokits/react-core';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';

type AccordionOptions = CocokitsThemeConfig['components']['accordion'];

/** The `variant` values of the cocokits theme. */
export type AccordionVariant = AccordionOptions['variant']['values'][number];
/** The `size` values of the cocokits theme. */
export type AccordionSize = AccordionOptions['size']['values'][number];
/** The `togglePosition` values of the cocokits theme. */
export type AccordionTogglePosition = AccordionOptions['togglePosition']['values'][number];
/** The `hideToggle` values of the cocokits theme. */
export type AccordionHideToggle = AccordionOptions['hideToggle']['values'][number];

/** The four cocokits options of the themed {@link Accordion.Root}. */
interface AccordionThemeProps {
  /**
   * Look of the sections: separate bordered items, one bordered group, or no chrome.
   */
  readonly variant?: AccordionVariant | null | undefined;
  /**
   * Height, padding and text of the triggers.
   */
  readonly size?: AccordionSize | null | undefined;
  /**
   * Whether the chevron follows the label or precedes it, in the writing direction.
   */
  readonly togglePosition?: AccordionTogglePosition | null | undefined;
  /**
   * Hides the chevron.
   */
  readonly hideToggle?: AccordionHideToggle | null | undefined;
}

/**
 * Props of the themed {@link Accordion.Root}: the base props (`type="single"` or `type="multiple"`) plus the four
 * cocokits options.
 */
export type AccordionRootProps = BaseAccordionRootProps & AccordionThemeProps;

function ThemedAccordionRoot({
  variant,
  size,
  togglePosition,
  hideToggle,
  ...props
}: AccordionRootProps): ReactElement {
  return (
    <ThemeOptionsProvider componentName="accordion" options={{ variant, size, togglePosition, hideToggle }}>
      <BaseAccordion.Root {...props} />
    </ThemeOptionsProvider>
  );
}

/** The themed {@link Accordion.Root} component and its `displayName`. */
export interface AccordionRootComponent {
  (props: AccordionRootProps): ReactElement | null;
  displayName: string;
}

/**
 * The cocokits Accordion root. It renders the base Accordion root and supplies `variant`, `size`, `togglePosition` and
 * `hideToggle` to it, which renders the `data-*` attributes on the root. Each option resolves in order: the prop, then
 * the `ThemeProvider` override, then the config default; `null` removes the attribute. The theme needs a
 * `ThemeProvider`.
 *
 * @example
 * <Accordion.Root type="single" collapsible variant="group" size="sm" togglePosition="before">
 *   <Accordion.Item value="shipping">
 *     <Accordion.Header>
 *       <Accordion.Trigger>Shipping</Accordion.Trigger>
 *     </Accordion.Header>
 *     <Accordion.Content>Orders leave in two days.</Accordion.Content>
 *   </Accordion.Item>
 * </Accordion.Root>
 * @cckPart root
 */
export const AccordionRoot: AccordionRootComponent = Object.assign(ThemedAccordionRoot, {
  displayName: 'Accordion.Root',
});
