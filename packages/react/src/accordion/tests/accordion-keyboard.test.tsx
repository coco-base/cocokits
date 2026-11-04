// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StrictMode, type ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DirectionProvider } from '@cocokits/react-core';
import { Accordion } from '../index';
import { Example } from './fixtures';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  Reflect.deleteProperty(HTMLElement.prototype, 'getAnimations');
  Reflect.deleteProperty(HTMLElement.prototype, 'scrollHeight');
  Reflect.deleteProperty(HTMLElement.prototype, 'scrollWidth');
});

const trigger = (name: string): HTMLElement => screen.getByRole('button', { name });
const isOpen = (name: string): boolean => trigger(name).getAttribute('aria-expanded') === 'true';
const openNames = (): string[] =>
  ['Shipping', 'Returns', 'Warranty'].filter((name) => trigger(name).getAttribute('aria-expanded') === 'true');

describe('Accordion keyboard', () => {
  it('moves with ArrowDown and ArrowUp between the enabled triggers, wrapping, and never toggles', async () => {
    render(<Example lockReturns />);
    trigger('Shipping').focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(trigger('Warranty'));
    await userEvent.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(trigger('Shipping'));
    await userEvent.keyboard('{ArrowUp}');
    expect(document.activeElement).toBe(trigger('Warranty'));
    expect(openNames()).toEqual([]);
  });

  it('moves to the first and last enabled trigger with Home and End', async () => {
    render(<Example />);
    trigger('Returns').focus();
    await userEvent.keyboard('{End}');
    expect(document.activeElement).toBe(trigger('Warranty'));
    await userEvent.keyboard('{Home}');
    expect(document.activeElement).toBe(trigger('Shipping'));
  });

  it('ignores the horizontal arrows when vertical, and the vertical ones when horizontal', async () => {
    const { rerender } = render(<Example />);
    trigger('Shipping').focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(trigger('Shipping'));
    rerender(<Example orientation="horizontal" />);
    await userEvent.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(trigger('Shipping'));
    await userEvent.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(trigger('Returns'));
  });

  it('flips the horizontal arrows in rtl, from dir and from a DirectionProvider', async () => {
    const { rerender } = render(<Example orientation="horizontal" dir="rtl" />);
    trigger('Shipping').focus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(trigger('Returns'));
    rerender(
      <DirectionProvider dir="rtl">
        <Example orientation="horizontal" />
      </DirectionProvider>,
    );
    trigger('Shipping').focus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(trigger('Returns'));
  });

  it('keeps the vertical arrows unflipped in rtl', async () => {
    render(<Example dir="rtl" />);
    trigger('Shipping').focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(trigger('Returns'));
  });

  it('ignores a key with a modifier', async () => {
    render(<Example />);
    trigger('Shipping').focus();
    await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}');
    expect(document.activeElement).toBe(trigger('Shipping'));
  });

  it('keeps every enabled trigger in the Tab order and skips a disabled one', async () => {
    render(<Example lockReturns />);
    screen.getByRole('button', { name: 'before' }).focus();
    await userEvent.tab();
    expect(document.activeElement).toBe(trigger('Shipping'));
    await userEvent.tab();
    expect(document.activeElement).toBe(trigger('Warranty'));
  });

  it('marks the keyboard-focused trigger with data-focus-visible', async () => {
    render(<Example />);
    await userEvent.tab();
    await userEvent.tab();
    expect(trigger('Shipping').hasAttribute('data-focus-visible')).toBe(true);
    await userEvent.keyboard('{ArrowDown}');
    expect(trigger('Shipping').hasAttribute('data-focus-visible')).toBe(false);
    expect(trigger('Returns').hasAttribute('data-focus-visible')).toBe(true);
  });
});

describe('Accordion nested', () => {
  function Nested(): ReactElement {
    return (
      <StrictMode>
        <Accordion.Root type="multiple" defaultValue={['outer-1']}>
          <Accordion.Item value="outer-1">
            <Accordion.Header>
              <Accordion.Trigger>Outer one</Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content>
              <Accordion.Root type="single" collapsible defaultValue="inner-1">
                <Accordion.Item value="inner-1">
                  <Accordion.Header>
                    <Accordion.Trigger>Inner one</Accordion.Trigger>
                  </Accordion.Header>
                  <Accordion.Content>Inner content one</Accordion.Content>
                </Accordion.Item>
                <Accordion.Item value="inner-2">
                  <Accordion.Header>
                    <Accordion.Trigger>Inner two</Accordion.Trigger>
                  </Accordion.Header>
                  <Accordion.Content>Inner content two</Accordion.Content>
                </Accordion.Item>
              </Accordion.Root>
            </Accordion.Content>
          </Accordion.Item>
          <Accordion.Item value="outer-2">
            <Accordion.Header>
              <Accordion.Trigger>Outer two</Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content>Outer content two</Accordion.Content>
          </Accordion.Item>
        </Accordion.Root>
      </StrictMode>
    );
  }

  it('keeps the arrow keys of each accordion on its own triggers', async () => {
    render(<Nested />);
    trigger('Outer one').focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(trigger('Outer two'));
    trigger('Inner one').focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(trigger('Inner two'));
    await userEvent.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(trigger('Inner one'));
    await userEvent.keyboard('{End}');
    expect(document.activeElement).toBe(trigger('Inner two'));
  });

  it('keeps the single mode of the inner accordion from closing the outer items', async () => {
    render(<Nested />);
    await userEvent.click(trigger('Inner two'));
    expect(isOpen('Inner two')).toBe(true);
    expect(isOpen('Inner one')).toBe(false);
    expect(isOpen('Outer one')).toBe(true);
    await userEvent.click(trigger('Outer two'));
    expect(isOpen('Outer one')).toBe(true);
    expect(isOpen('Outer two')).toBe(true);
  });
});
