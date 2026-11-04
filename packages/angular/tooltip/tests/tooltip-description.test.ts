import { Component, signal, viewChild } from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import { tooltipAnatomy } from '@cocokits/machines/tooltip';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CckTooltip, CckTooltipImports } from '../index';
import { stubOverlayApis } from './overlay-stubs';

@Component({
  imports: [...CckTooltipImports],
  template: `
    <button [cckTooltip]="message()" [cckTooltipDisabled]="disabled()" [attr.aria-label]="label()">Copy</button>
    <ng-container [cckTooltip]="compoundMessage()">
      <button cckTooltipTrigger id="rich">Rich</button>
      <ng-template cckTooltipPortal
        ><div cckTooltipContent><b>Rich</b> text</div></ng-template
      >
    </ng-container>
  `,
})
class Host {
  readonly tooltip = viewChild.required(CckTooltip);
  readonly message = signal('Copy link');
  readonly label = signal<string | null>(null);
  readonly disabled = signal(false);
  readonly compoundMessage = signal('');
}

const buttons = (): { plain: HTMLElement; rich: HTMLElement } => ({
  plain: screen.getByText('Copy'),
  rich: screen.getByText('Rich'),
});
const descriptions = (): HTMLElement[] => [...document.querySelectorAll<HTMLElement>('[role="tooltip"][hidden]')];

describe('Tooltip description', () => {
  beforeEach(stubOverlayApis);
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('describes the trigger by a hidden copy of the message while closed', async () => {
    const { fixture } = await render(Host);
    await fixture.whenStable();
    const [description] = descriptions() as [HTMLElement];
    expect(descriptions()).toHaveLength(1);
    expect(description.textContent).toBe('Copy link');
    expect(description.id).toMatch(/-description$/);
    expect(buttons().plain.getAttribute('aria-describedby')).toBe(description.id);
    expect(document.querySelector(`.${tooltipAnatomy.classes.content}`)).toBeNull();
  });

  it('hides the visible content from assistive technology while described', async () => {
    const { fixture } = await render(Host);
    await fixture.whenStable();
    fixture.componentInstance.tooltip().show(0);
    await fixture.whenStable();
    await waitFor(() => {
      expect(document.querySelector(`.${tooltipAnatomy.classes.content}`)).not.toBeNull();
    });
    expect(document.querySelector(`.${tooltipAnatomy.classes.content}`)?.getAttribute('aria-hidden')).toBe('true');
    expect(buttons().plain.getAttribute('aria-describedby')).toBe(descriptions()[0]?.id);
  });

  it('follows the message, and removes the description when it empties or the tooltip is disabled', async () => {
    const { fixture } = await render(Host);
    await fixture.whenStable();
    fixture.componentInstance.message.set('Other');
    await fixture.whenStable();
    expect(descriptions()[0]?.textContent).toBe('Other');
    fixture.componentInstance.disabled.set(true);
    await fixture.whenStable();
    expect(descriptions()).toHaveLength(0);
    expect(buttons().plain.hasAttribute('aria-describedby')).toBe(false);
    fixture.componentInstance.disabled.set(false);
    await fixture.whenStable();
    expect(descriptions()).toHaveLength(1);
    fixture.componentInstance.message.set('');
    await fixture.whenStable();
    expect(descriptions()).toHaveLength(0);
  });

  it('is suppressed when the message equals the aria-label, and follows label changes', async () => {
    const { fixture } = await render(Host);
    fixture.componentInstance.label.set('Copy link');
    await fixture.whenStable();
    await waitFor(() => {
      expect(descriptions()).toHaveLength(0);
    });
    expect(buttons().plain.hasAttribute('aria-describedby')).toBe(false);
    fixture.componentInstance.tooltip().show(0);
    await fixture.whenStable();
    await waitFor(() => {
      expect(document.querySelector(`.${tooltipAnatomy.classes.content}`)?.getAttribute('aria-hidden')).toBe('true');
    });
    expect(buttons().plain.hasAttribute('aria-describedby')).toBe(false);
    fixture.componentInstance.label.set('Other label');
    await waitFor(() => {
      expect(descriptions()).toHaveLength(1);
    });
    await fixture.whenStable();
    expect(buttons().plain.getAttribute('aria-describedby')).toBe(descriptions()[0]?.id);
  });

  it('removes the description when the tooltip is destroyed', async () => {
    const { fixture } = await render(Host);
    await fixture.whenStable();
    expect(descriptions()).toHaveLength(1);
    fixture.destroy();
    expect(descriptions()).toHaveLength(0);
  });

  it('describes a compound trigger by the message once it has one', async () => {
    const { fixture } = await render(Host);
    await fixture.whenStable();
    expect(buttons().rich.hasAttribute('aria-describedby')).toBe(false);
    fixture.componentInstance.compoundMessage.set('Rich text');
    await fixture.whenStable();
    const rich = descriptions().find((element) => element.textContent === 'Rich text');
    expect(rich).toBeDefined();
    expect(buttons().rich.getAttribute('aria-describedby')).toBe(rich?.id);
  });
});
