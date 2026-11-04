// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Tabs } from '../index';
import { Example } from './fixtures';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const tab = (name: string): HTMLElement => screen.getByRole('tab', { name });

describe('Tabs.Content', () => {
  it('renders its element always and its children only while selected', async () => {
    const mounted = vi.fn();
    function Body(): null {
      mounted();
      return null;
    }
    render(
      <Tabs.Root defaultValue="a">
        <Tabs.List aria-label="x">
          <Tabs.Trigger value="a">A</Tabs.Trigger>
          <Tabs.Trigger value="b">B</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="a">a body</Tabs.Content>
        <Tabs.Content value="b">
          b body
          <Body />
        </Tabs.Content>
      </Tabs.Root>,
    );
    expect(document.querySelectorAll('[role="tabpanel"]')).toHaveLength(2);
    expect(screen.queryByText('b body')).toBeNull();
    expect(mounted).not.toHaveBeenCalled();
    await userEvent.click(tab('B'));
    expect(screen.getByText(/b body/)).toBeTruthy();
    expect(screen.queryByText('a body')).toBeNull();
    // The unselected panel element is still there, so the trigger's aria-controls resolves.
    expect(document.getElementById(tab('A').getAttribute('aria-controls') ?? '')).not.toBeNull();
  });

  it('keeps the children of a forceMount panel while it stays hidden', async () => {
    render(
      <Tabs.Root defaultValue="a">
        <Tabs.List aria-label="x">
          <Tabs.Trigger value="a">A</Tabs.Trigger>
          <Tabs.Trigger value="b">B</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="a" forceMount>
          a body
        </Tabs.Content>
        <Tabs.Content value="b" forceMount>
          b body
        </Tabs.Content>
      </Tabs.Root>,
    );
    const panelOf = (text: string): Element | null => screen.getByText(text).closest('[role="tabpanel"]');
    expect(panelOf('b body')?.hasAttribute('hidden')).toBe(true);
    await userEvent.click(tab('B'));
    expect(panelOf('b body')?.hasAttribute('hidden')).toBe(false);
    expect(panelOf('a body')?.hasAttribute('hidden')).toBe(true);
  });
});

describe('Tabs.List keys', () => {
  it('wraps by default', async () => {
    render(<Example defaultValue="notifications" />);
    tab('Notifications').focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(tab('Account'));
  });

  it('stops at the ends with loop={false}; Home and End still jump', async () => {
    const user = userEvent.setup();
    render(
      <Tabs.Root defaultValue="a">
        <Tabs.List aria-label="x" loop={false}>
          <Tabs.Trigger value="a">A</Tabs.Trigger>
          <Tabs.Trigger value="b">B</Tabs.Trigger>
          <Tabs.Trigger value="c">C</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="a">a</Tabs.Content>
      </Tabs.Root>,
    );
    tab('A').focus();
    await user.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(tab('A'));
    await user.keyboard('{End}');
    expect(document.activeElement).toBe(tab('C'));
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(tab('C'));
    await user.keyboard('{Home}');
    expect(document.activeElement).toBe(tab('A'));
  });

  it('moves focus without selecting in manual mode', async () => {
    render(<Example defaultValue="account" activationMode="manual" />);
    tab('Account').focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(tab('Password'));
    expect(tab('Account').getAttribute('aria-selected')).toBe('true');
  });

  it('skips a disabled tab', async () => {
    render(<Example defaultValue="account" lockPassword />);
    tab('Account').focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(tab('Notifications'));
  });
});

describe('Tabs.Indicator', () => {
  it('renders no indicator when the part is omitted', () => {
    const { container } = render(
      <Tabs.Root defaultValue="a">
        <Tabs.List aria-label="x">
          <Tabs.Trigger value="a">A</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="a">a</Tabs.Content>
      </Tabs.Root>,
    );
    expect(container.querySelector('.cck-tabs__indicator')).toBeNull();
  });

  it('renders through render and keeps the machine attributes', () => {
    const { container } = render(
      <Tabs.Root defaultValue="a">
        <Tabs.List aria-label="x">
          <Tabs.Trigger value="a">A</Tabs.Trigger>
          <Tabs.Indicator render={<i />} data-x="1" />
        </Tabs.List>
      </Tabs.Root>,
    );
    const indicator = container.querySelector('.cck-tabs__indicator');
    expect(indicator?.tagName).toBe('I');
    expect(indicator?.getAttribute('aria-hidden')).toBe('true');
    expect(indicator?.getAttribute('data-x')).toBe('1');
  });

  it('observes the list and every trigger', () => {
    const observed: Element[] = [];
    class FakeResizeObserver {
      observe = (element: Element): void => {
        observed.push(element);
      };
      unobserve = vi.fn();
      disconnect = vi.fn();
    }
    Object.defineProperty(window, 'ResizeObserver', { configurable: true, writable: true, value: FakeResizeObserver });
    render(<Example defaultValue="account" />);
    const roles = observed.map((element) => element.getAttribute('role'));
    expect(roles.filter((role) => role === 'tab')).toHaveLength(3);
    expect(roles).toContain('tablist');
    Reflect.deleteProperty(window, 'ResizeObserver');
  });
});

describe('scroll into view', () => {
  it('scrolls the list, not an ancestor, when the selection changes after the first render', async () => {
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(function (this: HTMLElement) {
      return this.getAttribute('role') === 'tablist' ? 150 : 0;
    });
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
      if (this.getAttribute('role') === 'tablist') return new DOMRect(0, 0, 150, 40);
      if (this.getAttribute('role') === 'tab') {
        const index = [...(this.parentElement?.querySelectorAll('[role="tab"]') ?? [])].indexOf(this);
        return new DOMRect(index * 100 - (this.parentElement?.scrollLeft ?? 0), 0, 100, 40);
      }
      return new DOMRect(0, 0, 0, 0);
    });
    const ancestorScroll = vi.fn();
    Object.defineProperty(Element.prototype, 'scrollIntoView', {
      configurable: true,
      writable: true,
      value: ancestorScroll,
    });
    render(<Example defaultValue="account" />);
    const list = screen.getByRole('tablist');
    expect(list.scrollLeft).toBe(0);
    await userEvent.click(tab('Notifications'));
    expect(list.scrollLeft).toBeGreaterThan(0);
    expect(ancestorScroll).not.toHaveBeenCalled();
    Reflect.deleteProperty(Element.prototype, 'scrollIntoView');
  });
});
