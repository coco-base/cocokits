import { Component } from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import { beforeEach, describe, expect, it } from 'vitest';
import { CckSelectImports, type SelectOpenChangeDetails } from '../index';
import { stubOverlayApis } from './overlay-stubs';

@Component({
  imports: [...CckSelectImports],
  template: `
    <div
      cckSelect
      aria-label="Dish"
      placeholder="Choose a dish"
      [closePredicate]="record"
      (openedChange)="opened.push($event)"
    >
      <div cckSelectOption value="Cake">Cake</div>
      <div cckSelectOption value="Pizza">Pizza</div>
    </div>
  `,
})
class Host {
  readonly opened: boolean[] = [];
  readonly details: SelectOpenChangeDetails[] = [];
  readonly record = (details: SelectOpenChangeDetails): boolean => {
    this.details.push(details);
    return true;
  };
}

describe('Select Escape right after the click that opened it', () => {
  beforeEach(() => {
    stubOverlayApis();
  });

  it('closes when Escape comes in the same task as the click, before the list has rendered', async () => {
    const { fixture } = await render(Host);
    const host = fixture.componentInstance;
    const trigger = screen.getByRole('combobox');
    trigger.click();
    // Focus is not on the trigger (Safari does not focus a button on click), so only the dismiss layer can hear it.
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    await fixture.whenStable();
    await waitFor(() => {
      expect(screen.queryByRole('listbox')).toBeNull();
    });
    expect(host.opened).toEqual([true, false]);
    expect(host.details.map((details) => details.reason)).toEqual(['escape']);
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });
});
