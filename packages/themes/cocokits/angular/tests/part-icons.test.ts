import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { CckAccordionImports } from '@cocokits/angular/accordion';
import { CckCheckboxImports } from '@cocokits/angular/checkbox';
import { CckChipImports } from '@cocokits/angular/chip';
import { CckSelectImports } from '@cocokits/angular/select';
import { cocokitsThemeConfig, cocokitsThemeIcons } from '@cocokits/theme-cocokits';
import { beforeEach, describe, expect, it } from 'vitest';
import { providers } from './helpers';

/** The name of the icon the part holds, with the number of paths drawn. */
function held(part: Element | null): { name: string | null; paths: number } | null {
  const root = part?.querySelector('.cck-svg-icon');
  if (!root) return null;
  return { name: root.getAttribute('data-icon'), paths: root.querySelectorAll('path').length };
}

const drawn = (name: string): { name: string; paths: number } => ({ name, paths: 1 });

describe('the part icons of the cocokits theme', () => {
  beforeEach(() => {
    // jsdom has no Popover API and no scrollIntoView, which the open list of the Select uses.
    HTMLElement.prototype.showPopover = function (this: HTMLElement) {
      this.style.display = 'block';
    };
    HTMLElement.prototype.hidePopover = () => undefined;
    Element.prototype.scrollIntoView = () => undefined;
  });

  it('names a registered icon for each part', () => {
    const { select, accordion, checkbox, chip, menu } = cocokitsThemeConfig.components;
    const icons = {
      select: select.icons,
      accordion: accordion.icons,
      checkbox: checkbox.icons,
      chip: chip.icons,
      menu: menu.icons,
    };
    expect(icons).toEqual({
      select: { dropdownIcon: 'chevron-down', optionIndicator: 'check' },
      accordion: { indicator: 'chevron-down' },
      checkbox: { background: 'check' },
      chip: { remove: 'circle-xmark', check: 'check' },
      menu: { itemIndicator: 'check' },
    });
    for (const names of Object.values(icons)) {
      for (const name of Object.values(names)) expect(Object.keys(cocokitsThemeIcons)).toContain(name);
    }
  });

  it('draws the chevron in the Select trigger and the check in the selected option', async () => {
    const user = userEvent.setup();
    await render(
      `<cck-select aria-label="Dish" value="Pizza"><cck-select-option value="Cake">Cake</cck-select-option><cck-select-option value="Pizza">Pizza</cck-select-option></cck-select>`,
      { imports: [...CckSelectImports], providers },
    );
    const combobox = screen.getByRole('combobox');
    expect(held(combobox.querySelector('.cck-select__dropdown-icon'))).toEqual(drawn('chevron-down'));
    await user.click(combobox);
    const options = await screen.findAllByRole('option');
    expect(options.map((option) => held(option.querySelector('.cck-select__option-indicator')))).toEqual([
      null,
      drawn('check'),
    ]);
  });

  it('draws the chevron in the Accordion indicator', async () => {
    await render(`<cck-accordion><cck-accordion-item label="Shipping">Body</cck-accordion-item></cck-accordion>`, {
      imports: [...CckAccordionImports],
      providers,
    });
    expect(held(screen.getByRole('button', { name: 'Shipping' }).lastElementChild)).toEqual(drawn('chevron-down'));
  });

  it('draws the check in the Checkbox background while checked', async () => {
    const { container } = await render(
      `<cck-checkbox aria-label="A" [checked]="true">A</cck-checkbox><cck-checkbox aria-label="B">B</cck-checkbox>`,
      { imports: [...CckCheckboxImports], providers },
    );
    const [checked, unchecked] = [...container.querySelectorAll('.cck-checkbox__background')];
    expect(held(checked)).toEqual(drawn('check'));
    expect(held(unchecked)).toBeNull();
  });

  it('draws the check in a selected Chip, before its content, and the circle-xmark in its remove button', async () => {
    await render(`<cck-chip removable selected>Pizza</cck-chip>`, { imports: [...CckChipImports], providers });
    const chip = document.querySelector('.cck-chip');
    expect(held(chip?.querySelector('.cck-chip__check') ?? null)).toEqual(drawn('check'));
    expect(held(chip?.querySelector('.cck-chip__remove') ?? null)).toEqual(drawn('circle-xmark'));
    expect([...(chip?.children ?? [])].map((child) => child.className.split(' ')[0])).toEqual([
      'cck-chip__check',
      'cck-chip__content-wrapper',
      'cck-chip__remove',
    ]);
  });

  it('marks the check of a Chip that is selected, and not one that is not (the theme draws it from the mark)', async () => {
    await render(`<cck-chip [selected]="false">Off</cck-chip><cck-chip [selected]="true">On</cck-chip>`, {
      imports: [...CckChipImports],
      providers,
    });
    const [off, on] = [...document.querySelectorAll('.cck-chip__check')];
    expect(off.getAttribute('data-state')).toBeNull();
    expect(on.getAttribute('data-state')).toBe('checked');
  });
});
