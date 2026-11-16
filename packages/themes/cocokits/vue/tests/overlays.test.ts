// @vitest-environment jsdom
import { cleanup, render, waitFor } from '@testing-library/vue';
import { defineComponent, h, type PropType, type VNode } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { provideThemeOptions, ThemeProvider } from '@cocokits/vue-core';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import {
  DialogContent,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectRoot,
  SelectTrigger,
  SelectValue,
  TooltipContent,
  TooltipRoot,
  TooltipTrigger,
} from '../src/index';

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
type Wrap = (inner: VNode) => VNode;
const { dialog: dialogConfig, tooltip: tooltipConfig } = cocokitsThemeConfig.components;

/** A foreign theme wrapper between the root and the content, as a Button theme would be. */
const Foreign = defineComponent({
  setup: (_props, { slots }) => {
    provideThemeOptions('button', () => ({ size: 'xl' }));
    return () => slots.default?.();
  },
});
const wrapForeign: Wrap = (inner) => h(Foreign, null, () => inner);
const direct: Wrap = (inner) => inner;

interface Overlay {
  readonly name: 'dialog' | 'tooltip';
  readonly content: string;
  readonly values: readonly string[];
  readonly defaultSize: string;
  readonly ui: (size: Value, wrap: Wrap) => VNode;
}

const overlays: Overlay[] = [
  {
    name: 'dialog',
    content: '.cck-dialog__content',
    values: dialogConfig.size.values,
    defaultSize: dialogConfig.size.default,
    ui: (size, wrap) =>
      h(DialogRoot, { defaultOpen: true, size } as never, () => [
        h(DialogTrigger, null, () => 'Open'),
        wrap(h(DialogContent, null, () => h(DialogTitle, null, () => 'Panel'))),
      ]),
  },
  {
    name: 'tooltip',
    content: '.cck-tooltip__content',
    values: tooltipConfig.size.values,
    defaultSize: tooltipConfig.size.default,
    ui: (size, wrap) =>
      h(TooltipRoot, { defaultOpen: true, size } as never, () => [
        h(TooltipTrigger, null, () => 'Copy'),
        wrap(h(TooltipContent, null, () => 'Copies the link')),
      ]),
  },
];

/** A host with the root's size as a prop, so a test can change it. */
const hostOf = (overlay: Overlay, wrap: Wrap, override?: string, themed = true) =>
  defineComponent({
    props: { size: { type: String as PropType<Value>, default: undefined } },
    setup: (props) => () =>
      themed
        ? h(
            ThemeProvider,
            {
              themeConfig: cocokitsThemeConfig,
              overrides: override ? { [overlay.name]: { size: override } } : undefined,
            },
            () => overlay.ui(props.size, wrap),
          )
        : overlay.ui(props.size, wrap),
  });

describe.each(overlays)('the $name size of the Vue theme (D28)', (overlay) => {
  const mount = async (size: Value, override?: string, wrap: Wrap = direct, themed = true) => {
    const result = render(hostOf(overlay, wrap, override, themed), { props: { size } });
    await waitFor(() => {
      expect(document.querySelector(overlay.content)).not.toBeNull();
    });
    return {
      size: (): string | null => document.querySelector(overlay.content)?.getAttribute('data-size') ?? null,
      exists: (): boolean => document.querySelector(overlay.content) !== null,
      set: (value: Value) => result.rerender({ size: value }),
    };
  };

  it('shows the own size of the root, for every value', async () => {
    const view = await mount(overlay.values[0]);
    for (const value of overlay.values) {
      await view.set(value);
      expect(view.size()).toBe(value);
    }
  });

  it.each([
    ['with no override', undefined],
    ['with an override', 'lg'],
  ])('shows its own size over the override, %s', async (_name, override) => {
    expect((await mount('sm', override)).size()).toBe('sm');
  });

  it('shows the ThemeProvider override when the root sets none', async () => {
    expect((await mount(undefined, 'lg')).size()).toBe('lg');
  });

  it('shows the default when the root and the override set none', async () => {
    expect((await mount(undefined)).size()).toBe(overlay.defaultSize);
  });

  it.each([
    ['with no override', undefined],
    ['with an override', 'lg'],
  ])('renders no data-size for an initial null, %s', async (_name, override) => {
    const view = await mount(null, override);
    expect(view.exists()).toBe(true);
    expect(view.size()).toBeNull();
    await view.set('sm');
    expect(view.size()).toBe('sm');
    await view.set(null);
    expect(view.size()).toBeNull();
  });

  it.each([
    ['own size to undefined', 'sm'],
    ['null to undefined', null],
  ])('brings the override back with %s, and the default without one', async (_name, first) => {
    const withOverride = await mount(first, 'lg');
    await withOverride.set(undefined);
    expect(withOverride.size()).toBe('lg');
    cleanup();
    const plain = await mount(first);
    await plain.set(undefined);
    expect(plain.size()).toBe(overlay.defaultSize);
  });

  it('is not hidden by a foreign theme wrapper between the root and the content', async () => {
    expect((await mount('sm', undefined, wrapForeign)).size()).toBe('sm');
  });

  it('renders no theme attribute without a theme provider', async () => {
    const view = await mount('lg', undefined, direct, false);
    expect(view.exists()).toBe(true);
    expect(document.querySelector(overlay.content)?.hasAttribute('data-size')).toBe(false);
  });
});

describe('the Select indicator of the Vue theme', () => {
  const list = (indicator: Value, wrap: Wrap): VNode =>
    h(SelectRoot, { defaultOpen: true, indicator, multiple: true } as never, () => [
      h(SelectTrigger, { 'aria-label': 'Dish' }, () => h(SelectValue, { placeholder: 'Pick' })),
      wrap(
        h(SelectContent, null, () =>
          h(SelectItem, { value: 'a' }, () => [h(SelectItemIndicator), h(SelectItemText, null, () => 'A')]),
        ),
      ),
    ]);

  const mount = async (indicator: Value, override?: string, wrap: Wrap = direct) => {
    const host = defineComponent({
      props: { indicator: { type: String as PropType<Value>, default: undefined } },
      setup: (props) => () =>
        h(
          ThemeProvider,
          {
            themeConfig: cocokitsThemeConfig,
            overrides: override ? { select: { indicator: override } } : undefined,
          },
          () => list(props.indicator, wrap),
        ),
    });
    const result = render(host, { props: { indicator } });
    await waitFor(() => {
      expect(document.querySelector('.cck-select__content')).not.toBeNull();
    });
    return {
      attr: (): string | null => document.querySelector('.cck-select__content')?.getAttribute('data-indicator') ?? null,
      set: (value: Value) => result.rerender({ indicator: value }),
    };
  };

  it.each(cocokitsThemeConfig.components.select.indicator.values)(
    'renders data-indicator %s on the list',
    async (value) => {
      expect((await mount(value)).attr()).toBe(value);
    },
  );

  it('renders none by default, takes the override, and removes it with null', async () => {
    expect((await mount(undefined)).attr()).toBeNull();
    cleanup();
    const view = await mount('checkbox', 'none');
    expect(view.attr()).toBe('checkbox');
    await view.set(null);
    expect(view.attr()).toBeNull();
    await view.set(undefined);
    expect(view.attr()).toBe('none');
  });

  it('is not hidden by a foreign theme wrapper between the root and the list', async () => {
    expect((await mount('none', undefined, wrapForeign)).attr()).toBe('none');
  });
});
