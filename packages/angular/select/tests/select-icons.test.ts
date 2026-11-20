import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { provideCckIcons, provideCckTheme } from '@cocokits/angular-core';
import { heartIcon, plusIcon } from '@cocokits/icons';
import { selectAnatomy } from '@cocokits/machines/select';
import { defineThemeConfig } from '@cocokits/shared';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CckSelectImports } from '../index';
import { must, trigger } from './helpers';
import { stubOverlayApis } from './overlay-stubs';

const { classes } = selectAnatomy;
const imports = [...CckSelectImports];

const themeConfig = defineThemeConfig({
  name: 'test',
  components: { select: { icons: { dropdownIcon: 'plus', optionIndicator: 'heart' } } },
});
const registry = provideCckIcons({ icons: { plus: plusIcon, heart: heartIcon } });
const themed = [provideCckTheme(themeConfig), registry];

const template = `
  <cck-select aria-label="Dish" value="Pizza" placeholder="Choose">
    <cck-select-option value="Cake">Cake</cck-select-option>
    <cck-select-option value="Pizza">Pizza</cck-select-option>
  </cck-select>`;

/** The name of the icon the part holds, or null when the part is empty. */
function held(part: Element): string | null {
  return part.querySelector('.cck-svg-icon')?.getAttribute('data-icon') ?? null;
}

describe('Select part icons', () => {
  beforeEach(() => {
    stubOverlayApis();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('holds the theme icon in the dropdown icon, and the part stays decorative', async () => {
    await render(template, { imports, providers: themed });
    const part = must(trigger().querySelector(`.${classes.dropdownIcon}`));
    expect(held(part)).toBe('plus');
    expect(part.getAttribute('aria-hidden')).toBe('true');
    expect(must(part.querySelector('.cck-svg-icon')).getAttribute('aria-hidden')).toBe('true');
    expect(trigger().getAttribute('aria-label')).toBe('Dish');
  });

  it('holds the theme icon in the indicator of the selected option only', async () => {
    const user = userEvent.setup();
    await render(template, { imports, providers: themed });
    await user.click(trigger());
    const options = await screen.findAllByRole('option');
    const indicators = options.map((option) => held(must(option.querySelector(`.${classes.optionIndicator}`))));
    expect(options.map((option) => option.getAttribute('aria-selected'))).toEqual(['false', 'true']);
    expect(indicators).toEqual([null, 'heart']);
  });

  it('moves the indicator icon with the selection', async () => {
    const user = userEvent.setup();
    await render(template, { imports, providers: themed });
    await user.click(trigger());
    await user.click(await screen.findByRole('option', { name: 'Cake' }));
    await user.click(trigger());
    const options = await screen.findAllByRole('option');
    expect(options.map((option) => held(must(option.querySelector(`.${classes.optionIndicator}`))))).toEqual([
      'heart',
      null,
    ]);
  });

  it('holds the icon in the indicator of every selected option with multiple', async () => {
    const user = userEvent.setup();
    await render(
      `<cck-select aria-label="Side" multiple [value]="['Rice', 'Beans']">
        <cck-select-option value="Rice">Rice</cck-select-option>
        <cck-select-option value="Beans">Beans</cck-select-option>
        <cck-select-option value="Corn">Corn</cck-select-option>
      </cck-select>`,
      { imports, providers: themed },
    );
    await user.click(trigger());
    const options = await screen.findAllByRole('option');
    expect(options.map((option) => held(must(option.querySelector(`.${classes.optionIndicator}`))))).toEqual([
      'heart',
      'heart',
      null,
    ]);
  });

  it.each([
    ['no theme', []],
    ['a theme with no part icons', [provideCckTheme(defineThemeConfig({ name: 'bare', components: {} }))]],
  ])('draws the default icons: %s', async (_name, providers) => {
    const user = userEvent.setup();
    await render(template, { imports, providers });
    expect(held(must(trigger().querySelector(`.${classes.dropdownIcon}`)))).toBe('chevron-down');
    await user.click(trigger());
    const options = await screen.findAllByRole('option');
    expect(options.map((option) => held(must(option.querySelector(`.${classes.optionIndicator}`))))).toEqual([
      null,
      'check',
    ]);
  });

  it('draws a theme icon that is registered lazily', async () => {
    await render(template, {
      imports,
      providers: [
        provideCckTheme(themeConfig),
        provideCckIcons({ lazyIcons: { plus: () => Promise.resolve(plusIcon) } }),
      ],
    });
    expect(held(must(trigger().querySelector(`.${classes.dropdownIcon}`)))).toBe('plus');
  });

  it('draws the default and reports it when the theme names an icon that is not registered', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    await render(template, { imports, providers: [provideCckTheme(themeConfig)] });
    expect(held(must(trigger().querySelector(`.${classes.dropdownIcon}`)))).toBe('chevron-down');
    const messages = (): string[] => error.mock.calls.map((call) => String(call[0]));
    await vi.waitFor(() => {
      expect(messages().filter((message) => message.includes('"plus" for select.dropdownIcon'))).toHaveLength(1);
    });
  });
});
