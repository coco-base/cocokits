// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { cleanup, screen } from '@testing-library/vue';
import { h, ref } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { chipMeta } from '@cocokits/machines/chip';
import { defineThemeConfig } from '@cocokits/shared';
import { IconProvider, ThemeProvider } from '@cocokits/vue-core';
import { arrowDownIcon } from '@cocokits/icons';
import { mountView, pick } from '../../internal/tests/mount-helpers';
import { Chip } from '../index';

afterEach(cleanup);

const root = (): HTMLElement => pick(document.body, '.cck-chip');
const remove = (): HTMLButtonElement => pick(document.body, '.cck-chip__remove') as HTMLButtonElement;
const iconOf = (part: Element): string | null => part.querySelector('.cck-svg-icon')?.getAttribute('data-icon') ?? null;

describe('Chip', () => {
  it('renders the root, the content wrapper and no remove button by default', () => {
    mountView(() => h(Chip, null, () => 'Pizza'));
    expect(root().tagName).toBe('DIV');
    expect(root().hasAttribute('data-disabled')).toBe(false);
    const content = pick(document.body, '.cck-chip__content-wrapper');
    expect(content.tagName).toBe('SPAN');
    expect(content.textContent).toBe('Pizza');
    expect(content.id).toBe(`${root().id}-content`);
    expect(document.querySelector('.cck-chip__remove')).toBeNull();
  });

  it('uses the author id, and the content id derives from it', () => {
    mountView(() => h(Chip, { id: 'mine' }, () => 'Pizza'));
    expect(root().id).toBe('mine');
    expect(pick(document.body, '.cck-chip__content-wrapper').id).toBe('mine-content');
  });

  it('renders a native remove button named by the text, with the close icon', () => {
    mountView(() => h(Chip, { removable: true }, () => 'Pizza'));
    expect(remove().tagName).toBe('BUTTON');
    expect(remove().type).toBe('button');
    expect(remove().getAttribute('aria-labelledby')).toBe(pick(document.body, '.cck-chip__content-wrapper').id);
    expect(screen.getByRole('button', { name: 'Pizza' })).toBe(remove());
    expect(iconOf(remove())).toBe('close');
    expect(remove().querySelector('.cck-svg-icon')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('emits remove once for a click, Enter and Space', async () => {
    const onRemove = vi.fn();
    mountView(() => h(Chip, { removable: true, onRemove }, () => 'Pizza'));
    await userEvent.click(remove());
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onRemove).toHaveBeenLastCalledWith();
    remove().focus();
    await userEvent.keyboard('{Enter}');
    expect(onRemove).toHaveBeenCalledTimes(2);
    await userEvent.keyboard(' ');
    expect(onRemove).toHaveBeenCalledTimes(3);
  });

  it('never removes itself: the author decides', async () => {
    const shown = ref(true);
    mountView(() => (shown.value ? h(Chip, { removable: true }, () => 'Pizza') : h('p', 'gone')));
    await userEvent.click(remove());
    expect(root()).toBeTruthy();
  });

  it('disabled: data-disabled on the root, native disabled on the button, nothing emitted', async () => {
    const onRemove = vi.fn();
    mountView(() => h(Chip, { removable: true, disabled: true, onRemove }, () => 'Pizza'));
    expect(root().hasAttribute('data-disabled')).toBe(true);
    expect(remove().disabled).toBe(true);
    expect(remove().hasAttribute('data-disabled')).toBe(true);
    await userEvent.click(remove());
    expect(onRemove).not.toHaveBeenCalled();
  });

  it('lets native attributes, class and listeners fall through to the root', async () => {
    const onClick = vi.fn();
    mountView(() => h(Chip, { class: 'mine', 'data-testid': 'chip', title: 'T', onClick }, () => 'Pizza'));
    expect(root().classList.contains('cck-chip')).toBe(true);
    expect(root().classList.contains('mine')).toBe(true);
    expect(root().getAttribute('title')).toBe('T');
    await userEvent.click(root());
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('renders the element of as, and merges onto the child with asChild', () => {
    mountView(() => h(Chip, { as: 'li', removable: true }, () => 'Pizza'));
    expect(root().tagName).toBe('LI');
    cleanup();
    mountView(() => h(Chip, { asChild: true, removable: true, id: 'mine' }, () => h('section', 'Pizza')));
    expect(root().tagName).toBe('SECTION');
    expect(root().id).toBe('mine');
    expect(pick(document.body, '.cck-chip__content-wrapper').textContent).toBe('Pizza');
    expect(document.querySelectorAll('.cck-chip__remove')).toHaveLength(1);
  });

  it('exposes the root element', () => {
    const chip = ref<{ element: Element | null } | null>(null);
    mountView(() => h(Chip, { ref: chip }, () => 'Pizza'));
    expect(chip.value?.element).toBe(root());
  });

  it('draws the icon the theme names, else the default close', () => {
    const themeConfig = defineThemeConfig({ name: 'test', components: { chip: { icons: { remove: 'arrow-down' } } } });
    mountView(() =>
      h(IconProvider, { icons: { 'arrow-down': arrowDownIcon } }, () =>
        h(ThemeProvider, { themeConfig }, () => h(Chip, { removable: true }, () => 'Pizza')),
      ),
    );
    expect(iconOf(remove())).toBe('arrow-down');
  });

  it('describes its parts in the meta', () => {
    expect(Object.keys(chipMeta.dataAttrs)).toEqual(['root', 'contentWrapper', 'remove']);
  });
});
