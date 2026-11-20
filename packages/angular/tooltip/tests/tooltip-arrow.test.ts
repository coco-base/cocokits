import { Component, signal, viewChild } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import { tooltipAnatomy } from '@cocokits/machines/tooltip';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CckTooltip, CckTooltipImports } from '../index';
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
  imports: [...CckTooltipImports],
  template: `
    <ng-container cckTooltip>
      <button cckTooltipTrigger>Copy</button>
      <ng-template cckTooltipPortal>
        <cck-tooltip-content>
          @if (arrow()) {
            <cck-tooltip-arrow data-testid="arrow"></cck-tooltip-arrow>
          }
          Text
        </cck-tooltip-content>
      </ng-template>
    </ng-container>
  `,
})
class Host {
  readonly tooltip = viewChild.required(CckTooltip);
  readonly arrow = signal(true);
}

@Component({
  imports: [...CckTooltipImports],
  template: `
    <ng-container cckTooltip>
      <button cckTooltipTrigger>Copy</button>
      <ng-template cckTooltipPortal>
        <cck-tooltip-content>
          <cck-tooltip-arrow class="mine" data-testid="arrow"><circle r="1" /></cck-tooltip-arrow>
        </cck-tooltip-content>
      </ng-template>
    </ng-container>
  `,
})
class Custom {
  readonly tooltip = viewChild.required(CckTooltip);
}

const lastOptions = (): Options => start.mock.lastCall?.[0] as Options;

describe('Tooltip arrow', () => {
  beforeEach(() => {
    start.mockClear();
    stubOverlayApis();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders a decorative element with the class and the built-in triangle inside the content', async () => {
    const { fixture } = await render(Host);
    fixture.componentInstance.tooltip().show(0);
    const arrow = await screen.findByTestId('arrow');
    expect(arrow.tagName).toBe('CCK-TOOLTIP-ARROW');
    expect(arrow.classList.contains(tooltipAnatomy.classes.arrow)).toBe(true);
    expect(arrow.getAttribute('aria-hidden')).toBe('true');
    expect(arrow.hasAttribute('hidden')).toBe(false);
    expect(arrow.closest(`.${tooltipAnatomy.classes.content}`)).not.toBeNull();
    const svg = arrow.querySelector('svg');
    expect(svg?.getAttribute('viewBox')).toBe('0 0 30 10');
    expect(svg?.querySelector('polygon')?.getAttribute('points')).toBe('0,0 30,0 15,10');
  });

  it('lets the author children replace the triangle', async () => {
    const { fixture } = await render(Custom);
    fixture.componentInstance.tooltip().show(0);
    const arrow = await screen.findByTestId('arrow');
    expect(arrow.classList.contains('mine')).toBe(true);
    expect(arrow.querySelector('polygon')).toBeNull();
    expect(arrow.querySelector('circle')).not.toBeNull();
  });

  it('gives the arrow to the positioning module and hides it with the native attribute on request', async () => {
    const { fixture } = await render(Host);
    fixture.componentInstance.tooltip().show(0);
    const arrow = await screen.findByTestId('arrow');
    expect(lastOptions().getArrow?.()).toBe(arrow);
    lastOptions().onArrowHiddenChange?.(true);
    await fixture.whenStable();
    expect(arrow.hasAttribute('hidden')).toBe(true);
    expect(arrow.style.display).toBe('');
    expect(arrow.style.visibility).toBe('');
    lastOptions().onArrowHiddenChange?.(false);
    await fixture.whenStable();
    expect(arrow.hasAttribute('hidden')).toBe(false);
  });

  it('passes no arrow when the content has none', async () => {
    const { fixture } = await render(Host);
    fixture.componentInstance.arrow.set(false);
    fixture.componentInstance.tooltip().show(0);
    await fixture.whenStable();
    expect(lastOptions().getArrow).toBeUndefined();
    expect(lastOptions().onArrowHiddenChange).toBeUndefined();
  });
});
