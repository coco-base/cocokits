import { render, screen } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { CckChipImports } from '../index';

const imports = [...CckChipImports];

describe('Chip accessibility', () => {
  it.each([
    ['a plain chip', `<cck-chip>Pizza</cck-chip>`],
    ['a removable chip', `<cck-chip removable>Pizza</cck-chip>`],
    ['a disabled removable chip', `<cck-chip removable disabled>Pizza</cck-chip>`],
    ['a removable chip with hidden action text', `<cck-chip removable>Pizza<span hidden>, remove</span></cck-chip>`],
  ])('has no axe violations: %s', async (_name, template) => {
    const { container } = await render(template, { imports });
    expect((await axe(container)).violations).toEqual([]);
  });

  it('names the remove button by the chip text and hides the icon', async () => {
    await render(`<cck-chip removable>Pizza</cck-chip>`, { imports });
    const button = screen.getByRole('button', { name: 'Pizza' });
    expect(button.querySelector('.cck-svg-icon')?.getAttribute('aria-hidden')).toBe('true');
  });
});
