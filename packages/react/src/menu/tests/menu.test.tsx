// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Menu } from '../index';
import { Example, expectFocus, ITEMS, item, menu, stubTopLayer, trigger } from './fixtures';

beforeEach(stubTopLayer);
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

const tabStops = (): (string | null)[] =>
  screen
    .getAllByRole('menuitem')
    .filter((element) => element.getAttribute('tabindex') === '0')
    .map((element) => element.textContent);

describe('Menu anatomy', () => {
  it('renders the root as no element and the closed trigger as a button with its ARIA', () => {
    const { container } = render(<Example />);
    expect(container.children).toHaveLength(3);
    const button = trigger();
    expect(button.tagName).toBe('BUTTON');
    expect(button.className).toBe('cck-menu__trigger');
    expect(button.getAttribute('type')).toBe('button');
    expect(button.getAttribute('aria-haspopup')).toBe('menu');
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(button.getAttribute('data-state')).toBe('closed');
    expect(button.hasAttribute('aria-controls')).toBe(false);
    expect(button.id).not.toBe('');
  });

  it('renders nothing while closed, and the content only in the overlay container while open', async () => {
    const { container } = render(<Example />);
    expect(menu()).toBeNull();
    expect(document.querySelector('.cck-menu__content')).toBeNull();
    await userEvent.click(trigger());
    const content = menu();
    expect(content?.tagName).toBe('DIV');
    expect(content?.className).toBe('cck-menu__content');
    expect(container.contains(content)).toBe(false);
    expect(content?.getAttribute('tabindex')).toBe('-1');
    expect(content?.getAttribute('aria-labelledby')).toBe(trigger().id);
    expect(content?.getAttribute('data-state')).toBe('open');
    expect(content?.getAttribute('data-side')).toBe('bottom');
    expect(content?.getAttribute('data-align')).toBe('start');
    expect(trigger().getAttribute('aria-controls')).toBe(content?.id);
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    expect(trigger().getAttribute('data-state')).toBe('open');
  });

  it('renders the items as divs with the role, class and disabled state', async () => {
    render(<Example />);
    await userEvent.click(trigger());
    for (const name of ITEMS) {
      const element = item(name);
      expect(element.tagName).toBe('DIV');
      expect(element.className).toBe('cck-menu__item');
    }
    expect(item('Move').getAttribute('aria-disabled')).toBe('true');
    expect(item('Move').hasAttribute('data-disabled')).toBe(true);
    expect(item('Edit').hasAttribute('aria-disabled')).toBe(false);
    expect(item('Edit').hasAttribute('data-disabled')).toBe(false);
    expect(screen.getByRole('separator')).toBeTruthy();
  });

  it('passes native attributes and the ref to each part', async () => {
    const triggerRef = createRef<HTMLButtonElement>();
    const contentRef = createRef<HTMLDivElement>();
    const itemRef = createRef<HTMLDivElement>();
    render(
      <Menu.Root defaultOpen>
        <Menu.Trigger ref={triggerRef} data-test="t" className="mine">
          Actions
        </Menu.Trigger>
        <Menu.Content ref={contentRef} data-test="c" className="mine">
          <Menu.Item ref={itemRef} data-test="i" className="mine">
            Edit
          </Menu.Item>
        </Menu.Content>
      </Menu.Root>,
    );
    await waitFor(() => {
      expect(menu()).not.toBeNull();
    });
    expect(triggerRef.current).toBe(trigger());
    expect(contentRef.current).toBe(menu());
    expect(itemRef.current).toBe(item('Edit'));
    for (const element of [trigger(), menu(), item('Edit')]) {
      expect(element?.getAttribute('data-test')).not.toBeNull();
      expect(element?.className).toContain('mine');
    }
  });

  it('gives the author name of the content priority over the trigger', async () => {
    render(<Example content={{ 'aria-label': 'Row actions' }} />);
    await userEvent.click(trigger());
    expect(menu()?.getAttribute('aria-label')).toBe('Row actions');
    expect(menu()?.hasAttribute('aria-labelledby')).toBe(false);
  });

  it('gives the render function the state of the content', async () => {
    render(
      <Menu.Root defaultOpen>
        <Menu.Trigger>Actions</Menu.Trigger>
        <Menu.Content render={(props, state) => <section {...props} data-seen={`${state.side}-${state.align}`} />} />
      </Menu.Root>,
    );
    await waitFor(() => {
      expect(menu()).not.toBeNull();
    });
    expect(menu()?.tagName).toBe('SECTION');
    expect(menu()?.getAttribute('data-seen')).toBe('bottom-start');
  });
});

describe('Menu roving tab stop', () => {
  it('gives tabindex 0 to exactly one item and moves it with focus from keys and pointer', async () => {
    render(<Example />);
    await userEvent.click(trigger());
    await expectFocus(item('Edit'));
    expect(tabStops()).toEqual(['Edit']);
    await userEvent.keyboard('{ArrowDown}');
    expect(tabStops()).toEqual(['Duplicate']);
    await userEvent.click(item('Move'));
    expect(tabStops()).toEqual(['Move']);
  });

  it('follows a focus set by script', async () => {
    render(<Example />);
    await userEvent.click(trigger());
    await expectFocus(item('Edit'));
    item('Duplicate').focus();
    await waitFor(() => {
      expect(tabStops()).toEqual(['Duplicate']);
    });
  });

  it('falls back to the first item when the active one is removed', async () => {
    const { rerender } = render(<Example />);
    await userEvent.click(trigger());
    await expectFocus(item('Edit'));
    await userEvent.keyboard('{ArrowDown}');
    expect(tabStops()).toEqual(['Duplicate']);
    rerender(<Example items={['Edit', 'Move', 'Delete']} />);
    await waitFor(() => {
      expect(tabStops()).toEqual(['Edit']);
    });
  });
});
