import { signal } from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { provideCckTheme } from '@cocokits/angular-core';
import { checkboxAnatomy } from '@cocokits/machines/checkbox';
import { defineThemeConfig } from '@cocokits/shared';
import { describe, expect, it } from 'vitest';
import { CckCheckboxImports } from '../index';

const imports = [...CckCheckboxImports];
const { classes } = checkboxAnatomy;

const themeConfig = defineThemeConfig({
  name: 'test',
  components: {},
  icons: { check: { viewBox: '0 0 24 24', paths: [{ d: 'M-check' }] } },
  partIconNames: { checkbox: { background: 'check' } },
});

function background(container: Element): HTMLElement {
  const element = container.querySelector<HTMLElement>(`.${classes.background}`);
  if (!element) throw new Error('no background');
  return element;
}

const held = (container: Element): string | null =>
  background(container).querySelector('.cck-svg-icon')?.getAttribute('data-icon-name') ?? null;

describe('Checkbox tick icon', () => {
  it.each([
    ['unchecked', false, false, null],
    ['checked', true, false, 'check'],
    ['checked and indeterminate', true, true, null],
    ['indeterminate', false, true, null],
  ])('%s: the background holds %s', async (_name, checked, indeterminate, expected) => {
    const { container } = await render(
      `<cck-checkbox aria-label="Terms" [checked]="checked" [indeterminate]="indeterminate">Terms</cck-checkbox>`,
      { imports, providers: [provideCckTheme(themeConfig)], componentProperties: { checked, indeterminate } },
    );
    expect(held(container)).toBe(expected);
    expect(background(container).getAttribute('aria-hidden')).toBe('true');
  });

  it('adds the icon when checked and removes it when unchecked or mixed', async () => {
    const checked = signal(false);
    const indeterminate = signal(false);
    const { container } = await render(
      `<cck-checkbox aria-label="Terms" [checked]="checked()" [indeterminate]="indeterminate()">Terms</cck-checkbox>`,
      { imports, providers: [provideCckTheme(themeConfig)], componentProperties: { checked, indeterminate } },
    );
    expect(held(container)).toBeNull();
    checked.set(true);
    await waitFor(() => {
      expect(held(container)).toBe('check');
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
      providers: [provideCckTheme(themeConfig)],
    });
    await userEvent.setup().click(screen.getByRole('checkbox'));
    await waitFor(() => {
      expect(held(container)).toBe('check');
    });
  });

  it.each([
    ['no theme', []],
    ['a theme with no part icons', [provideCckTheme(defineThemeConfig({ name: 'bare', components: {} }))]],
  ])('leaves the background empty: %s', async (_name, providers) => {
    const { container } = await render(`<cck-checkbox aria-label="Terms" checked>Terms</cck-checkbox>`, {
      imports,
      providers,
    });
    expect(background(container).children).toHaveLength(0);
  });
});
