import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { CckFormFieldImports } from '@cocokits/angular/form-field';
import { CckHintImports } from '@cocokits/angular/hint';
import { CckLabelImports } from '@cocokits/angular/label';
import { CckRadioImports } from '@cocokits/angular/radio';
import { CckSwitchImports } from '@cocokits/angular/switch';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { CckCheckboxImports } from '../index';

const imports = [
  ...CckCheckboxImports,
  ...CckSwitchImports,
  ...CckRadioImports,
  ...CckFormFieldImports,
  ...CckLabelImports,
  ...CckHintImports,
];

const field = (control: string, attrs = ''): string =>
  `<cck-form-field ${attrs}><label cckLabel>Notifications</label>${control}<cck-hint>Weekly only.</cck-hint></cck-form-field>`;

const kinds = [
  ['Checkbox', 'cck-checkbox'],
  ['Switch', 'cck-switch'],
] as const;

describe.each(kinds)('%s accessibility', (_label, selector) => {
  it.each([
    ['alone', `<${selector}>Email me</${selector}>`],
    ['checked', `<${selector} [checked]="true">Email me</${selector}>`],
    ['disabled', `<${selector} disabled>Email me</${selector}>`],
    ['read-only', `<${selector} readonly [checked]="true">Email me</${selector}>`],
    ['with an aria-label only', `<${selector} aria-label="Email me"></${selector}>`],
    ['in a field', field(`<${selector}>Email me</${selector}>`)],
    ['required in a field', field(`<${selector}>Email me</${selector}>`, 'required')],
    ['invalid and touched in a field', field(`<${selector} invalid touched>Email me</${selector}>`)],
  ])('has no axe violations: %s', async (_name, template) => {
    const { container } = await render(template, { imports });
    expect((await axe(container)).violations).toEqual([]);
  });
});

describe('Checkbox accessibility', () => {
  it('has no axe violations while mixed', async () => {
    const { container } = await render(`<cck-checkbox [indeterminate]="true">All</cck-checkbox>`, { imports });
    expect((await axe(container)).violations).toEqual([]);
    expect(screen.getByRole<HTMLInputElement>('checkbox', { name: 'All' }).indeterminate).toBe(true);
  });
});

describe('Switch accessibility', () => {
  it('has the role switch, no aria-checked and a name without the decoration', async () => {
    await render(`<cck-switch>Notify me</cck-switch>`, { imports });
    const input = screen.getByRole('switch', { name: 'Notify me' });
    expect(input.hasAttribute('aria-checked')).toBe(false);
  });

  it('toggles from the keyboard with Space', async () => {
    await render(`<cck-switch>Notify me</cck-switch>`, { imports });
    const input = screen.getByRole<HTMLInputElement>('switch');
    await userEvent.setup().tab();
    await userEvent.setup().keyboard(' ');
    expect(input.checked).toBe(true);
  });
});

describe('Radio accessibility', () => {
  it('has no axe violations alone', async () => {
    const { container } = await render(`<cck-radio name="x">Free</cck-radio>`, { imports });
    expect((await axe(container)).violations).toEqual([]);
  });

  it('has no axe violations: three same-name radios in a fieldset', async () => {
    const { container } = await render(
      `<fieldset><legend>Plan</legend><cck-radio name="plan" [checked]="true">Free</cck-radio><cck-radio name="plan">Pro</cck-radio><cck-radio name="plan" disabled>Team</cck-radio></fieldset>`,
      { imports },
    );
    expect((await axe(container)).violations).toEqual([]);
  });

  it('names each radio by its label and moves with the arrow keys', async () => {
    await render(
      `<fieldset><legend>Plan</legend><cck-radio name="plan" [checked]="true">Free</cck-radio><cck-radio name="plan">Pro</cck-radio></fieldset>`,
      { imports },
    );
    const user = userEvent.setup();
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('radio', { name: 'Free' }));
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole<HTMLInputElement>('radio', { name: 'Pro' }).checked).toBe(true);
  });
});
