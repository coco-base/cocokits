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
  `<div cckFormField ${attrs}><label cckLabel>Notifications</label>${control}<div cckHint>Weekly only.</div></div>`;

const kinds = [
  ['Checkbox', 'cckCheckbox'],
  ['Switch', 'cckSwitch'],
] as const;

describe.each(kinds)('%s accessibility', (_label, selector) => {
  it.each([
    ['alone', `<div ${selector}>Email me</div>`],
    ['checked', `<div ${selector} [checked]="true">Email me</div>`],
    ['disabled', `<div ${selector} disabled>Email me</div>`],
    ['read-only', `<div ${selector} readonly [checked]="true">Email me</div>`],
    ['with an aria-label only', `<div ${selector} aria-label="Email me"></div>`],
    ['in a field', field(`<div ${selector}>Email me</div>`)],
    ['required in a field', field(`<div ${selector}>Email me</div>`, 'required')],
    ['invalid and touched in a field', field(`<div ${selector} invalid touched>Email me</div>`)],
  ])('has no axe violations: %s', async (_name, template) => {
    const { container } = await render(template, { imports });
    expect((await axe(container)).violations).toEqual([]);
  });
});

describe('Checkbox accessibility', () => {
  it('has no axe violations while mixed', async () => {
    const { container } = await render(`<div cckCheckbox [indeterminate]="true">All</div>`, { imports });
    expect((await axe(container)).violations).toEqual([]);
    expect(screen.getByRole<HTMLInputElement>('checkbox', { name: 'All' }).indeterminate).toBe(true);
  });
});

describe('Switch accessibility', () => {
  it('has the role switch, no aria-checked and a name without the decoration', async () => {
    await render(`<div cckSwitch>Notify me</div>`, { imports });
    const input = screen.getByRole('switch', { name: 'Notify me' });
    expect(input.hasAttribute('aria-checked')).toBe(false);
  });

  it('toggles from the keyboard with Space', async () => {
    await render(`<div cckSwitch>Notify me</div>`, { imports });
    const input = screen.getByRole<HTMLInputElement>('switch');
    await userEvent.setup().tab();
    await userEvent.setup().keyboard(' ');
    expect(input.checked).toBe(true);
  });
});

describe('Radio accessibility', () => {
  it('has no axe violations alone', async () => {
    const { container } = await render(`<div cckRadio name="x">Free</div>`, { imports });
    expect((await axe(container)).violations).toEqual([]);
  });

  it('has no axe violations: three same-name radios in a fieldset', async () => {
    const { container } = await render(
      `<fieldset><legend>Plan</legend><div cckRadio name="plan" [checked]="true">Free</div><div cckRadio name="plan">Pro</div><div cckRadio name="plan" disabled>Team</div></fieldset>`,
      { imports },
    );
    expect((await axe(container)).violations).toEqual([]);
  });

  it('names each radio by its label and moves with the arrow keys', async () => {
    await render(
      `<fieldset><legend>Plan</legend><div cckRadio name="plan" [checked]="true">Free</div><div cckRadio name="plan">Pro</div></fieldset>`,
      { imports },
    );
    const user = userEvent.setup();
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('radio', { name: 'Free' }));
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole<HTMLInputElement>('radio', { name: 'Pro' }).checked).toBe(true);
  });
});
