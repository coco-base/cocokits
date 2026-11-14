import { signal } from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { provideCckIcons, provideCckTheme } from '@cocokits/angular-core';
import { heartIcon } from '@cocokits/icons';
import { checkboxAnatomy } from '@cocokits/machines/checkbox';
import { defineThemeConfig } from '@cocokits/shared';
import { describe, expect, it, vi } from 'vitest';
import { CckCheckboxImports } from '../index';

const imports = [...CckCheckboxImports];
const { classes } = checkboxAnatomy;

const themeConfig = defineThemeConfig({
  name: 'test',
  components: { checkbox: { icons: { background: 'heart' } } },
});
const themed = [provideCckTheme(themeConfig), provideCckIcons({ icons: { heart: heartIcon } })];

function background(container: Element): HTMLElement {
  const element = container.querySelector<HTMLElement>(`.${classes.background}`);
  if (!element) throw new Error('no background');
  return element;
}

const held = (container: Element): string | null =>
  background(container).querySelector('.cck-svg-icon')?.getAttribute('data-icon') ?? null;

describe('Checkbox tick icon', () => {
  it.each([
    ['unchecked', false, false, null],
    ['checked', true, false, 'heart'],
    ['checked and indeterminate', true, true, null],
    ['indeterminate', false, true, null],
  ])('%s: the background holds %s', async (_name, checked, indeterminate, expected) => {
    const { container } = await render(
      `<cck-checkbox aria-label="Terms" [checked]="checked" [indeterminate]="indeterminate">Terms</cck-checkbox>`,
      { imports, providers: themed, componentProperties: { checked, indeterminate } },
    );
    expect(held(container)).toBe(expected);
    expect(background(container).getAttribute('aria-hidden')).toBe('true');
  });

  it('adds the icon when checked and removes it when unchecked or mixed', async () => {
    const checked = signal(false);
    const indeterminate = signal(false);
    const { container } = await render(
      `<cck-checkbox aria-label="Terms" [checked]="checked()" [indeterminate]="indeterminate()">Terms</cck-checkbox>`,
      { imports, providers: themed, componentProperties: { checked, indeterminate } },
    );
    expect(held(container)).toBeNull();
    checked.set(true);
    await waitFor(() => {
      expect(held(container)).toBe('heart');
    });
    indeterminate.set(true);
    await waitFor(() => {
      expect(held(container)).toBeNull();
    });
    indeterminate.set(false);
    checked.set(false);
    await waitFor(() => {
      expect(held(container)).toBeNull();
    });
  });

  it('follows a click', async () => {
    const { container } = await render(`<cck-checkbox aria-label="Terms">Terms</cck-checkbox>`, {
      imports,
      providers: themed,
    });
    await userEvent.setup().click(screen.getByRole('checkbox'));
    await waitFor(() => {
      expect(held(container)).toBe('heart');
    });
  });

  it.each([
    ['no theme', []],
    ['a theme with no part icons', [provideCckTheme(defineThemeConfig({ name: 'bare', components: {} }))]],
  ])('holds the default icon while checked: %s', async (_name, providers) => {
    const { container } = await render(`<cck-checkbox aria-label="Terms" [checked]="true">Terms</cck-checkbox>`, {
      imports,
      providers,
    });
    expect(held(container)).toBe('check');
  });

  it('holds the default icon and reports a theme icon that is not registered', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { container } = await render(`<cck-checkbox aria-label="Terms" [checked]="true">Terms</cck-checkbox>`, {
      imports,
      providers: [provideCckTheme(themeConfig)],
    });
    expect(held(container)).toBe('check');
    await vi.waitFor(() => {
      expect(error).toHaveBeenCalledTimes(1);
    });
    expect(String(error.mock.calls[0]?.[0])).toContain('"heart" for checkbox.background');
    error.mockRestore();
  });
});
