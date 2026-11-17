import { describe, expect, it } from 'vitest';
import { cocokitsThemeConfig } from '../src/index';
import { declarationsOfAll, read, ref, sizeTokenOf, structureTokenOf, tokensCss } from './css-test-helpers';

/** The theme rules of the parts the framework builders added (step 7 of job 061), and their icon size tokens (C13). */
const styles = read('dist', 'styles.css');
const rule = (selector: string, css = styles): string => declarationsOfAll(css, selector);

describe('checkbox group', () => {
  it('is a column with a 12px gap (spacing-5), a wrapping row when horizontal, and restates [hidden]', () => {
    const css = read('dist', 'components', 'checkbox-group.css');
    expect(css.startsWith('@layer cocokits {')).toBe(true);
    expect(structureTokenOf('.cck-checkbox-group', 'checkbox-group-gap')).toBe(ref('spacing-5'));
    expect(structureTokenOf('.cck-checkbox-group', 'checkbox-group-inline-gap')).toBe(ref('spacing-5'));
    const group = rule('.cck-checkbox-group', css);
    expect(group).toContain('flex-direction: column');
    expect(group).toContain('gap: var(--cck-checkbox-group-gap)');
    expect(group).toContain('box-sizing: border-box');
    expect(rule('.cck-checkbox-group[data-orientation=horizontal]', css)).toContain('flex-wrap: wrap');
    expect(rule('.cck-checkbox-group[hidden]', css)).toContain('display: none');
    expect(styles).toContain('.cck-checkbox-group {');
  });

  it('is supported with no options', () => {
    expect(cocokitsThemeConfig.components['checkbox-group']).toEqual({});
  });
});

describe('chip check and selected chip', () => {
  const chip = '.cck-chip';

  it.each([
    ['sm', 'size-12', 'spacing-3'],
    ['md', 'size-16', 'spacing-4'],
    ['lg', 'size-20', 'spacing-5'],
  ])('size %s: the check is %s, the chip then starts with %s of padding', (mode, icon, padding) => {
    expect(sizeTokenOf(chip, mode, 'chip-check-icon-size')).toBe(ref(icon));
    expect(sizeTokenOf(chip, mode, 'chip-check-padding-inline-start')).toBe(ref(padding));
    expect(sizeTokenOf('.cck-chip-list', mode, 'chip-list-chip-check-icon-size')).toBe(ref(icon));
    expect(sizeTokenOf('.cck-chip-list', mode, 'chip-list-chip-check-padding-inline-start')).toBe(ref(padding));
  });

  it('draws the check as a box whose font size is the icon size, only while the chip is selected', () => {
    const check = rule('.cck-chip__check');
    expect(check).toContain('font-size: var(--cck-chip-check-icon-size)');
    expect(check).toContain('box-sizing: border-box');
    expect(rule('.cck-chip__check:not([data-state=checked])')).toContain('display: none');
    expect(rule('.cck-chip:has(> .cck-chip__check[data-state=checked])')).toContain(
      'padding-inline-start: var(--cck-chip-check-padding-inline-start)',
    );
  });

  it('fills a selected chip with the brand colour, in :where() so the disabled look wins by source order', () => {
    const selector = '.cck-chip:where(:has(> .cck-chip__content-wrapper[data-selected]))';
    const selected = rule(selector);
    expect(selected).toContain('background-color: var(--cck-chip-selected-bg)');
    expect(selected).toContain('color: var(--cck-chip-selected-text-color)');
    expect(selected).toContain('border-color: var(--cck-chip-selected-border-color)');
    expect(styles.indexOf('.cck-chip[data-disabled]')).toBeGreaterThan(styles.indexOf(selector));
    expect(structureTokenOf(chip, 'chip-selected-bg')).toBe(ref('brand-color'));
    expect(structureTokenOf(chip, 'chip-selected-text-color')).toBe(ref('brand-on-color'));
    expect(structureTokenOf(chip, 'chip-selected-border-color')).toBe(ref('brand-edge'));
  });

  it('resets the toggle button to the look of the pill and keeps the pointer for a toggle only', () => {
    const content = rule('.cck-chip__content-wrapper');
    for (const line of ['border: 0', 'background: none', 'color: inherit', 'font: inherit', 'padding: 0']) {
      expect(content).toContain(line);
    }
    expect(rule('.cck-chip__content-wrapper[type=button]')).toContain('cursor: pointer');
  });

  it('names the check icon of the theme', () => {
    expect(cocokitsThemeConfig.components.chip.icons.check).toBe('check');
  });
});

describe('menu parts', () => {
  const content = '.cck-menu__content';
  const sub = '.cck-menu__sub-content';

  it('gives the submenu content the size modes and the structure tokens of the content', () => {
    for (const mode of ['sm', 'md', 'lg']) {
      expect(sizeTokenOf(sub, mode, 'menu-item-height')).toBe(sizeTokenOf(content, mode, 'menu-item-height'));
      expect(sizeTokenOf(sub, mode, 'menu-item-icon-size')).toBeDefined();
    }
    expect(structureTokenOf(sub, 'menu-min-inline-size')).toBe('220px');
    expect(structureTokenOf(sub, 'menu-side-offset')).toBe(ref('spacing-4'));
  });

  it('draws the content and the submenu content from one rule', () => {
    const panel = rule(sub);
    expect(panel).toContain('background-color: var(--cck-menu-bg)');
    expect(panel).toContain('--side-offset: var(--cck-menu-side-offset)');
    expect(panel).not.toMatch(/(^|[\s;])(position|inset|top|left|right|bottom|transform)\s*:/);
    expect(rule(`${sub}[hidden]`)).toContain('display: none');
  });

  it.each(['.cck-menu__checkbox-item', '.cck-menu__radio-item', '.cck-menu__sub-trigger'])(
    '%s shares the look of the item',
    (selector) => {
      const item = rule(selector);
      expect(item).toContain('min-block-size: var(--cck-menu-item-height)');
      expect(item).toContain('box-sizing: border-box');
      expect(rule(`${selector}[hidden]`)).toContain('display: none');
      expect(rule(`${selector}[data-disabled]`)).toContain('color: var(--cck-menu-item-disabled-text-color)');
      expect(rule(`${selector}[data-color=danger]`)).toContain('color: var(--cck-menu-item-danger-color)');
      expect(rule(`${selector}[data-state=checked]`)).toContain('background-color: var(--cck-menu-item-selected-bg)');
    },
  );

  it('fills a checked item with surface/2, colours the indicator brand and the danger item danger/text', () => {
    expect(structureTokenOf(content, 'menu-item-selected-bg')).toBe(ref('surface-2'));
    expect(structureTokenOf(content, 'menu-item-indicator-color')).toBe(ref('brand-color'));
    expect(structureTokenOf(content, 'menu-item-danger-color')).toBe(ref('danger-text'));
  });

  it.each(['leading', 'trailing', 'indicator'])(
    'sizes the item %s part from the icon size of the size mode (C13), so its icon follows it',
    (part) => {
      const css = rule(`.cck-menu__item-${part}`);
      expect(css).toContain('font-size: var(--cck-menu-item-icon-size)');
      expect(css).toContain('box-sizing: border-box');
      expect(rule(`.cck-menu__item-${part}[hidden]`)).toContain('display: none');
    },
  );

  it('keeps the indicator box while the item is not checked, so the text lines up', () => {
    expect(rule('.cck-menu__item-indicator:not([data-state=checked])')).toContain('visibility: hidden');
  });

  it('sets the supporting text, the shortcut and the group label in 14px/400 text/3', () => {
    expect(structureTokenOf(content, 'menu-item-secondary-color')).toBe(ref('text-3'));
    expect(structureTokenOf(content, 'menu-item-secondary-font-size')).toBe(ref('text-sm-font-size'));
    expect(structureTokenOf(content, 'menu-item-secondary-font-weight')).toBe(ref('font-weight-regular'));
    for (const selector of ['.cck-menu__item-supporting-text', '.cck-menu__item-shortcut', '.cck-menu__group-label']) {
      expect(rule(selector), selector).toContain('color: var(--cck-menu-item-secondary-color)');
      expect(rule(selector), selector).toContain('font-weight: var(--cck-menu-item-secondary-font-weight)');
    }
  });

  it('puts the supporting text on a line of its own and the shortcut at the end', () => {
    expect(rule('.cck-menu__item-supporting-text')).toContain('flex: 1 0 100%');
    expect(rule('.cck-menu__item-shortcut')).toContain('white-space: nowrap');
    expect(rule('.cck-menu__item-shortcut ~ .cck-menu__item-trailing')).toContain('margin-inline-start: 0');
  });

  it('stacks a group and a radio group', () => {
    expect(rule('.cck-menu__group')).toContain('flex-direction: column');
    expect(rule('.cck-menu__radio-group')).toContain('flex-direction: column');
  });

  it('has a colour option on the four item parts and a size option on both contents', () => {
    const { size, color, icons } = cocokitsThemeConfig.components.menu;
    expect(size.partNames).toEqual(['content', 'subContent']);
    expect(color.attrName).toBe('color');
    expect(color.values).toEqual(['default', 'danger']);
    expect(color.default).toBe('default');
    expect(color.partNames).toEqual(['item', 'checkboxItem', 'radioItem', 'subTrigger']);
    expect(icons.itemIndicator).toBe('check');
  });
});

describe('select parts', () => {
  const content = '.cck-select__content';

  it('gives the option leading part an icon size that aliases Core / Size (C13)', () => {
    expect(structureTokenOf(content, 'select-option-leading-icon-size')).toBe(ref('size-20'));
    const leading = rule('.cck-select__option-leading');
    expect(leading).toContain('font-size: var(--cck-select-option-leading-icon-size)');
    expect(leading).toContain('order: 1');
  });

  it('orders the option row: box, leading, text, then the check', () => {
    expect(rule('.cck-select__option-content')).toContain('order: 2');
    expect(rule('.cck-select__option-indicator')).toContain('order: 3');
  });

  it('keeps the header and the footer at the ends of the list with a border divider', () => {
    expect(rule('.cck-select__header')).toContain('position: sticky');
    expect(rule('.cck-select__header')).toContain('border-block-end: var(--cck-select-content-border-width) solid');
    expect(rule('.cck-select__footer')).toContain('border-block-start: var(--cck-select-content-border-width) solid');
    expect(rule('.cck-select__footer')).toContain('justify-content: flex-end');
    expect(structureTokenOf(content, 'select-footer-gap')).toBe(ref('spacing-4'));
    expect(structureTokenOf(content, 'select-footer-padding')).toBe(ref('spacing-5'));
    expect(structureTokenOf(content, 'select-header-padding-inline')).toBe(ref('spacing-5'));
  });

  it('draws the search with no box of its own and rings the header while it has focus', () => {
    const search = rule('.cck-select__search');
    expect(search).toContain('border: 0');
    expect(search).toContain('background-color: transparent');
    expect(rule('.cck-select__header:has(> .cck-select__search:focus-visible)')).toContain(
      'outline: var(--cck-select-focus-width) solid var(--cck-select-focus-color)',
    );
    expect(structureTokenOf(content, 'select-search-placeholder-color')).toBe(ref('text-3'));
  });

  it('takes no box while the empty status region has no text, and stays in the accessibility tree', () => {
    const empty = rule('.cck-select__empty:empty');
    expect(empty).toContain('padding: 0');
    expect(empty).toContain('block-size: 0');
    expect(empty).not.toContain('display');
    expect(rule('.cck-select__empty')).toContain('display: block');
  });

  it('shows the empty message and the count in text/3, the description in 14px/400 text/2', () => {
    expect(structureTokenOf(content, 'select-empty-color')).toBe(ref('text-3'));
    expect(structureTokenOf('.cck-select', 'select-count-color')).toBe(ref('text-3'));
    expect(structureTokenOf(content, 'select-option-description-color')).toBe(ref('text-2'));
    expect(structureTokenOf(content, 'select-option-description-font-size')).toBe(ref('text-sm-font-size'));
    expect(structureTokenOf(content, 'select-option-description-font-weight')).toBe(ref('font-weight-regular'));
    expect(rule('.cck-select__option-description')).toContain('display: block');
    expect(rule('.cck-select__count')).toContain('color: var(--cck-select-count-color)');
  });

  it('puts the description on a row of its own under the text, indented past the leading part and the box', () => {
    const description = rule('.cck-select__option-description');
    expect(description).toContain('flex: 1 0 100%');
    expect(description).toContain('order: 4');
    expect(rule('.cck-select__option')).toContain('flex-wrap: wrap');
    expect(rule('.cck-select__option:has(> .cck-select__option-leading) > .cck-select__option-description')).toContain(
      'padding-inline-start: calc(var(--cck-select-option-leading-icon-size) + var(--cck-select-option-gap))',
    );
    expect(styles).toContain(
      '.cck-select__content:is([data-multiple]:not([data-indicator]), [data-indicator=checkbox]) .cck-select__option > .cck-select__option-description {\n    padding-inline-start: calc(var(--cck-select-indicator-size) + var(--cck-select-option-gap));',
    );
  });

  it('dims the count in a disabled trigger', () => {
    expect(styles).toMatch(/\.cck-select__count,[^{]*\{[^}]*color: var\(--cck-select-disabled-text-color\)/);
  });
});

describe('tooltip parts', () => {
  const content = '.cck-tooltip__content';

  it('puts 4px (spacing-3) between the title and the description, and the description in 12px/400', () => {
    expect(structureTokenOf(content, 'tooltip-text-gap')).toBe(ref('spacing-3'));
    expect(structureTokenOf(content, 'tooltip-description-font-weight')).toBe(ref('font-weight-regular'));
    expect(sizeTokenOf(content, 'md', 'tooltip-description-font-size')).toBe(ref('text-xs-font-size'));
    expect(sizeTokenOf(content, 'sm', 'tooltip-description-font-size')).toBe(ref('text-xs-font-size'));
    expect(sizeTokenOf(content, 'lg', 'tooltip-description-font-size')).toBe(ref('text-sm-font-size'));
    expect(rule('.cck-tooltip__title + .cck-tooltip__description')).toContain(
      'padding-block-start: var(--cck-tooltip-text-gap)',
    );
    const description = rule('.cck-tooltip__description');
    expect(description).toContain('font-size: var(--cck-tooltip-description-font-size)');
    expect(description).toContain('font-weight: var(--cck-tooltip-description-font-weight)');
    expect(description).not.toContain('color:');
  });

  it('makes both parts blocks and restates [hidden]', () => {
    for (const part of ['title', 'description']) {
      expect(rule(`.cck-tooltip__${part}`)).toContain('display: block');
      expect(rule(`.cck-tooltip__${part}[hidden]`)).toContain('display: none');
    }
  });

  it.each(['tooltip', 'popover'])('makes the %s arrow a block, as an arrow may be a custom tag', (block) => {
    expect(rule(`.cck-${block}__arrow`)).toContain('display: block');
  });
});

describe('dialog parts', () => {
  it('lays the header, the body and the footer across the content with border dividers', () => {
    for (const part of ['header', 'body', 'footer']) {
      expect(rule(`.cck-dialog__${part}`)).toContain('align-self: stretch');
      expect(rule(`.cck-dialog__${part}`)).toContain('box-sizing: border-box');
      expect(rule(`.cck-dialog__${part}[hidden]`)).toContain('display: none');
    }
    expect(rule('.cck-dialog__header')).toContain('border-block-end: var(--cck-dialog-divider-width) solid');
    expect(rule('.cck-dialog__footer')).toContain('border-block-start: var(--cck-dialog-divider-width) solid');
    expect(structureTokenOf('.cck-dialog__content', 'dialog-divider-color')).toBe(ref('border-2'));
  });

  it('puts the footer actions in one row at the end, 8px apart (spacing-4)', () => {
    const footer = rule('.cck-dialog__footer');
    expect(footer).toContain('display: flex');
    expect(footer).toContain('justify-content: flex-end');
    expect(footer).toContain('gap: var(--cck-dialog-section-gap)');
    expect(structureTokenOf('.cck-dialog__content', 'dialog-section-gap')).toBe(ref('spacing-4'));
  });

  it('puts the title and the Close part of the header on one row, apart', () => {
    const header = rule('.cck-dialog__header');
    expect(header).toContain('display: flex');
    expect(header).toContain('justify-content: space-between');
  });
});

describe('icon size tokens of the new parts (C13)', () => {
  it('aliases Core / Size, never a literal', () => {
    for (const name of ['chip-check-icon-size', 'select-option-leading-icon-size', 'select-header-icon-size']) {
      const match = new RegExp(`--cck-${name}: ([^;]+);`).exec(tokensCss);
      expect(match?.[1], name).toMatch(/^var\(--cck-size-\d+\)$/);
    }
  });
});
