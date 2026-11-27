import { Component, signal } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { selectAnatomy } from '@cocokits/machines/select';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CckSelectImports } from '../index';
import { activeName, must, trigger } from './helpers';
import { stubOverlayApis } from './overlay-stubs';

const { classes } = selectAnatomy;
const imports = [...CckSelectImports];

@Component({
  imports,
  template: `
    <cck-select [(value)]="value" aria-label="Plan">
      <cck-select-option value="free">Free</cck-select-option>
      <cck-select-option value="pro">
        <cck-select-option-description>For teams</cck-select-option-description>
        Pro
        <cck-select-option-leading>P</cck-select-option-leading>
      </cck-select-option>
    </cck-select>
  `,
})
class Host {
  readonly value = signal<string | undefined>('pro');
}

const valueText = (): string => trigger().querySelector(`.${classes.value}`)?.textContent.trim() ?? '';
const pro = (): HTMLElement => must(document.querySelector<HTMLElement>(`.${classes.option}:nth-of-type(2)`));

describe('Select option', () => {
  beforeEach(() => {
    stubOverlayApis();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows only the text of the option in the trigger, without its leading part and description', async () => {
    const { fixture } = await render(Host);
    await fixture.whenStable();
    expect(valueText()).toBe('Pro');
  });

  it('puts the leading part and the description beside the text, in the order indicator, leading, text, description', async () => {
    const user = userEvent.setup();
    await render(Host);
    await user.click(trigger());
    await screen.findByRole('listbox');
    const parts = [...pro().children].map((child) => child.className);
    expect(parts).toEqual([
      classes.optionIndicator,
      classes.optionLeading,
      classes.optionContent,
      classes.optionDescription,
    ]);
    expect(must(pro().querySelector(`.${classes.optionContent}`)).textContent.trim()).toBe('Pro');
  });

  it('finds the option by its text alone when the user types', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(Host);
    fixture.componentInstance.value.set(undefined);
    await user.click(trigger());
    await screen.findByRole('listbox');
    await user.keyboard('p');
    expect(activeName()).toContain('Pro');
    await user.keyboard('{Enter}');
    expect(fixture.componentInstance.value()).toBe('pro');
    expect(valueText()).toBe('Pro');
  });
});
