// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, type ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Accordion } from '../index';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  Reflect.deleteProperty(HTMLElement.prototype, 'getAnimations');
  Reflect.deleteProperty(HTMLElement.prototype, 'scrollHeight');
  Reflect.deleteProperty(HTMLElement.prototype, 'scrollWidth');
});

describe('Accordion render, ref and native props', () => {
  it('reaches every element with ref', () => {
    const refs = {
      root: createRef<HTMLDivElement>(),
      item: createRef<HTMLDivElement>(),
      header: createRef<HTMLHeadingElement>(),
      trigger: createRef<HTMLButtonElement>(),
      content: createRef<HTMLDivElement>(),
    };
    render(
      <Accordion.Root type="single" defaultValue="a" ref={refs.root}>
        <Accordion.Item value="a" ref={refs.item}>
          <Accordion.Header ref={refs.header}>
            <Accordion.Trigger ref={refs.trigger}>A</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content ref={refs.content}>Body</Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>,
    );
    expect(refs.root.current?.className).toBe('cck-accordion');
    expect(refs.item.current?.className).toBe('cck-accordion__item');
    expect(refs.header.current?.className).toBe('cck-accordion__header');
    expect(refs.trigger.current?.className).toBe('cck-accordion__trigger');
    expect(refs.content.current?.className).toBe('cck-accordion__content');
  });

  it('picks the heading level with render and keeps the fixed class and props', () => {
    render(
      <Accordion.Root type="single" defaultValue="a">
        <Accordion.Item value="a">
          <Accordion.Header render={<h2 className="mine" />}>
            <Accordion.Trigger>A</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content>Body</Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>,
    );
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading.className).toBe('cck-accordion__header mine');
    expect(heading.getAttribute('data-state')).toBe('open');
  });

  it('gives the function form of render the merged props and the state', () => {
    const states: unknown[] = [];
    render(
      <Accordion.Root type="single" defaultValue="a">
        <Accordion.Item value="a">
          <Accordion.Header>
            <Accordion.Trigger
              render={(props, state) => {
                states.push(state);
                return <button {...props} />;
              }}
            >
              A
            </Accordion.Trigger>
          </Accordion.Header>
        </Accordion.Item>
      </Accordion.Root>,
    );
    expect(states[0]).toEqual({ open: true, disabled: false, orientation: 'vertical' });
    expect(screen.getByRole('button', { name: 'A' }).className).toBe('cck-accordion__trigger');
  });

  it('lets a consumer onClick veto the toggle with preventDefault', async () => {
    render(
      <Accordion.Root type="single">
        <Accordion.Item value="a">
          <Accordion.Header>
            <Accordion.Trigger
              onClick={(event) => {
                event.preventDefault();
              }}
            >
              A
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content>Body</Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'A' }));
    expect(screen.queryByRole('region')).toBeNull();
  });

  it('never lets a consumer replace the attributes that state the item', () => {
    render(
      <Accordion.Root type="single" defaultValue="a">
        <Accordion.Item value="a">
          <Accordion.Header>
            <Accordion.Trigger aria-expanded="false" id="mine" data-state="closed">
              A
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content role="note" hidden>
            Body
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>,
    );
    const button = screen.getByRole('button', { name: 'A' });
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(button.id).not.toBe('mine');
    expect(button.getAttribute('data-state')).toBe('open');
    expect(screen.getByRole('region').hasAttribute('hidden')).toBe(false);
  });

  it('renders another element with nativeButton={false}: role, tabindex, Enter and Space, aria-disabled when disabled', async () => {
    function NonNative({ disabled = false }: { readonly disabled?: boolean }): ReactElement {
      return (
        <Accordion.Root type="single" collapsible>
          <Accordion.Item value="a" disabled={disabled}>
            <Accordion.Header>
              <Accordion.Trigger nativeButton={false} render={<span />}>
                A
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content>Body</Accordion.Content>
          </Accordion.Item>
        </Accordion.Root>
      );
    }
    const { unmount } = render(<NonNative />);
    const span = screen.getByRole('button', { name: 'A' });
    expect(span.tagName).toBe('SPAN');
    expect(span.hasAttribute('type')).toBe(false);
    expect(span.getAttribute('tabindex')).toBe('0');
    span.focus();
    await userEvent.keyboard('{Enter}');
    expect(span.getAttribute('aria-expanded')).toBe('true');
    await userEvent.keyboard(' ');
    expect(span.getAttribute('aria-expanded')).toBe('false');
    unmount();
    render(<NonNative disabled />);
    const locked = screen.getByRole('button', { name: 'A' });
    expect(locked.getAttribute('aria-disabled')).toBe('true');
    expect(locked.getAttribute('tabindex')).toBe('-1');
    await userEvent.click(locked);
    expect(locked.getAttribute('aria-expanded')).toBe('false');
  });

  it('logs a CocoKits error when the element does not match nativeButton', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(
      <Accordion.Root type="single">
        <Accordion.Item value="a">
          <Accordion.Header>
            <Accordion.Trigger render={<span />}>A</Accordion.Trigger>
          </Accordion.Header>
        </Accordion.Item>
      </Accordion.Root>,
    );
    expect(error).toHaveBeenCalledWith(expect.stringContaining('CocoKits: <Accordion.Trigger>'));
  });

  it('throws a CocoKits error for a part outside its parent', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => render(<Accordion.Item value="a">x</Accordion.Item>)).toThrow(
      'CocoKits: <Accordion.Item> must be placed within <Accordion.Root>.',
    );
    expect(() =>
      render(
        <Accordion.Root type="single">
          <Accordion.Trigger>x</Accordion.Trigger>
        </Accordion.Root>,
      ),
    ).toThrow('CocoKits: <Accordion.Trigger> must be placed within <Accordion.Item>.');
  });
});
