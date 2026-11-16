import { Component, viewChild } from '@angular/core';
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

const { classes } = tooltipAnatomy;

@Component({
  imports: [...CckTooltipImports],
  template: `
    <ng-container cckTooltip>
      <button cckTooltipTrigger>Save</button>
      <ng-template cckTooltipPortal>
        <cck-tooltip-content>
          <cck-tooltip-title>Autosave</cck-tooltip-title>
          <cck-tooltip-description>Changes are saved as you type.</cck-tooltip-description>
        </cck-tooltip-content>
      </ng-template>
    </ng-container>
  `,
})
class Host {
  readonly tooltip = viewChild.required(CckTooltip);
}

describe('Tooltip title and description', () => {
  beforeEach(() => {
    start.mockClear();
    stubOverlayApis();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the parts with their classes inside the tooltip content', async () => {
    const { fixture } = await render(Host);
    fixture.componentInstance.tooltip().show(0);
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip.querySelector(`cck-tooltip-title.${classes.title}`)?.textContent).toBe('Autosave');
    expect(tooltip.querySelector(`cck-tooltip-description.${classes.description}`)?.textContent).toBe(
      'Changes are saved as you type.',
    );
    for (const part of ['title', 'description']) {
      expect(tooltip.querySelector(`cck-tooltip-${part}`)?.hasAttribute('role'), part).toBe(false);
    }
  });

  it('describes the trigger with the title and the description together', async () => {
    const { fixture } = await render(Host);
    fixture.componentInstance.tooltip().show(0);
    await screen.findByRole('tooltip');
    const button = screen.getByRole('button', { name: 'Save' });
    expect(button.getAttribute('aria-describedby')).toBe(screen.getByRole('tooltip').id);
    expect(screen.getByRole('tooltip').textContent).toBe('AutosaveChanges are saved as you type.');
  });

  it('starts the positioning module after the content has its class', async () => {
    const { fixture } = await render(Host);
    fixture.componentInstance.tooltip().show(0);
    await screen.findByRole('tooltip');
    expect(start).toHaveBeenCalled();
    for (const [options] of start.mock.calls as [Options][]) {
      expect(options.getContent().classList.contains(classes.content)).toBe(true);
    }
  });
});
