// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DirectionProvider } from '@cocokits/react-core';
import { TabNav } from '../index';
import { PanelExample } from './panel-fixtures';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

const link = (name: string): HTMLElement => screen.getByRole('tab', { name });
const stops = (): string[] =>
  screen
    .getAllByRole('tab')
    .filter((element) => element.tabIndex === 0)
    .map((element) => element.textContent);
const panel = (): HTMLElement => screen.getByRole('tabpanel');

describe('TabNav panel mode', () => {
  it('renders the tab roles with one stop and a labelled panel', () => {
    render(<PanelExample active="settings" />);
    expect(screen.getByRole('tablist')).toBeTruthy();
    expect(stops()).toEqual(['Settings']);
    expect(link('Settings').getAttribute('aria-selected')).toBe('true');
    expect(link('Settings').hasAttribute('aria-current')).toBe(false);
    expect(link('Settings').getAttribute('aria-controls')).toBe(panel().id);
    expect(panel().getAttribute('aria-labelledby')).toBe(link('Settings').id);
    expect(panel().tabIndex).toBe(0);
  });

  it('moves the stop and the label: none, active, other, none', () => {
    const { rerender } = render(<PanelExample active={null} />);
    expect(stops()).toEqual(['Overview']);
    expect(panel().hasAttribute('aria-labelledby')).toBe(false);
    rerender(<PanelExample active="settings" />);
    expect(stops()).toEqual(['Settings']);
    expect(panel().getAttribute('aria-labelledby')).toBe(link('Settings').id);
    rerender(<PanelExample active="activity" />);
    expect(stops()).toEqual(['Activity']);
    expect(panel().getAttribute('aria-labelledby')).toBe(link('Activity').id);
    expect(link('Settings').hasAttribute('id')).toBe(false);
    rerender(<PanelExample active={null} />);
    expect(stops()).toEqual(['Overview']);
    expect(panel().hasAttribute('aria-labelledby')).toBe(false);
  });

  it('moves the stop off a first link that becomes disabled', () => {
    const { rerender } = render(<PanelExample active={null} />);
    expect(stops()).toEqual(['Overview']);
    rerender(<PanelExample active={null} lockOverview />);
    expect(stops()).toEqual(['Activity']);
    expect(link('Overview').getAttribute('aria-disabled')).toBe('true');
  });

  it('moves focus with the arrows, wrapping, without navigating', async () => {
    const user = userEvent.setup();
    const navigate = vi.fn((event: Event) => {
      event.preventDefault();
    });
    render(<PanelExample active="overview" />);
    document.addEventListener('click', navigate);
    link('Overview').focus();
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(link('Activity'));
    await user.keyboard('{End}');
    expect(document.activeElement).toBe(link('Settings'));
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(link('Overview'));
    await user.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(link('Settings'));
    await user.keyboard('{Home}');
    expect(document.activeElement).toBe(link('Overview'));
    expect(navigate).not.toHaveBeenCalled();
    expect(link('Overview').getAttribute('aria-selected')).toBe('true');
    document.removeEventListener('click', navigate);
  });

  it('skips a disabled link and flips the arrows in rtl', async () => {
    const user = userEvent.setup();
    render(
      <DirectionProvider dir="rtl">
        <PanelExample active="activity" lockOverview />
      </DirectionProvider>,
    );
    link('Activity').focus();
    await user.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(link('Settings'));
    await user.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(link('Activity'));
  });

  it('activates a link with Space and does not scroll the page', async () => {
    const user = userEvent.setup();
    const clicked = vi.fn((event: Event) => {
      event.preventDefault();
    });
    render(<PanelExample active="overview" />);
    document.addEventListener('click', clicked);
    link('Activity').focus();
    const space = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
    link('Activity').dispatchEvent(space);
    expect(space.defaultPrevented).toBe(true);
    expect(clicked).toHaveBeenCalledTimes(1);
    await user.keyboard('{Enter}');
    document.removeEventListener('click', clicked);
  });

  it('does not activate a disabled link with Space', () => {
    const clicked = vi.fn();
    render(<PanelExample active="activity" lockOverview />);
    document.addEventListener('click', clicked);
    const space = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
    link('Overview').dispatchEvent(space);
    expect(space.defaultPrevented).toBe(true);
    expect(clicked).not.toHaveBeenCalled();
    document.removeEventListener('click', clicked);
  });

  it('keeps a single stop when a link sits inside another component', () => {
    function Wrapped(): ReactElement {
      return (
        <TabNav.Link href="#c" active>
          C
        </TabNav.Link>
      );
    }
    const ui = (
      <TabNav.Root aria-label="x" tabPanel="p">
        <TabNav.List>
          <TabNav.Link href="#a">A</TabNav.Link>
          <TabNav.Link href="#b">B</TabNav.Link>
          <Wrapped />
        </TabNav.List>
      </TabNav.Root>
    );
    render(ui);
    expect(stops()).toEqual(['C']);
  });
});

describe('TabNav.Panel', () => {
  it('lets an author aria-labelledby win and warns in development when a label target is missing', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(
      <>
        <span id="mine">Mine</span>
        <TabNav.Panel id="p" aria-labelledby="mine">
          x
        </TabNav.Panel>
      </>,
    );
    expect(screen.getByRole('tabpanel').getAttribute('aria-labelledby')).toBe('mine');
    expect(warn).not.toHaveBeenCalled();
    cleanup();
    render(<TabNav.Panel id="p">x</TabNav.Panel>);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0]?.[0])).toContain('hasActiveLink');
  });

  it('renders no label and no warning with hasActiveLink={false}', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(
      <TabNav.Panel id="p" hasActiveLink={false}>
        x
      </TabNav.Panel>,
    );
    expect(screen.getByRole('tabpanel').hasAttribute('aria-labelledby')).toBe(false);
    expect(warn).not.toHaveBeenCalled();
  });

  it('hydrates the panel mode markup without a mismatch', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const container = document.body.appendChild(document.createElement('div'));
    container.innerHTML = renderToString(<PanelExample active="settings" />);
    const serverHtml = container.innerHTML;
    render(<PanelExample active="settings" />, { container, hydrate: true });
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    expect(container.innerHTML.replace(/ style="[^"]*"/g, '')).toBe(serverHtml);
    expect(stops()).toEqual(['Settings']);
  });

  it('hydrates with no active link and a disabled first link', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const container = document.body.appendChild(document.createElement('div'));
    container.innerHTML = renderToString(<PanelExample active={null} lockOverview />);
    render(<PanelExample active={null} lockOverview />, { container, hydrate: true });
    expect(error).not.toHaveBeenCalled();
    expect(stops()).toEqual(['Activity']);
  });
});

describe('TabNav parts', () => {
  it('renders the Root, List, Indicator and Panel through render', () => {
    const { container } = render(
      <TabNav.Root aria-label="x" render={<section />}>
        <TabNav.List render={<ul />}>
          <TabNav.Link href="#a" active>
            A
          </TabNav.Link>
          <TabNav.Indicator render={<i />} />
        </TabNav.List>
      </TabNav.Root>,
    );
    expect(container.querySelector('section.cck-tab-nav')).not.toBeNull();
    expect(container.querySelector('ul.cck-tab-nav__list')).not.toBeNull();
    expect(container.querySelector('i.cck-tab-nav__indicator')).not.toBeNull();
  });

  it('renders no indicator when the part is omitted and no tab roles without tabPanel', () => {
    const { container } = render(
      <TabNav.Root aria-label="x">
        <TabNav.List>
          <TabNav.Link href="#a" active>
            A
          </TabNav.Link>
        </TabNav.List>
      </TabNav.Root>,
    );
    expect(container.querySelector('.cck-tab-nav__indicator')).toBeNull();
    expect(container.querySelector('[role]')).toBeNull();
  });
});
