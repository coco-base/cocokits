// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { forwardRef, type AnchorHTMLAttributes } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TabNav } from '../index';
import { Example } from './fixtures';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('TabNav parts and classes', () => {
  it('renders a nav with a list, links and one decorative indicator, with the part classes', () => {
    const { container } = render(<Example />);
    const nav = screen.getByRole('navigation', { name: 'Project' });
    expect(nav.tagName).toBe('NAV');
    expect(nav.className).toBe('cck-tab-nav');
    const list = container.querySelector('.cck-tab-nav__list');
    expect(list?.tagName).toBe('DIV');
    expect(list?.parentElement).toBe(nav);
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(3);
    links.forEach((link) => {
      expect(link.tagName).toBe('A');
      expect(link.className).toBe('cck-tab-nav__link');
      expect(link.parentElement).toBe(list);
    });
    const indicators = container.querySelectorAll('.cck-tab-nav__indicator');
    expect(indicators).toHaveLength(1);
    expect(indicators[0].tagName).toBe('SPAN');
    expect(indicators[0].getAttribute('aria-hidden')).toBe('true');
  });

  it('has no tab roles', () => {
    const { container } = render(<Example />);
    expect(container.querySelector('[role]')).toBeNull();
  });

  it('merges a consumer class, passes native props and forwards refs', () => {
    const rootRef = { current: null as HTMLElement | null };
    const linkRef = { current: null as HTMLAnchorElement | null };
    render(
      <TabNav.Root aria-label="x" className="mine" data-test="r" ref={rootRef}>
        <TabNav.Link href="#a" className="own" ref={linkRef}>
          A
        </TabNav.Link>
      </TabNav.Root>,
    );
    expect(rootRef.current?.className).toBe('cck-tab-nav mine');
    expect(rootRef.current?.getAttribute('data-test')).toBe('r');
    expect(linkRef.current?.className).toBe('cck-tab-nav__link own');
  });

  it('throws a CocoKits error for a Link outside a Root', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => render(<TabNav.Link href="#a">A</TabNav.Link>)).toThrow(
      'CocoKits: <TabNav.Link> must be placed within <TabNav.Root>.',
    );
  });

  it('warns in development when the Root has no accessible name', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(
      <TabNav.Root>
        <TabNav.Link href="#a">A</TabNav.Link>
      </TabNav.Root>,
    );
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('<TabNav.Root> has no accessible name'));
  });
});

describe('TabNav link state', () => {
  it('marks only the active link with aria-current="page" and data-active', () => {
    render(<Example active="activity" />);
    const [overview, activity, settings] = screen.getAllByRole('link');
    expect(activity.getAttribute('aria-current')).toBe('page');
    expect(activity.hasAttribute('data-active')).toBe(true);
    for (const other of [overview, settings]) {
      expect(other.hasAttribute('aria-current')).toBe(false);
      expect(other.hasAttribute('data-active')).toBe(false);
    }
  });

  it('moves the mark when active changes', () => {
    const { rerender } = render(<Example active="overview" />);
    rerender(<Example active="settings" />);
    expect(screen.getByRole('link', { name: 'Settings' }).getAttribute('aria-current')).toBe('page');
    expect(screen.getByRole('link', { name: 'Overview' }).hasAttribute('aria-current')).toBe(false);
  });

  it('does not let a consumer attribute replace the state', () => {
    render(
      <TabNav.Root aria-label="x">
        <TabNav.Link href="#a" aria-current="step" data-active="no">
          A
        </TabNav.Link>
      </TabNav.Root>,
    );
    const link = screen.getByRole('link');
    expect(link.hasAttribute('aria-current')).toBe(false);
    expect(link.hasAttribute('data-active')).toBe(false);
  });

  it('marks a disabled link with aria-disabled, data-disabled and no tab stop', () => {
    render(<Example lockSettings />);
    const link = screen.getByRole('link', { name: 'Settings' });
    expect(link.getAttribute('aria-disabled')).toBe('true');
    expect(link.hasAttribute('data-disabled')).toBe(true);
    expect(link.getAttribute('tabindex')).toBe('-1');
    const enabled = screen.getByRole('link', { name: 'Overview' });
    expect(enabled.hasAttribute('aria-disabled')).toBe(false);
    expect(enabled.hasAttribute('tabindex')).toBe(false);
  });
});

describe('TabNav keyboard and activation', () => {
  it('moves between the links with Tab, skipping a disabled one, and follows with Enter', async () => {
    const onClick = vi.fn((event: { preventDefault: () => void }) => {
      event.preventDefault();
    });
    render(
      <>
        <button>before</button>
        <TabNav.Root aria-label="x">
          <TabNav.Link href="#a" onClick={onClick}>
            A
          </TabNav.Link>
          <TabNav.Link href="#b" disabled>
            B
          </TabNav.Link>
          <TabNav.Link href="#c" onClick={onClick}>
            C
          </TabNav.Link>
        </TabNav.Root>
      </>,
    );
    const user = userEvent.setup();
    await user.tab();
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('link', { name: 'A' }));
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('link', { name: 'C' }));
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not use the arrow keys to move focus', async () => {
    render(<Example />);
    const user = userEvent.setup();
    screen.getByRole('link', { name: 'Overview' }).focus();
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(screen.getByRole('link', { name: 'Overview' }));
  });

  it('prevents the navigation of a disabled link and runs no click handler', () => {
    const onClick = vi.fn();
    const onNative = vi.fn();
    render(
      <TabNav.Root aria-label="x">
        <TabNav.Link href="#b" disabled onClick={onClick}>
          B
        </TabNav.Link>
      </TabNav.Root>,
    );
    const link = screen.getByRole('link');
    link.addEventListener('click', onNative);
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    link.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(onClick).not.toHaveBeenCalled();
    expect(onNative).not.toHaveBeenCalled();
  });

  it('lets an enabled link click through', async () => {
    const onClick = vi.fn((event: { preventDefault: () => void }) => {
      event.preventDefault();
    });
    render(
      <TabNav.Root aria-label="x">
        <TabNav.Link href="#a" onClick={onClick}>
          A
        </TabNav.Link>
      </TabNav.Root>,
    );
    await userEvent.click(screen.getByRole('link'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe('TabNav render', () => {
  const RouterLink = forwardRef<HTMLAnchorElement, AnchorHTMLAttributes<HTMLAnchorElement> & { to?: string }>(
    function RouterLink({ to, ...props }, ref) {
      return <a {...props} href={to} ref={ref} data-router="" />;
    },
  );

  it('renders a router link with the link props merged in', () => {
    render(
      <TabNav.Root aria-label="x">
        <TabNav.Link active render={<RouterLink to="/overview" />}>
          Overview
        </TabNav.Link>
      </TabNav.Root>,
    );
    const link = screen.getByRole('link', { name: 'Overview' });
    expect(link.getAttribute('href')).toBe('/overview');
    expect(link.hasAttribute('data-router')).toBe(true);
    expect(link.className).toBe('cck-tab-nav__link');
    expect(link.getAttribute('aria-current')).toBe('page');
  });

  it('blocks a disabled router link before the router handler runs', () => {
    const navigate = vi.fn();
    render(
      <TabNav.Root aria-label="x">
        <TabNav.Link disabled render={<RouterLink to="/x" onClick={navigate} />}>
          X
        </TabNav.Link>
      </TabNav.Root>,
    );
    screen.getByRole('link').dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    expect(navigate).not.toHaveBeenCalled();
  });

  it('passes the merged props and the state to the function form', () => {
    const seen: { active: boolean; disabled: boolean }[] = [];
    render(
      <TabNav.Root aria-label="x">
        <TabNav.Link
          active
          render={({ ref, ...props }, state) => {
            seen.push(state);
            return <a href="#f" ref={ref} {...props} />;
          }}
        >
          F
        </TabNav.Link>
      </TabNav.Root>,
    );
    expect(seen.at(-1)).toEqual({ active: true, disabled: false });
    expect(screen.getByRole('link').getAttribute('aria-current')).toBe('page');
  });

  it('always renders a nav landmark and takes no render', () => {
    render(
      <TabNav.Root aria-label="x">
        <TabNav.Link href="#a">A</TabNav.Link>
      </TabNav.Root>,
    );
    expect(screen.getByRole('navigation').localName).toBe('nav');
    expect(screen.getByRole('navigation').className).toBe('cck-tab-nav');
  });
});
