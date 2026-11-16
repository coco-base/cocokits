// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeOptionsProvider, ThemeProvider } from '@cocokits/react-core';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { Dialog, Select, Tooltip } from '../src/index';

/** jsdom has no top layer and no modal dialog: the stubs show a popover and mark a modal dialog as open. */
function stubTopLayer(): void {
  Object.defineProperty(document.documentElement, 'scrollHeight', { configurable: true, value: 2000 });
  const matches = Reflect.get(Element.prototype, 'matches') as (this: Element, selector: string) => boolean;
  vi.spyOn(Element.prototype, 'matches').mockImplementation(function (this: Element, selector: string) {
    if (selector === ':modal') return this.localName === 'dialog' && this.hasAttribute('data-modal');
    return matches.call(this, selector);
  });
  HTMLElement.prototype.showPopover = function (this: HTMLElement) {
    this.style.display = 'block';
  };
  Element.prototype.scrollIntoView = vi.fn();
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
    this.setAttribute('open', '');
    this.setAttribute('data-modal', '');
  };
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
    this.removeAttribute('open');
    this.removeAttribute('data-modal');
    this.dispatchEvent(new Event('close'));
  };
}

beforeEach(stubTopLayer);
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
  document.documentElement.removeAttribute('style');
});

type Value = string | null | undefined;
const { dialog: dialogConfig, tooltip: tooltipConfig } = cocokitsThemeConfig.components;
// The prop is typed per option; the tests set one value at a time and read the attribute it renders.
const loose = (value: Value): never => value as never;

interface Overlay {
  readonly name: 'dialog' | 'tooltip';
  readonly content: string;
  readonly values: readonly string[];
  readonly defaultSize: string;
  readonly ui: (size: Value, foreign?: boolean) => ReactElement;
}

const wrapForeign = (inner: ReactElement, foreign?: boolean): ReactElement =>
  foreign ? (
    <ThemeOptionsProvider componentName="button" options={{ size: 'xl' }}>
      {inner}
    </ThemeOptionsProvider>
  ) : (
    inner
  );

const overlays: Overlay[] = [
  {
    name: 'dialog',
    content: '.cck-dialog__content',
    values: dialogConfig.size.values,
    defaultSize: dialogConfig.size.default,
    ui: (size, foreign) => (
      <Dialog.Root defaultOpen size={loose(size)}>
        <Dialog.Trigger>Open</Dialog.Trigger>
        {wrapForeign(
          <Dialog.Content>
            <Dialog.Title>Panel</Dialog.Title>
          </Dialog.Content>,
          foreign,
        )}
      </Dialog.Root>
    ),
  },
  {
    name: 'tooltip',
    content: '.cck-tooltip__content',
    values: tooltipConfig.size.values,
    defaultSize: tooltipConfig.size.default,
    ui: (size, foreign) => (
      <Tooltip.Root defaultOpen size={loose(size)}>
        <Tooltip.Trigger>Copy</Tooltip.Trigger>
        {wrapForeign(<Tooltip.Content>Copies the link</Tooltip.Content>, foreign)}
      </Tooltip.Root>
    ),
  },
];

describe.each(overlays)('the $name size of the React theme (D28)', (overlay) => {
  const mount = (size: Value, override?: string, foreign?: boolean) => {
    const overrides = override ? { [overlay.name]: { size: override } } : {};
    const wrap = (value: Value): ReactElement => (
      <ThemeProvider themeConfig={cocokitsThemeConfig} overrides={overrides}>
        {overlay.ui(value, foreign)}
      </ThemeProvider>
    );
    const { rerender } = render(wrap(size));
    return {
      size: (): string | null => document.querySelector(overlay.content)?.getAttribute('data-size') ?? null,
      exists: (): boolean => document.querySelector(overlay.content) !== null,
      set: (value: Value): void => {
        rerender(wrap(value));
      },
    };
  };

  it('shows the own size of the root, for every value', () => {
    const view = mount(overlay.values[0]);
    for (const value of overlay.values) {
      view.set(value);
      expect(view.size()).toBe(value);
    }
  });

  it.each([
    ['with no override', undefined],
    ['with an override', 'lg'],
  ])('shows its own size over the override, %s', (_name, override) => {
    expect(mount('sm', override).size()).toBe('sm');
  });

  it('shows the ThemeProvider override when the root sets none', () => {
    expect(mount(undefined, 'lg').size()).toBe('lg');
  });

  it('shows the default when the root and the override set none', () => {
    expect(mount(undefined).size()).toBe(overlay.defaultSize);
  });

  it.each([
    ['with no override', undefined],
    ['with an override', 'lg'],
  ])('renders no data-size for an initial null, %s', (_name, override) => {
    const view = mount(null, override);
    expect(view.exists()).toBe(true);
    expect(view.size()).toBeNull();
    view.set('sm');
    expect(view.size()).toBe('sm');
    view.set(null);
    expect(view.size()).toBeNull();
  });

  it.each([
    ['own size to undefined', 'sm'],
    ['null to undefined', null],
  ])('brings the override back with %s, and the default without one', (_name, first) => {
    const withOverride = mount(first, 'lg');
    withOverride.set(undefined);
    expect(withOverride.size()).toBe('lg');
    cleanup();
    const plain = mount(first);
    plain.set(undefined);
    expect(plain.size()).toBe(overlay.defaultSize);
  });

  it('is not hidden by a foreign theme wrapper between the root and the content', () => {
    expect(mount('sm', undefined, true).size()).toBe('sm');
  });

  it('renders no theme attribute without a theme provider', () => {
    render(overlay.ui('lg'));
    expect(document.querySelector(overlay.content)).not.toBeNull();
    expect(document.querySelector(overlay.content)?.hasAttribute('data-size')).toBe(false);
  });
});

describe('the Select indicator of the React theme', () => {
  const mount = (indicator: Value, override?: string) => {
    const overrides = override ? { select: { indicator: override } } : {};
    const wrap = (value: Value): ReactElement => (
      <ThemeProvider themeConfig={cocokitsThemeConfig} overrides={overrides}>
        <Select.Root defaultOpen indicator={loose(value)} multiple>
          <Select.Trigger aria-label="Dish">
            <Select.Value placeholder="Pick" />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="a">
              <Select.ItemIndicator />
              <Select.ItemText>A</Select.ItemText>
            </Select.Item>
          </Select.Content>
        </Select.Root>
      </ThemeProvider>
    );
    const { rerender } = render(wrap(indicator));
    return {
      attr: (): string | null => document.querySelector('.cck-select__content')?.getAttribute('data-indicator') ?? null,
      set: (value: Value): void => {
        rerender(wrap(value));
      },
    };
  };

  it.each(cocokitsThemeConfig.components.select.indicator.values)('renders data-indicator %s on the list', (value) => {
    expect(mount(value).attr()).toBe(value);
  });

  it('renders none by default, takes the override, and removes it with null', () => {
    expect(mount(undefined).attr()).toBeNull();
    cleanup();
    const view = mount('checkbox', 'none');
    expect(view.attr()).toBe('checkbox');
    view.set(null);
    expect(view.attr()).toBeNull();
    view.set(undefined);
    expect(view.attr()).toBe('none');
  });
});
