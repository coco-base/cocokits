// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/vue';
import { defineComponent, h, nextTick, ref, type Component, type VNode } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Button as BaseButton } from '@cocokits/vue/button';
import { ThemeProvider } from '@cocokits/vue-core';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { Button, type ButtonProps } from '../src/index';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

type Kind = 'button' | 'link';
const { variant, color, size } = cocokitsThemeConfig.components.button;

const themed = (
  renderFn: () => VNode | VNode[],
  overrides?: Record<string, Record<string, string | null>>,
): Component =>
  defineComponent({
    setup: () => () => h(ThemeProvider, { themeConfig: cocokitsThemeConfig, overrides }, renderFn),
  });

const linkProps = (kind: Kind): Record<string, string> => (kind === 'link' ? { as: 'a', href: '#go' } : {});

/** Renders the Button as a native button or as a link and returns its root element. */
function mountButton(kind: Kind, props: Partial<ButtonProps> = {}): HTMLElement {
  render(themed(() => h(Button, { ...linkProps(kind), ...props }, () => 'Go')));
  return screen.getByRole(kind);
}

describe.each<Kind>(['button', 'link'])('theme Button as a %s', (kind) => {
  it('renders the config defaults', () => {
    const el = mountButton(kind);
    expect(el.getAttribute('data-variant')).toBe('primary');
    expect(el.getAttribute('data-cck-color')).toBe('brand');
    expect(el.getAttribute('data-size')).toBe('md');
    expect(el.classList.contains('cck-button')).toBe(true);
  });

  it.each(variant.values)('moves data-variant to %s', (value) => {
    expect(mountButton(kind, { variant: value }).getAttribute('data-variant')).toBe(value);
  });

  it.each(color.values)('moves data-cck-color to %s', (value) => {
    expect(mountButton(kind, { color: value }).getAttribute('data-cck-color')).toBe(value);
  });

  it.each(size.values)('moves data-size to %s', (value) => {
    expect(mountButton(kind, { size: value }).getAttribute('data-size')).toBe(value);
  });

  it('removes an attribute with null', () => {
    const el = mountButton(kind, { variant: null, color: null, size: null });
    expect(el.hasAttribute('data-variant')).toBe(false);
    expect(el.hasAttribute('data-cck-color')).toBe(false);
    expect(el.hasAttribute('data-size')).toBe(false);
  });

  it('lets a provider override win over the default, and the own option win over the override', () => {
    render(
      themed(() => h(Button, { ...linkProps(kind), size: 'sm' }, () => 'Go'), {
        button: { variant: 'light', size: 'lg' },
      }),
    );
    const el = screen.getByRole(kind);
    expect(el.getAttribute('data-variant')).toBe('light');
    expect(el.getAttribute('data-size')).toBe('sm');
  });

  it('follows live option updates, and undefined restores the default after null', async () => {
    const value = ref<ButtonProps['variant']>('outline');
    render(themed(() => h(Button, { ...linkProps(kind), variant: value.value }, () => 'Go')));
    const el = screen.getByRole(kind);
    expect(el.getAttribute('data-variant')).toBe('outline');
    value.value = null;
    await nextTick();
    expect(el.hasAttribute('data-variant')).toBe(false);
    value.value = undefined;
    await nextTick();
    expect(el.getAttribute('data-variant')).toBe('primary');
    value.value = 'light';
    await nextTick();
    expect(el.getAttribute('data-variant')).toBe('light');
  });
});

describe('theme Button', () => {
  it('has the name Button for devtools', () => {
    expect((Button as unknown as { name: string }).name).toBe('Button');
  });

  it('renders no type and no role on a link', () => {
    const el = mountButton('link', { size: 'lg' });
    expect(el.tagName).toBe('A');
    expect(el.hasAttribute('type')).toBe(false);
    expect(el.hasAttribute('role')).toBe(false);
  });

  it('renders a link through asChild, with the theme data-*', () => {
    render(themed(() => h(Button, { asChild: true, size: 'lg' }, () => h('a', { href: '#go' }, 'Go'))));
    const link = screen.getByRole('link', { name: 'Go' });
    expect(link.getAttribute('data-size')).toBe('lg');
    expect(link.hasAttribute('type')).toBe(false);
  });

  it('renders no theme data-* for a base without a theme provider', () => {
    render(defineComponent({ setup: () => () => h(BaseButton, null, () => 'Go') }));
    expect(
      screen
        .getByRole('button')
        .getAttributeNames()
        .filter((name) => /^data-(variant|cck-color|size)$/.test(name)),
    ).toEqual([]);
  });

  it('passes disabled, type, class and listeners to the base', () => {
    const onClick = vi.fn();
    render(themed(() => h(Button, { disabled: true, type: 'submit', class: 'mine', onClick }, () => 'Save')));
    const el = screen.getByRole('button');
    expect(el.hasAttribute('disabled')).toBe(true);
    expect(el.hasAttribute('data-disabled')).toBe(true);
    expect(el.getAttribute('type')).toBe('submit');
    expect(el.classList.contains('mine')).toBe(true);
    el.click();
    expect(onClick).not.toHaveBeenCalled();
  });

  it('exposes the rendered element through the component ref', () => {
    const native = ref<{ element: Element | null } | null>(null);
    const link = ref<{ element: Element | null } | null>(null);
    render(
      themed(() => [
        h(Button, { ref: native }, () => 'Go'),
        h(Button, { ref: link, as: 'a', href: '#go' }, () => 'Link'),
      ]),
    );
    expect(native.value?.element).toBe(screen.getByRole('button'));
    expect(link.value?.element).toBe(screen.getByRole('link'));
  });

  it('does not log from the component', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    mountButton('button');
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
  });
});
