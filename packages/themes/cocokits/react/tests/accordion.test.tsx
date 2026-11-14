// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Accordion as BaseAccordion } from '@cocokits/react/accordion';
import { ThemeProvider } from '@cocokits/react-core';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { Accordion, type AccordionRootProps } from '../src/index';
import { themed } from './helpers';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const options = cocokitsThemeConfig.components.accordion;
const ATTRIBUTES = ['data-variant', 'data-size', 'data-toggle-position', 'data-hide-toggle'] as const;
const example = (props: Partial<AccordionRootProps> = {}): ReactElement => (
  <Accordion.Root type="single" collapsible {...(props as object)}>
    <Accordion.Item value="shipping">
      <Accordion.Header>
        <Accordion.Trigger>Shipping</Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Content>Orders leave in two days.</Accordion.Content>
    </Accordion.Item>
    <Accordion.Item value="returns" disabled>
      <Accordion.Header>
        <Accordion.Trigger>Returns</Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Content>Send it back within 30 days.</Accordion.Content>
    </Accordion.Item>
  </Accordion.Root>
);
const root = (container: HTMLElement): HTMLElement => {
  const element = container.querySelector<HTMLElement>('.cck-accordion');
  if (!element) throw new Error('no .cck-accordion');
  return element;
};

describe('theme accordion', () => {
  it('has a displayName on the themed root and shares the base parts', () => {
    expect(Accordion.Root.displayName).toBe('Accordion.Root');
    expect(Accordion.Item).toBe(BaseAccordion.Item);
    expect(Accordion.Header).toBe(BaseAccordion.Header);
    expect(Accordion.Trigger).toBe(BaseAccordion.Trigger);
    expect(Accordion.Content).toBe(BaseAccordion.Content);
  });

  it('renders the config defaults on the root', () => {
    const { container } = render(themed(example()));
    expect(root(container).getAttribute('data-variant')).toBe('default');
    expect(root(container).getAttribute('data-size')).toBe('md');
    expect(root(container).getAttribute('data-toggle-position')).toBe('after');
    expect(root(container).hasAttribute('data-hide-toggle')).toBe(false);
  });

  it.each([
    ['variant', 'data-variant'],
    ['size', 'data-size'],
    ['togglePosition', 'data-toggle-position'],
  ] as const)('moves %s to %s for every value', (option, attribute) => {
    for (const value of options[option].values) {
      const { container, unmount } = render(themed(example({ [option]: value })));
      expect(root(container).getAttribute(attribute)).toBe(value);
      unmount();
    }
  });

  it('renders data-hide-toggle only when hideToggle is true', () => {
    const on = render(themed(example({ hideToggle: true })));
    expect(root(on.container).getAttribute('data-hide-toggle')).toBe('');
    on.unmount();
    const off = render(themed(example({ hideToggle: false })));
    expect(root(off.container).hasAttribute('data-hide-toggle')).toBe(false);
  });

  it('renders the options on the root only', () => {
    const { container } = render(themed(example({ hideToggle: true })));
    for (const name of ATTRIBUTES) expect(container.querySelectorAll(`[${name}]`)).toHaveLength(1);
  });

  it('removes an attribute with null', () => {
    const { container } = render(themed(example({ variant: null, size: null, togglePosition: null })));
    for (const name of ATTRIBUTES) expect(root(container).hasAttribute(name)).toBe(false);
  });

  it('lets a provider override win over the default, and the own prop over the override', () => {
    const { container } = render(
      <ThemeProvider
        themeConfig={cocokitsThemeConfig}
        overrides={{ accordion: { variant: 'group', size: 'sm', hideToggle: true } }}
      >
        {example({ size: 'md' })}
      </ThemeProvider>,
    );
    expect(root(container).getAttribute('data-variant')).toBe('group');
    expect(root(container).getAttribute('data-size')).toBe('md');
    expect(root(container).getAttribute('data-hide-toggle')).toBe('');
  });

  it('renders no theme attribute without a provider', () => {
    const { container } = render(example());
    for (const name of ATTRIBUTES) expect(root(container).hasAttribute(name)).toBe(false);
  });

  it('keeps the base behaviour: the multiple type, a disabled item and the change callback', async () => {
    const onValueChange = vi.fn();
    render(
      themed(
        <Accordion.Root type="multiple" onValueChange={onValueChange} variant="group">
          <Accordion.Item value="shipping">
            <Accordion.Header>
              <Accordion.Trigger>Shipping</Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content>Orders leave in two days.</Accordion.Content>
          </Accordion.Item>
          <Accordion.Item value="returns" disabled>
            <Accordion.Header>
              <Accordion.Trigger>Returns</Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content>Send it back within 30 days.</Accordion.Content>
          </Accordion.Item>
        </Accordion.Root>,
      ),
    );
    const shipping = screen.getByRole('button', { name: 'Shipping' });
    expect(shipping.getAttribute('aria-expanded')).toBe('false');
    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Returns' }).disabled).toBe(true);
    await userEvent.click(shipping);
    expect(onValueChange).toHaveBeenCalledWith(['shipping'], expect.objectContaining({ reason: 'user' }));
    expect(shipping.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByRole('region', { name: 'Shipping' }).textContent).toBe('Orders leave in two days.');
  });
});
