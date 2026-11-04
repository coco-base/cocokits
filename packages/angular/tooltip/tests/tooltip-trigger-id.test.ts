import { Component, signal } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CckTooltipImports } from '../index';
import { stubOverlayApis } from './overlay-stubs';

@Component({
  imports: [...CckTooltipImports],
  template: `
    <ng-container cckTooltip>
      <button cckTooltipTrigger [id]="triggerId()" [aria-describedby]="ids()" aria-label="Copy link">Copy</button>
      <ng-template cckTooltipPortal><div cckTooltipContent>Copy the link</div></ng-template>
    </ng-container>
    <button cckTooltip="Save" [id]="saveId()" [aria-describedby]="ids()" aria-label="Store">Save</button>
    <i id="a">a</i><i id="b">b</i>
  `,
})
class Host {
  readonly triggerId = signal('first');
  readonly saveId = signal('save-1');
  readonly ids = signal('a');
}

describe('Tooltip trigger id and aria-describedby', () => {
  beforeEach(stubOverlayApis);
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('keeps the bound id and ids of the trigger part, follows changes and joins the content id', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(Host);
    const trigger = screen.getByRole('button', { name: 'Copy link' });
    expect(trigger.id).toBe('first');
    expect(trigger.getAttribute('aria-describedby')).toBe('a');
    await user.tab();
    const content = await screen.findByRole('tooltip');
    expect(trigger.getAttribute('aria-describedby')).toBe(`a ${content.id}`);
    fixture.componentInstance.triggerId.set('second');
    fixture.componentInstance.ids.set('b');
    await fixture.whenStable();
    expect(trigger.id).toBe('second');
    expect(trigger.getAttribute('aria-describedby')).toBe(`b ${content.id}`);
  });

  it('does the same on the one-attribute host, with the description id', async () => {
    const { fixture } = await render(Host);
    await fixture.whenStable();
    const save = screen.getByRole('button', { name: 'Store' });
    const description = [...document.querySelectorAll<HTMLElement>('[role="tooltip"][hidden]')].find(
      (element) => element.textContent === 'Save',
    );
    expect(save.id).toBe('save-1');
    expect(save.getAttribute('aria-describedby')).toBe(`a ${description?.id ?? ''}`);
    fixture.componentInstance.saveId.set('save-2');
    fixture.componentInstance.ids.set('b');
    await fixture.whenStable();
    expect(save.id).toBe('save-2');
    expect(save.getAttribute('aria-describedby')).toBe(`b ${description?.id ?? ''}`);
  });
});
