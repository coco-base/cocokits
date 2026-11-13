// @vitest-environment jsdom
import { cleanup, screen } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import { h, nextTick, ref, type VNode } from 'vue';
import { afterEach, describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { dividerMeta } from '@cocokits/machines/divider';
import { ThemeProvider } from '@cocokits/vue-core';
import { Divider } from '../index';
import { mountView, pick, testThemeConfig } from './fixtures';

afterEach(cleanup);

const attrsOf = (element: Element): Record<string, string> =>
  Object.fromEntries(element.getAttributeNames().map((name) => [name, element.getAttribute(name) ?? '']));

describe('Divider (rendered contract)', () => {
  it.each<[string, Record<string, unknown>, Record<string, string>]>([
    ['default', {}, { class: 'cck-divider', 'data-orientation': 'horizontal' }],
    [
      'vertical',
      { orientation: 'vertical' },
      { class: 'cck-divider', 'data-orientation': 'vertical', 'aria-orientation': 'vertical' },
    ],
    [
      'decorative horizontal',
      { decorative: true },
      { class: 'cck-divider', 'data-orientation': 'horizontal', role: 'none' },
    ],
    [
      'decorative vertical',
      { decorative: true, orientation: 'vertical' },
      { class: 'cck-divider', 'data-orientation': 'vertical', role: 'none' },
    ],
  ])('renders one hr with the machine attributes: %s', (_name, props, expected) => {
    const { container } = mountView(() => h(Divider, props));
    expect(container.querySelectorAll('hr')).toHaveLength(1);
    const root = pick(container, '.cck-divider');
    expect(root.tagName).toBe('HR');
    expect(root.tagName.toLowerCase()).toBe(dividerMeta.defaultElements?.root);
    expect(attrsOf(root)).toEqual(expected);
    expect(
      root.getAttributeNames().filter((name) => name.startsWith('data-') && !dividerMeta.dataAttrs.root.includes(name)),
    ).toEqual([]);
  });

  it('is the root element of the component and has no children', () => {
    const { container } = mountView(() => h(Divider));
    expect(container.firstElementChild?.tagName).toBe('HR');
    expect(container.querySelector('hr')?.childNodes).toHaveLength(0);
  });

  it('passes native attributes through and merges the class', () => {
    const { container } = mountView(() =>
      h(Divider, { id: 'rule', 'aria-label': 'Sections', class: 'mine', hidden: true, 'data-testid': 'd' }),
    );
    const root = pick(container, '.cck-divider');
    expect(root.id).toBe('rule');
    expect(root.getAttribute('aria-label')).toBe('Sections');
    expect(root.hasAttribute('hidden')).toBe(true);
    expect(root.getAttribute('data-testid')).toBe('d');
    expect([...root.classList].sort()).toEqual(['cck-divider', 'mine']);
  });

  it('follows a reactive orientation and decorative', async () => {
    const vertical = ref(false);
    const decorative = ref(false);
    const { container } = mountView(() =>
      h(Divider, { orientation: vertical.value ? 'vertical' : 'horizontal', decorative: decorative.value }),
    );
    const root = pick(container, '.cck-divider');
    vertical.value = true;
    await nextTick();
    expect(attrsOf(root)).toMatchObject({ 'data-orientation': 'vertical', 'aria-orientation': 'vertical' });
    decorative.value = true;
    await nextTick();
    expect(root.getAttribute('role')).toBe('none');
    expect(root.hasAttribute('aria-orientation')).toBe(false);
  });

  it('puts the theme attributes on its root', () => {
    const { container } = mountView(() => h(ThemeProvider, { themeConfig: testThemeConfig }, () => h(Divider)));
    const root = pick(container, '.cck-divider');
    expect(root.getAttribute('data-size')).toBe('md');
    expect(root.getAttribute('data-color')).toBe('default');
  });
});

describe('Divider accessibility', () => {
  it('is found as a separator with its orientation', () => {
    mountView(() => [h(Divider), h(Divider, { orientation: 'vertical', 'aria-label': 'Side' })]);
    const separators = screen.getAllByRole('separator');
    expect(separators).toHaveLength(2);
    expect(separators[1]?.getAttribute('aria-orientation')).toBe('vertical');
    expect(screen.getByRole('separator', { name: 'Side' })).toBeDefined();
  });

  it('leaves the accessibility tree while decorative', () => {
    mountView(() => h(Divider, { decorative: true }));
    expect(screen.queryByRole('separator')).toBeNull();
  });

  it.each<[string, () => VNode]>([
    ['horizontal', () => h(Divider)],
    ['vertical', () => h(Divider, { orientation: 'vertical' })],
    ['decorative', () => h(Divider, { decorative: true })],
    ['named', () => h(Divider, { 'aria-label': 'Sections' })],
  ])('has no axe violations: %s', async (_name, make) => {
    const { container } = mountView(make);
    expect((await axe(container)).violations).toEqual([]);
  });

  it('is not focusable: Tab goes from the button before it to the button after it', async () => {
    mountView(() => [h('button', { type: 'button' }, 'Before'), h(Divider), h('button', { type: 'button' }, 'After')]);
    await userEvent.tab();
    expect(document.activeElement?.textContent).toBe('Before');
    await userEvent.tab();
    expect(document.activeElement?.textContent).toBe('After');
  });
});
