// @vitest-environment jsdom
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState, type ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Accordion } from '../index';
import { cssAnimation, Example, region, trigger } from './fixtures';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  Reflect.deleteProperty(HTMLElement.prototype, 'getAnimations');
  Reflect.deleteProperty(HTMLElement.prototype, 'scrollHeight');
  Reflect.deleteProperty(HTMLElement.prototype, 'scrollWidth');
});

describe('Accordion closed content', () => {
  it('does not render closed content and renders it when the item opens', async () => {
    render(<Example />);
    expect(region('Shipping')).toBeNull();
    expect(screen.queryByText(/Orders leave/)).toBeNull();
    await userEvent.click(trigger('Shipping'));
    expect(region('Shipping')).not.toBeNull();
  });

  it('keeps the element and its children with forceMount, hidden while closed', async () => {
    render(<Example forceMountWarranty />);
    const content = document.getElementById(trigger('Warranty').getAttribute('aria-controls') ?? '');
    expect(content?.hasAttribute('hidden')).toBe(true);
    expect(content?.getAttribute('data-state')).toBe('closed');
    expect(content?.textContent).toBe('Two years.');
    expect(content?.getAttribute('role')).toBe('region');
    await userEvent.click(trigger('Warranty'));
    expect(content?.hasAttribute('hidden')).toBe(false);
    expect(content?.getAttribute('data-state')).toBe('open');
    await userEvent.click(trigger('Returns'));
    await waitFor(() => {
      expect(content?.hasAttribute('hidden')).toBe(true);
    });
  });

  it('points aria-controls at the content only while the element is in the document', async () => {
    render(<Example />);
    expect(trigger('Shipping').hasAttribute('aria-controls')).toBe(false);
    await userEvent.click(trigger('Shipping'));
    expect(trigger('Shipping').getAttribute('aria-controls')).toBe(region('Shipping')?.id);
    await userEvent.click(trigger('Returns'));
    expect(trigger('Shipping').hasAttribute('aria-controls')).toBe(false);
  });
});

describe('Accordion focus when content closes', () => {
  function Closable(): ReactElement {
    const [value, setValue] = useState('shipping');
    return (
      <>
        <button
          onClick={() => {
            setValue('');
          }}
        >
          close from outside
        </button>
        <button
          onClick={() => {
            setValue('returns');
          }}
        >
          open returns
        </button>
        <Accordion.Root type="single" value={value} onValueChange={setValue}>
          <Accordion.Item value="shipping">
            <Accordion.Header>
              <Accordion.Trigger>Shipping</Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content>
              <a href="#rates">Shipping rates</a>
            </Accordion.Content>
          </Accordion.Item>
          <Accordion.Item value="returns" disabled>
            <Accordion.Header>
              <Accordion.Trigger>Returns</Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content>
              <a href="#policy">Policy</a>
            </Accordion.Content>
          </Accordion.Item>
          <Accordion.Item value="warranty">
            <Accordion.Header>
              <Accordion.Trigger>Warranty</Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content>Two years.</Accordion.Content>
          </Accordion.Item>
        </Accordion.Root>
      </>
    );
  }

  it('refocuses the trigger before the content is removed when focus is inside the closing content', async () => {
    const onFocusOrder: string[] = [];
    render(<Closable />);
    const link = screen.getByRole('link', { name: 'Shipping rates' });
    trigger('Shipping').addEventListener('focus', () =>
      onFocusOrder.push(link.isConnected ? 'before-removal' : 'after'),
    );
    link.focus();
    // A parent write while focus sits inside the content.
    await act(async () => {
      screen
        .getByRole('button', { name: 'close from outside' })
        .dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await Promise.resolve();
    });
    expect(document.activeElement).toBe(trigger('Shipping'));
    expect(onFocusOrder).toEqual(['before-removal']);
  });

  it('falls back to the next enabled trigger when the trigger of the closing item is disabled', async () => {
    function Locked(): ReactElement {
      const [value, setValue] = useState('returns');
      return (
        <>
          <button
            onClick={() => {
              setValue('');
            }}
          >
            close
          </button>
          <Accordion.Root type="single" value={value}>
            <Accordion.Item value="shipping">
              <Accordion.Header>
                <Accordion.Trigger>Shipping</Accordion.Trigger>
              </Accordion.Header>
            </Accordion.Item>
            <Accordion.Item value="returns" disabled>
              <Accordion.Header>
                <Accordion.Trigger>Returns</Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content>
                <a href="#policy">Policy</a>
              </Accordion.Content>
            </Accordion.Item>
            <Accordion.Item value="warranty">
              <Accordion.Header>
                <Accordion.Trigger>Warranty</Accordion.Trigger>
              </Accordion.Header>
            </Accordion.Item>
          </Accordion.Root>
        </>
      );
    }
    render(<Locked />);
    screen.getByRole('link', { name: 'Policy' }).focus();
    await act(async () => {
      screen.getByRole('button', { name: 'close' }).dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await Promise.resolve();
    });
    expect(document.activeElement).toBe(trigger('Warranty'));
  });

  it('never moves focus when an item opens', async () => {
    render(<Closable />);
    const outside = screen.getByRole('button', { name: 'open returns' });
    outside.focus();
    await userEvent.click(outside);
    expect(document.activeElement).toBe(outside);
  });

  it('keeps focus on the trigger after a click closes its item', async () => {
    render(<Example collapsible defaultValue="shipping" />);
    await userEvent.click(trigger('Shipping'));
    expect(document.activeElement).toBe(trigger('Shipping'));
  });
});

describe('Accordion animation and size', () => {
  it('writes no size variable on the first render and writes them when the item opens after mount', async () => {
    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', { value: 120, configurable: true });
    Object.defineProperty(HTMLElement.prototype, 'scrollWidth', { value: 300, configurable: true });
    render(<Example defaultValue="shipping" />);
    const first = region('Shipping');
    expect(first?.style.getPropertyValue('--accordion-content-height')).toBe('');
    await userEvent.click(trigger('Returns'));
    const opened = region('Returns');
    expect(opened?.style.getPropertyValue('--accordion-content-height')).toBe('120px');
    expect(opened?.style.getPropertyValue('--accordion-content-width')).toBe('300px');
  });

  it('writes the size while the content is still shown when it closes', async () => {
    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', { value: 80, configurable: true });
    render(<Example collapsible defaultValue="shipping" />);
    const content = region('Shipping');
    let finish: () => void = () => undefined;
    const finished = new Promise<void>((resolve) => {
      finish = resolve;
    });
    Object.defineProperty(content, 'getAnimations', { value: () => [cssAnimation(finished)], configurable: true });
    await userEvent.click(trigger('Shipping'));
    expect(content?.style.getPropertyValue('--accordion-content-height')).toBe('80px');
    expect(content?.isConnected).toBe(true);
    expect(content?.getAttribute('data-state')).toBe('closed');
    expect(content?.hasAttribute('hidden')).toBe(false);
    expect(trigger('Shipping').getAttribute('aria-controls')).toBe(content?.id);
    finish();
    await waitFor(() => {
      expect(content?.isConnected).toBe(false);
    });
    expect(trigger('Shipping').hasAttribute('aria-controls')).toBe(false);
  });

  it('keeps force-mounted content shown until the exit animation has finished, then hides it', async () => {
    render(<Example type="multiple" forceMountWarranty defaultValue={['warranty']} />);
    const content = region('Warranty');
    let finish: () => void = () => undefined;
    const finished = new Promise<void>((resolve) => {
      finish = resolve;
    });
    Object.defineProperty(content, 'getAnimations', { value: () => [cssAnimation(finished)], configurable: true });
    await userEvent.click(trigger('Warranty'));
    expect(content?.hasAttribute('hidden')).toBe(false);
    finish();
    await waitFor(() => {
      expect(content?.hasAttribute('hidden')).toBe(true);
    });
  });

  it('cancels a running close when the item opens again', async () => {
    render(<Example type="multiple" defaultValue={['shipping']} />);
    const content = region('Shipping');
    const finished = new Promise<void>(() => undefined);
    Object.defineProperty(content, 'getAnimations', { value: () => [cssAnimation(finished)], configurable: true });
    await userEvent.click(trigger('Shipping'));
    expect(content?.isConnected).toBe(true);
    await userEvent.click(trigger('Shipping'));
    expect(content?.isConnected).toBe(true);
    expect(content?.getAttribute('data-state')).toBe('open');
  });

  it('removes the content at once when nothing animates', async () => {
    render(<Example collapsible defaultValue="shipping" />);
    await userEvent.click(trigger('Shipping'));
    expect(region('Shipping')).toBeNull();
  });
});
