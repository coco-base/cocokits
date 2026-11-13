import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { CckAccordionImports } from '@cocokits/angular/accordion';
import { CckCheckboxImports } from '@cocokits/angular/checkbox';
import { CckSelectImports } from '@cocokits/angular/select';
import { cocokitsIcons, cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { beforeEach, describe, expect, it } from 'vitest';
import { providers } from './helpers';

/** The icon the part holds: its name and the paths drawn. */
function held(part: Element | null): { name: string | null; d: (string | null)[] } | null {
  const root = part?.querySelector('.cck-svg-icon');
  if (!root) return null;
  return {
    name: root.getAttribute('data-icon-name'),
    d: [...root.querySelectorAll('path')].map((path) => path.getAttribute('d')),
  };
}

const drawing = (name: keyof typeof cocokitsIcons): (string | null)[] =>
  cocokitsIcons[name].paths.map((path) => path.d);

describe('the part icons of the cocokits theme', () => {
  beforeEach(() => {
    // jsdom has no Popover API and no scrollIntoView, which the open list of the Select uses.
    HTMLElement.prototype.showPopover = function (this: HTMLElement) {
      this.style.display = 'block';
    };
    HTMLElement.prototype.hidePopover = () => undefined;
    Element.prototype.scrollIntoView = () => undefined;
  });

  it('names an icon of the pack for each part', () => {
    const names = cocokitsThemeConfig.partIconNames;
    expect(names).toEqual({
      select: { dropdownIcon: 'chevron-down', optionIndicator: 'check' },
      accordion: { indicator: 'chevron-down' },
      checkbox: { background: 'check' },
    });
  });

  it('draws the chevron in the Select trigger and the check in the selected option', async () => {
    const user = userEvent.setup();
    await render(
      `<cck-select aria-label="Dish" value="Pizza"><cck-select-option value="Cake">Cake</cck-select-option><cck-select-option value="Pizza">Pizza</cck-select-option></cck-select>`,
      { imports: [...CckSelectImports], providers },
    );
    const combobox = screen.getByRole('combobox');
    expect(held(combobox.querySelector('.cck-select__dropdown-icon'))).toEqual({
      name: 'chevron-down',
      d: drawing('chevron-down'),
    });
    await user.click(combobox);
    const options = await screen.findAllByRole('option');
    expect(options.map((option) => held(option.querySelector('.cck-select__option-indicator')))).toEqual([
      null,
      { name: 'check', d: drawing('check') },
    ]);
  });

  it('draws the chevron in the Accordion indicator', async () => {
    await render(`<cck-accordion><cck-accordion-item label="Shipping">Body</cck-accordion-item></cck-accordion>`, {
      imports: [...CckAccordionImports],
      providers,
    });
    expect(held(screen.getByRole('button', { name: 'Shipping' }).lastElementChild)).toEqual({
      name: 'chevron-down',
      d: drawing('chevron-down'),
    });
  });

  it('draws the check in the Checkbox background while checked', async () => {
    const { container } = await render(
      `<cck-checkbox aria-label="A" [checked]="true">A</cck-checkbox><cck-checkbox aria-label="B">B</cck-checkbox>`,
      { imports: [...CckCheckboxImports], providers },
    );
    const [checked, unchecked] = [...container.querySelectorAll('.cck-checkbox__background')];
    expect(held(checked)).toEqual({ name: 'check', d: drawing('check') });
    expect(held(unchecked)).toBeNull();
  });
});
