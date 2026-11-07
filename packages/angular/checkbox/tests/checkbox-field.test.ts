import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { CckFormFieldImports } from '@cocokits/angular/form-field';
import { CckHintImports } from '@cocokits/angular/hint';
import { CckLabelImports } from '@cocokits/angular/label';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CckCheckboxImports } from '../index';
import { box, isSet, must } from './fixtures';

const imports = [...CckCheckboxImports, ...CckFormFieldImports, ...CckLabelImports, ...CckHintImports];

const field = (fieldAttrs: string, checkboxAttrs = ''): string =>
  `<div cckFormField id="f" ${fieldAttrs}><label cckLabel>Notifications</label><div cckCheckbox ${checkboxAttrs}>Email me</div><div cckHint>Weekly only.</div></div>`;

describe('Checkbox in a FormField', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('gives the input the control id and points both labels at it', async () => {
    const { container } = await render(field(''), { imports });
    expect(box().id).toBe('f-control');
    expect(container.querySelector('.cck-label')?.getAttribute('for')).toBe('f-control');
    expect(container.querySelector('.cck-checkbox__label')?.getAttribute('for')).toBe('f-control');
    expect(box().labels?.length).toBe(2);
  });

  it('computes the name from the field label, then the inner label', async () => {
    await render(field(''), { imports });
    expect(screen.getByRole('checkbox', { name: 'Notifications Email me' })).toBe(box());
  });

  it('ends aria-describedby with the feedback wrapper', async () => {
    await render(field('', 'aria-describedby="note"'), { imports });
    expect(box().getAttribute('aria-describedby')).toBe('note f-feedback');
  });

  it('is described by the hint', async () => {
    await render(field(''), { imports });
    expect(screen.getByRole('checkbox', { description: 'Weekly only.' })).toBe(box());
  });

  it('lets an author id win and the labels follow it', async () => {
    const { container } = await render(field('', 'id="mine"'), { imports });
    expect(box().id).toBe('mine');
    expect(container.querySelector('.cck-checkbox__label')?.getAttribute('for')).toBe('mine');
    expect(container.querySelector('.cck-label')?.getAttribute('for')).toBe('mine');
  });

  it('passes the field disabled, required, readonly and invalid to the input', async () => {
    const { container } = await render(field('disabled required readonly invalid'), { imports });
    expect(box().disabled).toBe(true);
    expect(box().required).toBe(true);
    expect(box().getAttribute('aria-readonly')).toBe('true');
    expect(isSet(must(container.querySelector('.cck-checkbox')), 'data-invalid')).toBe(true);
    expect(container.querySelector('.cck-label__required-marker')?.textContent).toBe('*');
  });

  it('shows the control facts on the field root and data-filled while checked', async () => {
    const { container } = await render(field(''), { imports });
    const root = must(container.querySelector('.cck-form-field'));
    expect(isSet(root, 'data-filled')).toBe(false);
    await userEvent.setup().click(box());
    expect(isSet(root, 'data-filled')).toBe(true);
    expect(isSet(root, 'data-dirty')).toBe(true);
    expect(isSet(must(container.querySelector('.cck-checkbox')), 'data-filled')).toBe(false);
  });

  it('focuses the input from a click on the field box padding and keeps a label click native', async () => {
    const { container } = await render(field(''), { imports });
    const user = userEvent.setup();
    await user.click(must(container.querySelector('.cck-form-field__input-wrapper')));
    expect(document.activeElement).toBe(box());
    expect(box().checked).toBe(false);
    await user.click(must(container.querySelector('.cck-checkbox__label')));
    expect(box().checked).toBe(true);
  });

  it('keeps its own generated id as a second control and warns', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { container } = await render(
      `<div cckFormField id="g"><div cckCheckbox>One</div><div cckCheckbox>Two</div></div>`,
      { imports },
    );
    const [first, second] = [...container.querySelectorAll('input')];
    expect(first.id).toBe('g-control');
    expect(second.id).toMatch(/^cck-checkbox-/);
    expect(container.querySelectorAll('.cck-checkbox__label')[1].getAttribute('for')).toBe(second.id);
    expect(warn).toHaveBeenCalledTimes(1);
  });
});
