import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { provideCckTheme } from '@cocokits/angular-core';
import { CckAccordionImports } from '@cocokits/angular/accordion';
import { CckCheckboxImports } from '@cocokits/angular/checkbox';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { CckSelectImports } from '../index';
import { trigger } from './helpers';
import { stubOverlayApis } from './overlay-stubs';
import { partIconsTheme } from './part-icons-fixtures';

const imports = [...CckSelectImports, ...CckAccordionImports, ...CckCheckboxImports];
const providers = [provideCckTheme(partIconsTheme)];

describe('Part icons accessibility (axe)', () => {
  beforeEach(() => {
    stubOverlayApis();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([
    [
      'Select with the theme chevron',
      `<cck-select aria-label="Dish" value="Cake"><cck-select-option value="Cake">Cake</cck-select-option></cck-select>`,
    ],
    [
      'Accordion with the theme chevron',
      `<cck-accordion><cck-accordion-item label="Shipping">Rates</cck-accordion-item></cck-accordion>`,
    ],
    ['checked Checkbox with the theme tick', `<cck-checkbox [checked]="true">Terms</cck-checkbox>`],
  ])('has no violations: %s', async (_name, template) => {
    const { container } = await render(template, { imports, providers });
    expect((await axe(container)).violations).toEqual([]);
  });

  it('has no violations with the Select list open, the theme chevron and the option check shown', async () => {
    const user = userEvent.setup();
    await render(
      `<cck-select aria-label="Dish" value="Cake">
        <cck-select-option value="Cake">Cake</cck-select-option>
        <cck-select-option value="Pizza">Pizza</cck-select-option>
      </cck-select>`,
      { imports, providers },
    );
    await user.click(trigger());
    await screen.findAllByRole('option');
    expect(trigger().querySelectorAll('.cck-svg-icon')).toHaveLength(1);
    expect(document.querySelectorAll('.cck-select__option-indicator .cck-svg-icon')).toHaveLength(1);
    // The list sits in the overlay, outside the container, so scan the body. A test fragment has no landmarks.
    const page = await axe(document.body, { rules: { region: { enabled: false } } });
    expect(page.violations).toEqual([]);
  });
});
