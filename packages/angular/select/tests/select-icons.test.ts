import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { provideCckTheme } from '@cocokits/angular-core';
import { selectAnatomy } from '@cocokits/machines/select';
import { defineThemeConfig } from '@cocokits/shared';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CckSelectImports } from '../index';
import { must, trigger } from './helpers';
import { stubOverlayApis } from './overlay-stubs';

const { classes } = selectAnatomy;
const imports = [...CckSelectImports];

const icon = (d: string) => ({ viewBox: '0 0 24 24', paths: [{ d }] });
const themeConfig = defineThemeConfig({
  name: 'test',
  components: {},
  icons: { 'chevron-down': icon('M-chevron'), check: icon('M-check') },
  partIconNames: { select: { dropdownIcon: 'chevron-down', optionIndicator: 'check' } },
});

const template = `
  <cck-select aria-label="Dish" value="Pizza" placeholder="Choose">
    <cck-select-option value="Cake">Cake</cck-select-option>
    <cck-select-option value="Pizza">Pizza</cck-select-option>
  </cck-select>`;

/** The icon the part holds: its name and the path, or null when the part is empty. */
function held(part: Element): { name: string | null; d: string | null } | null {
  const root = part.querySelector('.cck-svg-icon');
  if (!root) return null;
  return { name: root.getAttribute('data-icon-name'), d: root.querySelector('path')?.getAttribute('d') ?? null };
}

describe('Select part icons', () => {
  beforeEach(() => {
    stubOverlayApis();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('holds the theme icon in the dropdown icon, and the part stays decorative', async () => {
    await render(template, { imports, providers: [provideCckTheme(themeConfig)] });
    const part = must(trigger().querySelector(`.${classes.dropdownIcon}`));
    expect(held(part)).toEqual({ name: 'chevron-down', d: 'M-chevron' });
    expect(part.getAttribute('aria-hidden')).toBe('true');
    expect(must(part.querySelector('.cck-svg-icon')).getAttribute('aria-hidden')).toBe('true');
    expect(trigger().getAttribute('aria-label')).toBe('Dish');
  });

  it('holds the theme icon in the indicator of the selected option only', async () => {
    const user = userEvent.setup();
    await render(template, { imports, providers: [provideCckTheme(themeConfig)] });
    await user.click(trigger());
    const options = await screen.findAllByRole('option');
    const indicators = options.map((option) => held(must(option.querySelector(`.${classes.optionIndicator}`))));
    expect(options.map((option) => option.getAttribute('aria-selected'))).toEqual(['false', 'true']);
    expect(indicators).toEqual([null, { name: 'check', d: 'M-check' }]);
  });

  it('moves the indicator icon with the selection', async () => {
    const user = userEvent.setup();
    await render(template, { imports, providers: [provideCckTheme(themeConfig)] });
    await user.click(trigger());
    await user.click(await screen.findByRole('option', { name: 'Cake' }));
    await user.click(trigger());
    const options = await screen.findAllByRole('option');
    expect(
      options.map((option) => held(must(option.querySelector(`.${classes.optionIndicator}`)))?.name ?? null),
    ).toEqual(['check', null]);
  });

  it('holds the icon in the indicator of every selected option with multiple', async () => {
    const user = userEvent.setup();
    await render(
      `<cck-select aria-label="Side" multiple [value]="['Rice', 'Beans']">
        <cck-select-option value="Rice">Rice</cck-select-option>
        <cck-select-option value="Beans">Beans</cck-select-option>
        <cck-select-option value="Corn">Corn</cck-select-option>
      </cck-select>`,
      { imports, providers: [provideCckTheme(themeConfig)] },
    );
    await user.click(trigger());
    const options = await screen.findAllByRole('option');
    expect(
      options.map((option) => held(must(option.querySelector(`.${classes.optionIndicator}`)))?.name ?? null),
    ).toEqual(['check', 'check', null]);
  });

  it.each([
    ['no theme', []],
    ['a theme with no part icons', [provideCckTheme(defineThemeConfig({ name: 'bare', components: {} }))]],
  ])('leaves the parts empty as before: %s', async (_name, providers) => {
    const user = userEvent.setup();
    await render(template, { imports, providers });
    expect(must(trigger().querySelector(`.${classes.dropdownIcon}`)).children).toHaveLength(0);
    await user.click(trigger());
    for (const option of await screen.findAllByRole('option')) {
      expect(must(option.querySelector(`.${classes.optionIndicator}`)).children).toHaveLength(0);
    }
  });

  it('draws an empty icon and reports it when the theme names an icon its set lacks', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const gap = defineThemeConfig({
      name: 'gap',
      components: {},
      icons: {},
      partIconNames: { select: { dropdownIcon: 'gone' } },
    });
    await render(template, { imports, providers: [provideCckTheme(gap)] });
    expect(held(must(trigger().querySelector(`.${classes.dropdownIcon}`)))?.d).toBeNull();
    await vi.waitFor(() => {
      expect(error).toHaveBeenCalledTimes(1);
    });
  });
});
