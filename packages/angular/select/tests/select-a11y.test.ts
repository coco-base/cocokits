import { signal } from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { CckFormFieldImports } from '@cocokits/angular/form-field';
import { CckHintImports } from '@cocokits/angular/hint';
import { CckLabelImports } from '@cocokits/angular/label';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { CckSelectImports } from '../index';
import { stubOverlayApis } from './overlay-stubs';

const imports = [...CckSelectImports, ...CckFormFieldImports, ...CckLabelImports];

/** The open list sits outside any landmark, because a component test has no page around it. */
const WITHOUT_REGION = { rules: { region: { enabled: false } } };

describe('Select accessibility', () => {
  beforeEach(() => {
    stubOverlayApis();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('is a select-only combobox: a named button with the listbox popup, owning a listbox of options', async () => {
    const user = userEvent.setup();
    await render(
      `<div cckSelect aria-label="Dish" value="Cake">
        <div cckSelectOptionGroup label="Desserts"><div cckSelectOption value="Cake">Cake</div></div>
        <div cckSelectOption value="Pizza" disabled>Pizza</div>
      </div>`,
      { imports },
    );
    const trigger = screen.getByRole('combobox', { name: 'Dish' });
    expect(trigger.tagName).toBe('BUTTON');
    expect(trigger.getAttribute('aria-haspopup')).toBe('listbox');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    await user.click(trigger);
    const list = await screen.findByRole('listbox', { name: 'Dish' });
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(trigger.getAttribute('aria-controls')).toBe(list.id);
    expect(trigger.getAttribute('aria-activedescendant')).toBe(screen.getByRole('option', { name: 'Cake' }).id);
    expect(screen.getByRole('option', { name: 'Cake' }).getAttribute('aria-selected')).toBe('true');
    expect(screen.getByRole('option', { name: 'Pizza' }).getAttribute('aria-selected')).toBe('false');
    expect(screen.getByRole('option', { name: 'Pizza' }).getAttribute('aria-disabled')).toBe('true');
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(trigger.getAttribute('aria-controls')).toBeNull();
    });
  });

  it('has no axe violations closed, open, multiple, and inside a FormField', async () => {
    const user = userEvent.setup();
    await render(
      `<main><div cckFormField>
        <label cckLabel>Dish</label>
        <div cckSelect multiple placeholder="Choose" name="dish" required>
          <div cckSelectOptionGroup label="Desserts"><div cckSelectOption value="Cake">Cake</div></div>
          <div cckSelectOption value="Pizza">Pizza</div>
        </div>
      </div></main>`,
      { imports },
    );
    expect((await axe(document.body)).violations).toEqual([]);
    await user.click(screen.getByRole('combobox'));
    await screen.findByRole('listbox');
    await user.keyboard('{ArrowDown}');
    expect((await axe(document.body, WITHOUT_REGION)).violations).toEqual([]);
    await user.keyboard(' ');
    expect((await axe(document.body, WITHOUT_REGION)).violations).toEqual([]);
  });

  it('warns once in dev mode about an option that holds a focusable element', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const user = userEvent.setup();
    await render(
      `<div cckSelect aria-label="Dish"><div cckSelectOption value="Cake"><a href="#x">Cake</a></div></div>`,
      { imports },
    );
    await user.click(screen.getByRole('combobox'));
    await screen.findByRole('listbox');
    await waitFor(() => {
      expect(warn.mock.calls.some(([message]) => String(message).includes('focusable'))).toBe(true);
    });
    expect(warn.mock.calls.filter(([message]) => String(message).includes('focusable'))).toHaveLength(1);
  });

  it('warns in dev mode about a Select with no accessible name', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    await render(`<div cckSelect><div cckSelectOption value="Cake">Cake</div></div>`, { imports });
    await waitFor(() => {
      expect(warn.mock.calls.some(([message]) => String(message).includes('accessible name'))).toBe(true);
    });
  });

  it('keeps an author aria-describedby on the trigger, after the ids of the field', async () => {
    await render(
      `<div cckFormField>
        <label cckLabel>Dish</label>
        <div cckSelect aria-describedby="mine"><div cckSelectOption value="Cake">Cake</div></div>
        <span cckHint>Pick one</span>
      </div>`,
      { imports: [...imports, ...CckHintImports] },
    );
    const described = screen.getByRole('combobox').getAttribute('aria-describedby') ?? '';
    expect(described.split(' ')).toContain('mine');
    expect(described.split(' ').length).toBeGreaterThan(1);
    expect(screen.getByRole('combobox').closest('[cckSelect]')?.hasAttribute('aria-describedby')).toBe(false);
  });

  it('names the open list by the label of the field, with no axe violation, and aria-label still wins', async () => {
    const user = userEvent.setup();
    await render(
      `<main><div cckFormField>
        <label cckLabel>Dish</label>
        <div cckSelect><div cckSelectOption value="Cake">Cake</div></div>
      </div></main>`,
      { imports },
    );
    await user.click(screen.getByRole('combobox'));
    const list = await screen.findByRole('listbox', { name: 'Dish' });
    expect(list.getAttribute('aria-labelledby')).toBe(document.querySelector('label')?.id);
    expect((await axe(document.body, WITHOUT_REGION)).violations).toEqual([]);
  });

  it('lets an author aria-label name the list inside a field', async () => {
    const user = userEvent.setup();
    await render(
      `<div cckFormField><label cckLabel>Dish</label>
        <div cckSelect aria-label="Mine"><div cckSelectOption value="Cake">Cake</div></div></div>`,
      { imports },
    );
    await user.click(screen.getByRole('combobox'));
    expect(await screen.findByRole('listbox', { name: 'Mine' })).toBeTruthy();
  });

  it('names the open list by the id the author wrote on the label inside a field', async () => {
    const user = userEvent.setup();
    await render(
      `<div cckFormField><label cckLabel id="my-label">Dish</label>
        <div cckSelect><div cckSelectOption value="Cake">Cake</div></div></div>`,
      { imports },
    );
    expect(document.querySelector('label')?.id).toBe('my-label');
    await user.click(screen.getByRole('combobox'));
    const list = await screen.findByRole('listbox', { name: 'Dish' });
    expect(list.getAttribute('aria-labelledby')).toBe('my-label');
  });

  it('follows a bound label id that changes while the list is open', async () => {
    const user = userEvent.setup();
    const labelId = signal('first');
    await render(
      `<div cckFormField><label cckLabel [id]="labelId()">Dish</label>
        <div cckSelect><div cckSelectOption value="Cake">Cake</div></div></div>`,
      { imports, componentProperties: { labelId } },
    );
    await user.click(screen.getByRole('combobox'));
    expect((await screen.findByRole('listbox', { name: 'Dish' })).getAttribute('aria-labelledby')).toBe('first');
    labelId.set('second');
    await waitFor(() => {
      expect(screen.getByRole('listbox', { name: 'Dish' }).getAttribute('aria-labelledby')).toBe('second');
    });
    expect(document.querySelector('label')?.id).toBe('second');
  });
});
