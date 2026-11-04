// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState, type ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { accordionMeta } from '@cocokits/machines/accordion';
import { Example } from './fixtures';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  Reflect.deleteProperty(HTMLElement.prototype, 'getAnimations');
  Reflect.deleteProperty(HTMLElement.prototype, 'scrollHeight');
  Reflect.deleteProperty(HTMLElement.prototype, 'scrollWidth');
});

const trigger = (name: string): HTMLElement => screen.getByRole('button', { name });
const region = (name: string): HTMLElement | null => screen.queryByRole('region', { name });
const isOpen = (name: string): boolean => trigger(name).getAttribute('aria-expanded') === 'true';
const openNames = (): string[] =>
  ['Shipping', 'Returns', 'Warranty'].filter((name) => trigger(name).getAttribute('aria-expanded') === 'true');

describe('Accordion rendered contract', () => {
  it('renders root > item > header > trigger and content with the fixed classes, elements and data attributes', () => {
    const { container } = render(<Example defaultValue="shipping" />);
    const root = container.querySelector('.cck-accordion');
    expect(root?.tagName).toBe('DIV');
    expect(root?.getAttribute('data-orientation')).toBe('vertical');
    expect(root?.hasAttribute('data-disabled')).toBe(false);
    const items = container.querySelectorAll('.cck-accordion__item');
    expect(items).toHaveLength(3);
    expect(items[0].tagName).toBe('DIV');
    expect(items[0].getAttribute('data-state')).toBe('open');
    expect(items[1].getAttribute('data-state')).toBe('closed');
    const header = items[0].children[0];
    expect(header.tagName).toBe('H3');
    expect(header.className).toBe('cck-accordion__header');
    expect(header.children).toHaveLength(1);
    const button = trigger('Shipping');
    expect(button.parentElement).toBe(header);
    expect(button.tagName).toBe('BUTTON');
    expect(button.className).toBe('cck-accordion__trigger');
    expect(button.getAttribute('type')).toBe('button');
    expect(button.getAttribute('data-state')).toBe('open');
    expect(button.getAttribute('data-orientation')).toBe('vertical');
    const content = region('Shipping');
    expect(content?.tagName).toBe('DIV');
    expect(content?.className).toBe('cck-accordion__content');
    expect(content?.parentElement).toBe(items[0]);
    expect(content?.getAttribute('data-state')).toBe('open');
  });

  it('links trigger and content with generated ids that never come from the value', () => {
    render(<Example defaultValue="shipping" />);
    const button = trigger('Shipping');
    const content = region('Shipping');
    expect(button.id).toMatch(/-trigger$/);
    expect(content?.id).toBe(button.getAttribute('aria-controls'));
    expect(content?.id).toMatch(/-content$/);
    expect(content?.id.replace(/-content$/, '')).toBe(button.id.replace(/-trigger$/, ''));
    expect(button.id).not.toContain('shipping');
    expect(content?.getAttribute('aria-labelledby')).toBe(button.id);
    expect(content?.getAttribute('role')).toBe('region');
    expect(trigger('Returns').hasAttribute('aria-controls')).toBe(false);
  });

  it('renders only the data attributes the meta declares', () => {
    const { container } = render(<Example defaultValue="shipping" lockReturns />);
    const declared = new Set(Object.values(accordionMeta.dataAttrs).flat());
    const found = new Set<string>();
    for (const element of container.querySelectorAll('[class*="cck-accordion"]')) {
      for (const name of element.getAttributeNames()) if (name.startsWith('data-')) found.add(name);
    }
    expect([...found].filter((name) => !declared.has(name))).toEqual([]);
  });
});

describe('Accordion single mode', () => {
  it('opens an item and closes the open one', async () => {
    render(<Example defaultValue="shipping" />);
    await userEvent.click(trigger('Returns'));
    expect(openNames()).toEqual(['Returns']);
    expect(region('Shipping')).toBeNull();
    expect(region('Returns')).not.toBeNull();
  });

  it('does not close the open item without collapsible, and marks it aria-disabled without disabling it', async () => {
    const onValueChange = vi.fn();
    render(<Example defaultValue="shipping" onValueChange={onValueChange} />);
    const button = trigger('Shipping');
    expect(button.getAttribute('aria-disabled')).toBe('true');
    expect(button.hasAttribute('disabled')).toBe(false);
    expect(button.hasAttribute('data-disabled')).toBe(false);
    await userEvent.click(button);
    expect(isOpen('Shipping')).toBe(true);
    expect(onValueChange).not.toHaveBeenCalled();
    expect(trigger('Returns').hasAttribute('aria-disabled')).toBe(false);
  });

  it('closes the open item with collapsible and reports the empty string', async () => {
    const onValueChange = vi.fn();
    render(<Example collapsible defaultValue="shipping" onValueChange={onValueChange} />);
    expect(trigger('Shipping').hasAttribute('aria-disabled')).toBe(false);
    await userEvent.click(trigger('Shipping'));
    expect(openNames()).toEqual([]);
    expect(onValueChange).toHaveBeenCalledWith('', expect.objectContaining({ reason: 'user' }));
  });

  it('reports the new value with the reason and the event', async () => {
    const onValueChange = vi.fn();
    render(<Example onValueChange={onValueChange} />);
    await userEvent.click(trigger('Warranty'));
    expect(onValueChange).toHaveBeenCalledTimes(1);
    const [value, details] = onValueChange.mock.calls[0] as [string, { reason: string; event: Event }];
    expect(value).toBe('warranty');
    expect(details.reason).toBe('user');
    expect(details.event.type).toBe('click');
  });

  it('toggles with Enter and Space', async () => {
    render(<Example collapsible />);
    trigger('Shipping').focus();
    await userEvent.keyboard('{Enter}');
    expect(isOpen('Shipping')).toBe(true);
    await userEvent.keyboard(' ');
    expect(isOpen('Shipping')).toBe(false);
  });
});

describe('Accordion multiple mode', () => {
  it('toggles each item on its own and reports the array', async () => {
    const onValueChange = vi.fn();
    render(<Example type="multiple" onValueChange={onValueChange} />);
    await userEvent.click(trigger('Shipping'));
    await userEvent.click(trigger('Warranty'));
    expect(openNames()).toEqual(['Shipping', 'Warranty']);
    expect(onValueChange).toHaveBeenLastCalledWith(
      ['shipping', 'warranty'],
      expect.objectContaining({ reason: 'user' }),
    );
    await userEvent.click(trigger('Shipping'));
    expect(openNames()).toEqual(['Warranty']);
    expect(onValueChange).toHaveBeenLastCalledWith(['warranty'], expect.objectContaining({ reason: 'user' }));
    expect(trigger('Warranty').hasAttribute('aria-disabled')).toBe(false);
  });

  it('starts from defaultValue', () => {
    render(<Example type="multiple" defaultValue={['shipping', 'returns']} />);
    expect(openNames()).toEqual(['Shipping', 'Returns']);
  });
});

describe('Accordion controlled and uncontrolled', () => {
  it('is controlled with value: the parent decides, and a parent write reports nothing', async () => {
    const onValueChange = vi.fn();
    function Controlled(): ReactElement {
      const [value, setValue] = useState('shipping');
      return (
        <>
          <button
            onClick={() => {
              setValue('warranty');
            }}
          >
            set
          </button>
          <Example value={value} onValueChange={onValueChange} />
        </>
      );
    }
    render(<Controlled />);
    await userEvent.click(trigger('Returns'));
    // The parent did not accept the change.
    expect(openNames()).toEqual(['Shipping']);
    expect(onValueChange).toHaveBeenCalledWith('returns', expect.anything());
    onValueChange.mockClear();
    await userEvent.click(screen.getByRole('button', { name: 'set' }));
    expect(openNames()).toEqual(['Warranty']);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('treats an empty string as controlled with nothing open', () => {
    render(<Example value="" />);
    expect(openNames()).toEqual([]);
  });

  it('is controlled with an array in multiple mode', async () => {
    const onValueChange = vi.fn();
    render(<Example type="multiple" value={['shipping']} onValueChange={onValueChange} />);
    await userEvent.click(trigger('Returns'));
    expect(onValueChange).toHaveBeenCalledWith(['shipping', 'returns'], expect.anything());
    expect(openNames()).toEqual(['Shipping']);
  });

  it('warns when value switches between controlled and uncontrolled', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { rerender } = render(<Example />);
    rerender(<Example value="shipping" />);
    expect(error).toHaveBeenCalledWith(expect.stringContaining('<Accordion.Root value>'));
  });
});

describe('Accordion disabled', () => {
  it('disables an item: native disabled, data-disabled, no toggle by click or Enter', async () => {
    const onValueChange = vi.fn();
    render(<Example lockReturns onValueChange={onValueChange} />);
    const button = trigger('Returns');
    expect(button.hasAttribute('disabled')).toBe(true);
    expect(button.hasAttribute('data-disabled')).toBe(true);
    expect(document.querySelectorAll('[data-disabled]')).toHaveLength(3);
    await userEvent.click(button);
    expect(onValueChange).not.toHaveBeenCalled();
    expect(openNames()).toEqual([]);
  });

  it('lets a controlled value open a disabled item', () => {
    render(<Example lockReturns value="returns" />);
    expect(isOpen('Returns')).toBe(true);
    expect(trigger('Returns').hasAttribute('aria-disabled')).toBe(false);
  });

  it('disables every item with the root disabled', async () => {
    const { container } = render(<Example disabled />);
    expect(container.querySelector('.cck-accordion')?.hasAttribute('data-disabled')).toBe(true);
    for (const name of ['Shipping', 'Returns', 'Warranty']) expect(trigger(name).hasAttribute('disabled')).toBe(true);
    await userEvent.click(trigger('Shipping'));
    expect(openNames()).toEqual([]);
  });
});
