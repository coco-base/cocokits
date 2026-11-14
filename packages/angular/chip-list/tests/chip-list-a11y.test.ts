import { render, screen } from '@testing-library/angular';
import { CckFormFieldImports } from '@cocokits/angular/form-field';
import { CckHintImports } from '@cocokits/angular/hint';
import { CckLabelImports } from '@cocokits/angular/label';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { CckChipListImports } from '../index';

const imports = [...CckChipListImports, ...CckFormFieldImports, ...CckLabelImports, ...CckHintImports];

const field = (attrs: string, list: string): string =>
  `<cck-form-field ${attrs}><label cckLabel>Dishes</label><cck-chip-list ${list} [value]="['Pizza', 'Salad']" /><cck-hint>Press Enter to add.</cck-hint></cck-form-field>`;

describe('Chip list accessibility', () => {
  it.each([
    ['a labelled standalone list', `<cck-chip-list aria-label="Dishes" [value]="['Pizza']" />`],
    ['an empty list with a placeholder', `<cck-chip-list aria-label="Dishes" placeholder="Add" />`],
    ['a list in a FormField', field('', '')],
    ['a required list in a FormField', field('required', '')],
    ['an invalid, touched list in a FormField', field('', 'invalid touched')],
    ['a disabled list', field('disabled', '')],
    ['a read-only list', field('readonly', '')],
    [
      'a list with hidden inputs',
      `<form><cck-chip-list aria-label="Dishes" name="dish" required [value]="['a']" /></form>`,
    ],
  ])('has no axe violations: %s', async (_name, template) => {
    const { container } = await render(template, { imports });
    expect((await axe(container)).violations).toEqual([]);
  });

  it('is named by the label, described by the hint, and each remove button by its chip text', async () => {
    await render(field('', ''), { imports });
    const input = screen.getByRole('textbox', { name: 'Dishes', description: 'Press Enter to add.' });
    expect(input.getAttribute('aria-required')).toBeNull();
    expect(screen.getByRole('button', { name: 'Pizza' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Salad' })).toBeTruthy();
  });

  it('keeps the hidden inputs out of the accessibility tree', async () => {
    const { container } = await render(`<cck-chip-list aria-label="Dishes" name="dish" [value]="['a']" />`, {
      imports,
    });
    expect(screen.getAllByRole('textbox')).toHaveLength(1);
    expect(container.querySelectorAll('input[aria-hidden="true"]')).toHaveLength(1);
  });
});
