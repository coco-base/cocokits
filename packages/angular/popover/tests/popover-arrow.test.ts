import { Component, signal } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import { popoverAnatomy } from '@cocokits/machines/popover';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CckPopoverImports } from '../index';
import { stubOverlayApis } from './overlay-stubs';

type Options = Parameters<typeof import('@cocokits/cdk/positioning').startOverlayPosition>[0];

const start = vi.hoisted(() => vi.fn());
vi.mock('@cocokits/cdk/positioning', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@cocokits/cdk/positioning')>();
  return {
    ...actual,
    startOverlayPosition: (options: Options) => {
      start(options);
      return actual.startOverlayPosition(options);
    },
  };
});

@Component({
  imports: [...CckPopoverImports],
  template: `
    <ng-container cckPopover [open]="true">
      <button cckPopoverTrigger>Share</button>
      <ng-template cckPopoverPortal>
        <cck-popover-content aria-label="Share">
          @if (arrow()) {
            <cck-popover-arrow data-testid="arrow"></cck-popover-arrow>
          }
          Text
        </cck-popover-content>
      </ng-template>
    </ng-container>
  `,
})
class Host {
  readonly arrow = signal(true);
}

@Component({
  imports: [...CckPopoverImports],
  template: `
    <ng-container cckPopover [open]="true">
      <button cckPopoverTrigger>Share</button>
      <ng-template cckPopoverPortal>
        <cck-popover-content aria-label="Share">
          <cck-popover-arrow class="mine" data-testid="arrow"><circle r="1" /></cck-popover-arrow>
        </cck-popover-content>
      </ng-template>
    </ng-container>
  `,
})
class Custom {
  readonly label = 'custom';
}

const lastOptions = (): Options => start.mock.lastCall?.[0] as Options;

describe('Popover arrow', () => {
  beforeEach(() => {
    start.mockClear();
    stubOverlayApis();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders a decorative element with the class and the built-in triangle inside the content', async () => {
    await render(Host);
    const arrow = await screen.findByTestId('arrow');
    expect(arrow.tagName).toBe('CCK-POPOVER-ARROW');
    expect(arrow.classList.contains(popoverAnatomy.classes.arrow)).toBe(true);
    expect(arrow.getAttribute('aria-hidden')).toBe('true');
    expect(arrow.hasAttribute('hidden')).toBe(false);
    expect(arrow.closest(`.${popoverAnatomy.classes.content}`)).not.toBeNull();
    const svg = arrow.querySelector('svg');
    expect(svg?.getAttribute('viewBox')).toBe('0 0 30 10');
    expect(svg?.getAttribute('width')).toBe('10');
    expect(svg?.querySelector('polygon')?.getAttribute('points')).toBe('0,0 30,0 15,10');
  });

  it('lets the author children replace the triangle', async () => {
    await render(Custom);
    const arrow = await screen.findByTestId('arrow');
    expect(arrow.classList.contains('mine')).toBe(true);
    expect(arrow.querySelector('polygon')).toBeNull();
    expect(arrow.querySelector('circle')).not.toBeNull();
  });

  it('gives the arrow to the positioning module', async () => {
    await render(Host);
    const arrow = await screen.findByTestId('arrow');
    expect(lastOptions().getArrow?.()).toBe(arrow);
  });

  it('sets the native hidden attribute while the module reports the arrow cannot point, and removes it again', async () => {
    const { fixture } = await render(Host);
    const arrow = await screen.findByTestId('arrow');
    lastOptions().onArrowHiddenChange?.(true);
    await fixture.whenStable();
    expect(arrow.hasAttribute('hidden')).toBe(true);
    expect(arrow.style.display).toBe('');
    expect(arrow.style.visibility).toBe('');
    lastOptions().onArrowHiddenChange?.(false);
    await fixture.whenStable();
    expect(arrow.hasAttribute('hidden')).toBe(false);
  });

  it('positions again with the arrow when it appears after the content, and without it when it goes', async () => {
    const { fixture } = await render(Host);
    await screen.findByTestId('arrow');
    fixture.componentInstance.arrow.set(false);
    await fixture.whenStable();
    expect(lastOptions().getArrow).toBeUndefined();
    expect(lastOptions().onArrowHiddenChange).toBeUndefined();
    fixture.componentInstance.arrow.set(true);
    await fixture.whenStable();
    expect(lastOptions().getArrow?.()).toBe(await screen.findByTestId('arrow'));
  });
});
