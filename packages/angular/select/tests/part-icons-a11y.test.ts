import { render } from '@testing-library/angular';
import { provideCckTheme } from '@cocokits/angular-core';
import { CckAccordionImports } from '@cocokits/angular/accordion';
import { CckCheckboxImports } from '@cocokits/angular/checkbox';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { CckSelectImports } from '../index';
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
});
