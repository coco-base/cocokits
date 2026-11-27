import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { CckFieldErrorImports } from '@cocokits/angular/field-error';
import { CckFormFieldImports } from '@cocokits/angular/form-field';
import { CckHintImports } from '@cocokits/angular/hint';
import { CckInputImports } from '@cocokits/angular/input';
import { CckLabelImports } from '@cocokits/angular/label';
import { CckLeadingImports } from '@cocokits/angular/leading';
import { CckRadioImports } from '@cocokits/angular/radio';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CckRadioGroupImports } from '../index';

const imports = [
  ...CckRadioGroupImports,
  ...CckRadioImports,
  ...CckFormFieldImports,
  ...CckLabelImports,
  ...CckHintImports,
  ...CckFieldErrorImports,
  ...CckLeadingImports,
  ...CckInputImports,
];

const radios = '<cck-radio submitValue="free">Free</cck-radio><cck-radio submitValue="pro">Pro</cck-radio>';

const field = (fieldAttributes = '', groupAttributes = ''): string =>
  `<cck-form-field id="f" ${fieldAttributes}>
    <label cckLabel>Plan</label>
    <cck-radio-group ${groupAttributes}>${radios}</cck-radio-group>
    <cck-hint>Billed monthly.</cck-hint>
    <cck-field-error>Pick a plan.</cck-field-error>
  </cck-form-field>`;

function group(container: Element): HTMLElement {
  const element = container.querySelector<HTMLElement>('cck-radio-group');
  if (!element) throw new Error('No cck-radio-group rendered.');
  return element;
}
const radio = (name: string): HTMLInputElement => screen.getByRole<HTMLInputElement>('radio', { name });

describe('Radio group in a FormField', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('is named by the Label through aria-labelledby and described by the hint, and the Label has no for', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { container } = await render(field(), { imports });
    const label = container.querySelector('label.cck-label');
    expect(label?.hasAttribute('for')).toBe(false);
    expect(group(container).getAttribute('aria-labelledby')).toBe(label?.id);
    expect(group(container).id).toBe('f-control');
    const hint = container.querySelector('cck-hint')?.id ?? '';
    expect(group(container).getAttribute('aria-describedby')).toBe(`${hint} f-error-1`);
    expect(screen.getByRole('radiogroup', { name: 'Plan' })).toBe(group(container));
    expect(warn).not.toHaveBeenCalled();
  });

  it('keeps an aria-label and an id of the author over the Label and the control id', async () => {
    const { container } = await render(field('', 'id="mine" aria-label="Mine"'), { imports });
    expect(group(container).hasAttribute('aria-labelledby')).toBe(false);
    expect(group(container).getAttribute('aria-label')).toBe('Mine');
    expect(group(container).id).toBe('mine');
  });

  it('takes the disabled and required state of the field', async () => {
    const { container } = await render(field('disabled required'), { imports });
    expect(group(container).getAttribute('aria-disabled')).toBe('true');
    expect(group(container).getAttribute('aria-required')).toBe('true');
    expect(radio('Free').disabled).toBe(true);
    expect(radio('Free').required).toBe(true);
  });

  it('shows the field error and the invalid state after a required group with no value is left', async () => {
    const user = userEvent.setup();
    const { container } = await render(`${field('', 'required')}<button type="button">after</button>`, {
      imports,
    });
    const error = (): string => container.querySelector('cck-field-error')?.textContent.trim() ?? '';
    expect(error()).toBe('');
    radio('Free').focus();
    await user.click(screen.getByRole('button', { name: 'after' }));
    expect(group(container).getAttribute('aria-invalid')).toBe('true');
    expect(error()).toBe('Pick a plan.');
  });

  it('does not claim the field from a zone', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { container } = await render(
      `<cck-form-field id="f"><label cckLabel>Plan</label><cck-radio-group cckLeading aria-label="Mode">${radios}</cck-radio-group></cck-form-field>`,
      { imports },
    );
    expect(group(container).id).toBe('');
    expect(group(container).hasAttribute('aria-labelledby')).toBe(false);
    expect(warn).not.toHaveBeenCalled();
  });

  it('keeps the field for the group when a control sits inside it', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { container } = await render(
      `<cck-form-field id="f"><label cckLabel>Plan</label><cck-radio-group>${radios}<input cckInput aria-label="Other" /></cck-radio-group></cck-form-field>`,
      { imports },
    );
    expect(group(container).id).toBe('f-control');
    expect(screen.getByRole('textbox', { name: 'Other' }).id).not.toBe('f-control');
    expect(screen.getByRole('radiogroup', { name: 'Plan' })).toBe(group(container));
    expect(warn).not.toHaveBeenCalled();
  });
});
