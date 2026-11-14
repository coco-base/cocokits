import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { provideCckIcons, provideCckTheme } from '@cocokits/angular-core';
import { plusIcon } from '@cocokits/icons';
import { chipAnatomy } from '@cocokits/machines/chip';
import { defineThemeConfig } from '@cocokits/shared';
import { describe, expect, it, vi } from 'vitest';
import { CckChipImports } from '../index';
import { must } from './fixtures';

const { classes } = chipAnatomy;
const imports = [...CckChipImports];

type User = ReturnType<typeof userEvent.setup>;

const root = (container: Element): Element => must(container.querySelector('cck-chip'));
const remove = (container: Element): HTMLButtonElement | null => container.querySelector(`.${classes.remove}`);

describe('Chip', () => {
  it('renders the root with its class and the content in the content wrapper', async () => {
    const { container } = await render(`<cck-chip id="pizza">Pizza</cck-chip>`, { imports });
    const chip = root(container);
    expect(chip.classList.contains(classes.root)).toBe(true);
    expect(chip.id).toBe('pizza');
    const wrapper = chip.querySelector(`.${classes.contentWrapper}`);
    expect(wrapper?.tagName).toBe('SPAN');
    expect(wrapper?.id).toBe('pizza-content');
    expect(wrapper?.textContent.trim()).toBe('Pizza');
    expect(chip.hasAttribute('role')).toBe(false);
  });

  it('gives a generated id and a content id that derives from it', async () => {
    const { container } = await render(`<cck-chip>Pizza</cck-chip>`, { imports });
    expect(root(container).id).toMatch(/^cck-chip/);
    expect(container.querySelector(`.${classes.contentWrapper}`)?.id).toBe(`${root(container).id}-content`);
  });

  it('renders no remove button while not removable', async () => {
    const { container } = await render(`<cck-chip>Pizza</cck-chip>`, { imports });
    expect(remove(container)).toBeNull();
  });

  it('renders the remove button while removable, named by the content', async () => {
    const { container } = await render(`<cck-chip id="p" removable>Pizza</cck-chip>`, { imports });
    const button = remove(container);
    expect(button?.tagName).toBe('BUTTON');
    expect(button?.getAttribute('type')).toBe('button');
    expect(button?.getAttribute('aria-labelledby')).toBe('p-content');
    expect(screen.getByRole('button', { name: 'Pizza' })).toBe(button);
  });

  it.each([
    ['a click', (user: User) => user.click(screen.getByRole('button'))],
    [
      'Enter',
      async (user: User) => {
        screen.getByRole('button').focus();
        await user.keyboard('{Enter}');
      },
    ],
    [
      'Space',
      async (user: User) => {
        screen.getByRole('button').focus();
        await user.keyboard(' ');
      },
    ],
  ])('emits removed once for %s and removes nothing itself', async (_name, act) => {
    const onRemoved = vi.fn();
    const { container } = await render(`<cck-chip removable (removed)="onRemoved($event)">Pizza</cck-chip>`, {
      imports,
      componentProperties: { onRemoved },
    });
    await act(userEvent.setup());
    expect(onRemoved).toHaveBeenCalledTimes(1);
    expect(onRemoved).toHaveBeenCalledWith(undefined);
    expect(root(container)).toBeTruthy();
  });

  it('shows data-disabled on the root and disables the remove button, which emits nothing', async () => {
    const onRemoved = vi.fn();
    const { container } = await render(`<cck-chip removable disabled (removed)="onRemoved()">Pizza</cck-chip>`, {
      imports,
      componentProperties: { onRemoved },
    });
    expect(root(container).hasAttribute('data-disabled')).toBe(true);
    const button = remove(container);
    expect(button?.disabled).toBe(true);
    expect(button?.hasAttribute('data-disabled')).toBe(true);
    await userEvent.setup().click(button as Element);
    expect(onRemoved).not.toHaveBeenCalled();
  });

  it('has no data-disabled while enabled', async () => {
    const { container } = await render(`<cck-chip removable>Pizza</cck-chip>`, { imports });
    expect(root(container).hasAttribute('data-disabled')).toBe(false);
    expect(remove(container)?.hasAttribute('data-disabled')).toBe(false);
  });

  it('passes native attributes to the root, which is the host', async () => {
    const { container } = await render(`<cck-chip title="Tag" data-x="1">Pizza</cck-chip>`, { imports });
    expect(root(container).getAttribute('title')).toBe('Tag');
    expect(root(container).getAttribute('data-x')).toBe('1');
  });

  describe('remove icon', () => {
    const iconOf = (container: Element): string | null | undefined =>
      remove(container)?.querySelector('.cck-svg-icon')?.getAttribute('data-icon');

    it('draws the default close icon, decorative', async () => {
      const { container } = await render(`<cck-chip removable>Pizza</cck-chip>`, { imports });
      expect(iconOf(container)).toBe('close');
      expect(remove(container)?.querySelector('.cck-svg-icon')?.getAttribute('aria-hidden')).toBe('true');
    });

    it('draws the icon the theme names in components.chip.icons.remove', async () => {
      const config = defineThemeConfig({ name: 'test', components: { chip: { icons: { remove: 'plus' } } } });
      const { container } = await render(`<cck-chip removable>Pizza</cck-chip>`, {
        imports,
        providers: [provideCckTheme(config), provideCckIcons({ icons: { plus: plusIcon } })],
      });
      expect(iconOf(container)).toBe('plus');
    });
  });
});
