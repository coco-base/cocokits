import { screen } from '@testing-library/react';
import { StrictMode, type ReactElement } from 'react';
import {
  Accordion,
  type AccordionChangeDetails,
  type AccordionRootProps,
  type AccordionSingleRootProps,
} from '../index';

/** Props of the {@link Example}: the Root props with an optional `type` and loose value types, plus the extras. */
export type ExampleProps = Partial<
  Omit<AccordionSingleRootProps, 'type' | 'value' | 'defaultValue' | 'onValueChange'>
> & {
  readonly type?: 'single' | 'multiple';
  readonly value?: string | readonly string[];
  readonly defaultValue?: string | readonly string[];
  readonly onValueChange?: (value: never, details: AccordionChangeDetails) => void;
  readonly lockReturns?: boolean;
  readonly forceMountWarranty?: boolean;
};

/** Three items between two buttons of the page; Shipping holds a link, Returns can be disabled. */
export function Example({
  type = 'single',
  lockReturns = false,
  forceMountWarranty = false,
  ...root
}: ExampleProps): ReactElement {
  return (
    <StrictMode>
      <button>before</button>
      <Accordion.Root {...({ type, ...root } as AccordionRootProps)}>
        <Accordion.Item value="shipping">
          <Accordion.Header>
            <Accordion.Trigger>Shipping</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content>
            Orders leave in two days. <a href="#shipping-rates">Shipping rates</a>
          </Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="returns" disabled={lockReturns}>
          <Accordion.Header>
            <Accordion.Trigger>Returns</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content>Send it back within 30 days.</Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="warranty">
          <Accordion.Header>
            <Accordion.Trigger>Warranty</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content forceMount={forceMountWarranty}>Two years.</Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
      <button>after</button>
    </StrictMode>
  );
}

/** A running CSS animation of 300 ms as `getAnimations()` returns it: the exit animation presence waits for. */
export function cssAnimation(finished: Promise<unknown>): Animation {
  return {
    finished,
    animationName: 'exit',
    playState: 'running',
    effect: { getComputedTiming: () => ({ endTime: 300 }) },
  } as unknown as Animation;
}

/** The trigger button with the accessible name. */
export const trigger = (name: string): HTMLElement => screen.getByRole('button', { name });

/** The region of the item with the accessible name, or null while its content is not rendered. */
export const region = (name: string): HTMLElement | null => screen.queryByRole('region', { name });

/** Whether the item with the accessible name is expanded. */
export const isOpen = (name: string): boolean => trigger(name).getAttribute('aria-expanded') === 'true';

/** The names of the expanded items. */
export const openNames = (): string[] =>
  ['Shipping', 'Returns', 'Warranty'].filter((name) => trigger(name).getAttribute('aria-expanded') === 'true');
