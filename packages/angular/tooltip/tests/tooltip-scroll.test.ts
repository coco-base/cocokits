import { Component, viewChild } from '@angular/core';
import { render, waitFor } from '@testing-library/angular';
import { tooltipAnatomy } from '@cocokits/machines/tooltip';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CckTooltip, CckTooltipImports } from '../index';
import { stubOverlayApis } from './overlay-stubs';

@Component({
  imports: [...CckTooltipImports],
  template: `
    <div id="scroller"><button cckTooltip="Copy link">Copy</button></div>
    <div id="other">Other</div>
  `,
})
class Host {
  readonly tooltip = viewChild.required(CckTooltip);
}

const byId = (id: string): HTMLElement => {
  const element = document.getElementById(id);
  if (!element) throw new Error(id);
  return element;
};
const bubble = (): HTMLElement | null => document.querySelector<HTMLElement>(`.${tooltipAnatomy.classes.content}`);

describe('Tooltip scroll', () => {
  beforeEach(stubOverlayApis);
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const open = async (): Promise<{ whenStable: () => Promise<unknown> }> => {
    const { fixture } = await render(Host);
    fixture.componentInstance.tooltip().show(0);
    await fixture.whenStable();
    await waitFor(() => {
      expect(bubble()).not.toBeNull();
    });
    return fixture;
  };
  const scroll = (target: EventTarget): void => {
    target.dispatchEvent(new Event('scroll', { bubbles: target === document }));
  };

  it('closes when an ancestor of the trigger scrolls', async () => {
    await open();
    scroll(byId('scroller'));
    await waitFor(() => {
      expect(bubble()).toBeNull();
    });
  });

  it('closes when the document scrolls', async () => {
    await open();
    scroll(document);
    await waitFor(() => {
      expect(bubble()).toBeNull();
    });
  });

  it('stays open when an unrelated element or the content scrolls', async () => {
    const fixture = await open();
    scroll(byId('other'));
    scroll(byId('other'));
    const content = bubble();
    if (content) scroll(content);
    await fixture.whenStable();
    expect(bubble()?.getAttribute('data-state')).toBe('open');
  });
});
