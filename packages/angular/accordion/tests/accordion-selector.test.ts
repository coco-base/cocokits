import { render } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { CckAccordionImports } from '../index';

describe('Accordion selectors', () => {
  it('creates no part from the attribute form on another element', async () => {
    const { container } = await render(`<div cckAccordion></div><div cckAccordionItem></div>`, {
      imports: [...CckAccordionImports],
    });
    expect(container.querySelector('[class*="cck-"]')).toBeNull();
  });
});
