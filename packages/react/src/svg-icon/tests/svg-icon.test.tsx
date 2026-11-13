// @vitest-environment jsdom
import { act, cleanup, render, waitFor } from '@testing-library/react';
import { createRef, useEffect, type ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { checkIcon, heartIcon } from '@cocokits/icons';
import { svgIconAnatomy, svgIconMeta } from '@cocokits/machines/svg-icon';
import { IconProvider, useIconRegistry } from '@cocokits/react-core';
import { SvgIcon } from '../index';
import { strictThemed, svgOf, themed } from '../../internal/tests/icon-fixtures';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const rootOf = (container: HTMLElement): HTMLElement => container.firstElementChild as HTMLElement;
const quiet = () => vi.spyOn(console, 'error').mockImplementation(() => undefined);
const messages = (spy: ReturnType<typeof quiet>): string[] => spy.mock.calls.map(([message]) => String(message));

describe('SvgIcon (rendered contract)', () => {
  it('ignores children: the svg is still drawn from the icon name', () => {
    const { container } = render(strictThemed(<SvgIcon iconName="dots">text</SvgIcon>));
    const root = rootOf(container);
    expect(root.textContent).toBe('');
    expect(root.querySelectorAll('path')).toHaveLength(2);
  });

  it('renders the root, the owned svg and the body of the icon', () => {
    const { container } = render(strictThemed(<SvgIcon iconName="heart" />));
    const root = rootOf(container);
    expect(root.tagName).toBe(svgIconMeta.defaultElements?.root?.toUpperCase());
    expect(root.className).toBe(svgIconAnatomy.classes.root);
    expect(root.getAttribute('data-icon')).toBe('heart');
    const svg = root.querySelector('svg');
    expect(svg?.getAttribute('class')).toBe(svgIconAnatomy.classes.svg);
    expect(svg?.getAttribute('viewBox')).toBe(heartIcon.viewBox);
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
    expect(svg?.getAttribute('focusable')).toBe('false');
    expect(svg?.querySelectorAll('path')).toHaveLength(1);
    expect(svg?.querySelector('path')?.getAttribute('fill')).toBe('currentColor');
  });

  it('is hidden from assistive technology without a label, and has no role', () => {
    const { container } = render(themed(<SvgIcon iconName="heart" />));
    expect(rootOf(container).getAttribute('aria-hidden')).toBe('true');
    expect(rootOf(container).hasAttribute('role')).toBe(false);
    expect(rootOf(container).hasAttribute('aria-label')).toBe(false);
  });

  it('treats an empty label as no label', () => {
    const { container } = render(themed(<SvgIcon iconName="heart" label="" />));
    expect(rootOf(container).getAttribute('aria-hidden')).toBe('true');
    expect(rootOf(container).hasAttribute('role')).toBe(false);
  });

  it('is an image with the label as its name', () => {
    const { container } = render(themed(<SvgIcon iconName="heart" label="Favourite" />));
    expect(rootOf(container).getAttribute('role')).toBe('img');
    expect(rootOf(container).getAttribute('aria-label')).toBe('Favourite');
    expect(rootOf(container).hasAttribute('aria-hidden')).toBe(false);
  });

  it('joins className, merges style, passes native props and puts ref on the span', () => {
    const ref = createRef<HTMLSpanElement>();
    const { container } = render(
      themed(<SvgIcon iconName="heart" className="mine" style={{ opacity: 0.5 }} id="one" data-x="1" ref={ref} />),
    );
    const root = rootOf(container);
    expect(root.className).toBe('cck-svg-icon mine');
    expect(root.style.opacity).toBe('0.5');
    expect(root.id).toBe('one');
    expect(root.getAttribute('data-x')).toBe('1');
    expect(ref.current).toBe(root);
  });

  it('puts the theme options on the root only', () => {
    const { container } = render(themed(<SvgIcon iconName="heart" />));
    expect(rootOf(container).getAttribute('data-size')).toBe('sm');
    expect(container.querySelector('svg')?.getAttributeNames().sort()).toEqual([
      'aria-hidden',
      'class',
      'focusable',
      'viewBox',
    ]);
  });

  it('draws the base icons without a provider', () => {
    const { container } = render(<SvgIcon iconName="check" />);
    expect(container.querySelector('svg')?.getAttribute('viewBox')).toBe(checkIcon.viewBox);
  });
});

describe('SvgIcon (name not registered)', () => {
  it.each<[string, (ui: ReactElement) => ReactElement]>([
    ['a provider without the name', themed],
    ['no provider', (ui) => ui],
  ])('renders an empty svg, keeps the name and logs one error: %s', (_label, wrap) => {
    const error = quiet();
    const { container } = render(wrap(<SvgIcon iconName="nope" />));
    const root = rootOf(container);
    expect(root.getAttribute('data-icon')).toBe('nope');
    const svg = root.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg?.hasAttribute('viewBox')).toBe(false);
    expect(svg?.childNodes).toHaveLength(0);
    expect(messages(error)).toHaveLength(1);
    expect(messages(error)[0]).toMatch(/^CocoKits: .*"nope"/);
  });

  it('logs once per mount in StrictMode and once more for each new missing name', () => {
    const error = quiet();
    const { rerender } = render(strictThemed(<SvgIcon iconName="nope" />));
    expect(error).toHaveBeenCalledTimes(1);
    rerender(strictThemed(<SvgIcon iconName="nope" label="Same name" />));
    expect(error).toHaveBeenCalledTimes(1);
    rerender(strictThemed(<SvgIcon iconName="other" />));
    expect(error).toHaveBeenCalledTimes(2);
    rerender(strictThemed(<SvgIcon iconName="heart" />));
    expect(error).toHaveBeenCalledTimes(2);
  });

  it('does not log for a registered icon', () => {
    const error = quiet();
    render(strictThemed(<SvgIcon iconName="heart" />));
    expect(error).not.toHaveBeenCalled();
  });

  it('does not take a name that only the prototype has', () => {
    quiet();
    const { container } = render(themed(<SvgIcon iconName="constructor" />));
    expect(container.querySelectorAll('path')).toHaveLength(0);
  });

  it('draws the icon once it is registered, with no second error', () => {
    const error = quiet();
    let registerLate = (): void => undefined;
    function Grab(): null {
      const registry = useIconRegistry();
      useEffect(() => {
        registerLate = () => {
          registry.registerIcons({ late: heartIcon });
        };
      }, [registry]);
      return null;
    }
    const { container } = render(
      <IconProvider>
        <Grab />
        <SvgIcon iconName="late" />
      </IconProvider>,
    );
    expect(container.querySelectorAll('path')).toHaveLength(0);
    act(registerLate);
    expect(container.querySelectorAll('path')).toHaveLength(1);
    expect(error).toHaveBeenCalledTimes(1);
  });
});

describe('SvgIcon (lazy icon)', () => {
  it('is empty first, then drawn after one load shared by every icon of that name, with no error', async () => {
    const error = quiet();
    const load = vi.fn(() => Promise.resolve(heartIcon));
    const { container } = render(
      <IconProvider lazyIcons={{ later: load }}>
        <SvgIcon iconName="later" />
        <SvgIcon iconName="later" />
      </IconProvider>,
    );
    expect(container.querySelector('svg')?.hasAttribute('viewBox')).toBe(false);
    await waitFor(() => {
      expect(container.querySelectorAll('path')).toHaveLength(2);
    });
    expect(load).toHaveBeenCalledTimes(1);
    expect(error).not.toHaveBeenCalled();
  });

  it('draws an icon the loader resolves as an svg string', async () => {
    const { container } = render(
      <IconProvider lazyIcons={{ later: () => Promise.resolve(svgOf(checkIcon)) }}>
        <SvgIcon iconName="later" />
      </IconProvider>,
    );
    await waitFor(() => {
      expect(container.querySelector('svg')?.getAttribute('viewBox')).toBe(checkIcon.viewBox);
    });
    expect(container.querySelectorAll('path')).toHaveLength(1);
  });
});

describe('SvgIcon (svg string)', () => {
  it('draws the string after mount, without data-icon', () => {
    const { container } = render(<SvgIcon svg={svgOf(heartIcon)} />);
    const root = rootOf(container);
    expect(root.hasAttribute('data-icon')).toBe(false);
    expect(root.querySelector('svg')?.getAttribute('viewBox')).toBe(heartIcon.viewBox);
    expect(root.querySelectorAll('svg')).toHaveLength(1);
    expect(root.querySelector('svg')?.getAttribute('class')).toBe(svgIconAnatomy.classes.svg);
    expect(root.querySelectorAll('path')).toHaveLength(1);
  });

  it('follows a new string', () => {
    const { container, rerender } = render(<SvgIcon svg={svgOf(heartIcon)} />);
    rerender(<SvgIcon svg={svgOf(checkIcon)} />);
    expect(container.querySelector('svg')?.getAttribute('viewBox')).toBe(checkIcon.viewBox);
  });

  it('renders empty and logs an error for text that is not an svg', () => {
    const error = quiet();
    const { container } = render(<SvgIcon svg="<p>no</p>" />);
    expect(container.querySelector('svg')?.childNodes).toHaveLength(0);
    expect(messages(error)).toHaveLength(1);
    expect(messages(error)[0]).toMatch(/^CocoKits: /);
  });
});

describe('SvgIcon (both inputs or none)', () => {
  it('uses iconName and logs an error when both are given', () => {
    const error = quiet();
    const { container } = render(themed(<SvgIcon iconName="heart" svg={svgOf(checkIcon)} />));
    expect(container.querySelector('svg')?.getAttribute('viewBox')).toBe(heartIcon.viewBox);
    expect(rootOf(container).getAttribute('data-icon')).toBe('heart');
    expect(messages(error)).toHaveLength(1);
    expect(messages(error)[0]).toMatch(/both iconName and svg/);
  });

  it('renders empty and logs an error when neither is given', () => {
    const error = quiet();
    const { container } = render(<SvgIcon />);
    expect(container.querySelector('svg')?.childNodes).toHaveLength(0);
    expect(rootOf(container).hasAttribute('data-icon')).toBe(false);
    expect(messages(error)).toHaveLength(1);
  });
});

describe('IconProvider', () => {
  it('registers the records of a later render too', () => {
    const { container, rerender } = render(
      <IconProvider icons={{ one: heartIcon }}>
        <SvgIcon iconName="two" />
      </IconProvider>,
    );
    quiet();
    expect(container.querySelectorAll('path')).toHaveLength(0);
    rerender(
      <IconProvider icons={{ two: checkIcon }}>
        <SvgIcon iconName="two" />
      </IconProvider>,
    );
    expect(container.querySelector('svg')?.getAttribute('viewBox')).toBe(checkIcon.viewBox);
  });

  it('falls back to the outer provider', () => {
    const { container } = render(
      <IconProvider icons={{ outer: heartIcon }}>
        <IconProvider icons={{ inner: checkIcon }}>
          <SvgIcon iconName="outer" />
          <SvgIcon iconName="inner" />
        </IconProvider>
      </IconProvider>,
    );
    expect(container.querySelectorAll('path')).toHaveLength(2);
  });

  it('draws a lazy icon of the outer provider inside a nested one', async () => {
    const { container } = render(
      <IconProvider lazyIcons={{ later: () => Promise.resolve(heartIcon) }}>
        <IconProvider icons={{ inner: checkIcon }}>
          <SvgIcon iconName="later" />
        </IconProvider>
      </IconProvider>,
    );
    await waitFor(() => {
      expect(container.querySelector('svg')?.getAttribute('viewBox')).toBe(heartIcon.viewBox);
    });
    expect(container.querySelectorAll('path')).toHaveLength(1);
  });

  it('draws a name registered later in the outer provider inside a nested one', () => {
    quiet();
    let registerLate = (): void => undefined;
    function Grab(): null {
      const registry = useIconRegistry();
      useEffect(() => {
        registerLate = () => {
          registry.registerIcons({ late: heartIcon });
        };
      }, [registry]);
      return null;
    }
    const { container } = render(
      <IconProvider>
        <Grab />
        <IconProvider>
          <SvgIcon iconName="late" />
        </IconProvider>
      </IconProvider>,
    );
    expect(container.querySelectorAll('path')).toHaveLength(0);
    act(registerLate);
    expect(container.querySelectorAll('path')).toHaveLength(1);
  });

  it('does not reload an icon when a parent re-render passes the same loader', async () => {
    const load = vi.fn(() => Promise.resolve(heartIcon));
    const view = (): ReactElement => (
      <IconProvider lazyIcons={{ later: load }}>
        <SvgIcon iconName="later" />
      </IconProvider>
    );
    const { container, rerender } = render(view());
    await waitFor(() => {
      expect(container.querySelectorAll('path')).toHaveLength(1);
    });
    rerender(view());
    rerender(view());
    expect(load).toHaveBeenCalledTimes(1);
    expect(container.querySelectorAll('path')).toHaveLength(1);
  });

  it('refuses a register call without a provider and logs an error', () => {
    const error = quiet();
    function Register(): null {
      useIconRegistry().registerIcons({ x: heartIcon });
      return null;
    }
    const { container } = render(
      <>
        <Register />
        <SvgIcon iconName="x" />
      </>,
    );
    expect(container.querySelectorAll('path')).toHaveLength(0);
    expect(messages(error).some((message) => message.startsWith('CocoKits:'))).toBe(true);
  });
});
