import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { CckRadioImports } from '@cocokits/angular/radio';
import { describe, expect, it } from 'vitest';
import { CckRadioGroupImports } from '../index';

const imports = [...CckRadioGroupImports, ...CckRadioImports];

const group = (attributes: string): string =>
  `<cck-radio-group aria-label="Plan" ${attributes}>
    <cck-radio submitValue="free">Free</cck-radio>
    <cck-radio submitValue="pro">Pro</cck-radio>
  </cck-radio-group>`;

describe('Radio group invalid state', () => {
  const rows = [
    { name: 'required, empty, not touched', attributes: 'required', shown: false },
    { name: 'required, empty, touched', attributes: 'required [touched]="true"', shown: true },
    { name: 'required, with a value, touched', attributes: 'required value="free" [touched]="true"', shown: false },
    { name: 'not required, empty, touched', attributes: '[touched]="true"', shown: false },
  ];

  it.each(rows)('$name', async ({ attributes, shown }) => {
    await render(group(attributes), { imports });
    const root = screen.getByRole('radiogroup');
    expect(root.getAttribute('aria-invalid')).toBe(shown ? 'true' : null);
    expect(root.hasAttribute('data-invalid')).toBe(shown);
    expect(root.hasAttribute('touched')).toBe(false);
  });

  it('shows the invalid state after the focus has left a required empty group', async () => {
    const user = userEvent.setup();
    await render(`<button type="button">before</button>${group('required')}`, { imports });
    const root = screen.getByRole('radiogroup');
    await user.tab();
    await user.tab();
    expect(root.hasAttribute('data-invalid')).toBe(false);
    await user.tab();
    expect(root.getAttribute('aria-invalid')).toBe('true');
    expect(root.hasAttribute('data-invalid')).toBe(true);
  });

  it('clears the invalid state once a radio is checked', async () => {
    const user = userEvent.setup();
    await render(group('required [touched]="true"'), { imports });
    const root = screen.getByRole('radiogroup');
    expect(root.hasAttribute('data-invalid')).toBe(true);
    await user.click(screen.getByRole('radio', { name: 'Free' }));
    expect(root.hasAttribute('data-invalid')).toBe(false);
    expect(root.hasAttribute('aria-invalid')).toBe(false);
  });

  it('shows the invalid state of a required empty group after a blocked submit, and a reset clears it', async () => {
    const { fixture } = await render(`<form>${group('required')}</form>`, { imports });
    const root = screen.getByRole('radiogroup');
    const form = root.closest('form');
    if (!form) throw new Error('No form rendered.');
    expect(form.checkValidity()).toBe(false);
    fixture.detectChanges();
    expect(root.getAttribute('aria-invalid')).toBe('true');
    expect(root.hasAttribute('data-invalid')).toBe(true);
    form.reset();
    await new Promise((resolve) => setTimeout(resolve, 0));
    fixture.detectChanges();
    expect(root.hasAttribute('aria-invalid')).toBe(false);
    expect(root.hasAttribute('data-invalid')).toBe(false);
  });
});
