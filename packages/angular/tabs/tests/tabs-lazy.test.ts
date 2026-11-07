import { Component, OnDestroy } from '@angular/core';
import { render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { CCK_TABS_CONFIG, CckTabsImports } from '../index';
import { tab } from './queries';

const counts = { created: 0, destroyed: 0 };

@Component({ selector: 'app-probe', template: `<span class="probe">probe</span>` })
class Probe implements OnDestroy {
  constructor() {
    counts.created += 1;
  }
  ngOnDestroy(): void {
    counts.destroyed += 1;
  }
}

const imports = [...CckTabsImports, Probe];

const panels = (): HTMLElement[] => [...document.querySelectorAll<HTMLElement>('.cck-tabs__panel')];
const probes = (): number => document.querySelectorAll('.probe').length;

beforeEach(() => {
  counts.created = 0;
  counts.destroyed = 0;
});

describe('Tabs lazy panels', () => {
  const DIRECT = `
    <div cckTabs aria-label="x" [preserveContent]="keep">
      <div cckTab label="A"><span class="a-body">A body</span></div>
      <div cckTab label="B"><app-probe /></div>
      <div cckTab label="C"><span class="c-body">C body</span></div>
    </div>`;

  it('renders every panel element with its attributes but only the selected panel content', async () => {
    const { container } = await render(DIRECT, { imports, componentProperties: { keep: false } });
    expect(panels()).toHaveLength(3);
    expect(panels().map((panel) => panel.hidden)).toEqual([false, true, true]);
    for (const panel of panels()) {
      expect(panel.getAttribute('role')).toBe('tabpanel');
      expect(panel.id).not.toBe('');
      expect(panel.getAttribute('aria-labelledby')).not.toBe('');
    }
    expect(container.querySelector('.a-body')).not.toBeNull();
    expect(container.querySelector('.c-body')).toBeNull();
    expect(probes()).toBe(0);
  });

  it('creates direct content with the tab but attaches it only while the tab is selected', async () => {
    const user = userEvent.setup();
    await render(DIRECT, { imports, componentProperties: { keep: false } });
    expect(counts.created).toBe(1);
    expect(probes()).toBe(0);
    await user.click(tab('B'));
    expect(probes()).toBe(1);
    expect(document.querySelector('.a-body')).toBeNull();
    await user.click(tab('C'));
    expect(probes()).toBe(0);
    expect(document.querySelector('.c-body')).not.toBeNull();
  });

  it('keeps the content of a tab that was selected, hidden, with preserveContent', async () => {
    const user = userEvent.setup();
    await render(DIRECT, { imports, componentProperties: { keep: true } });
    expect(document.querySelector('.c-body')).toBeNull();
    await user.click(tab('C'));
    await user.click(tab('A'));
    expect(document.querySelector('.c-body')).not.toBeNull();
    expect(panels()[2]?.hidden).toBe(true);
    expect(panels()[2]?.contains(document.querySelector('.c-body'))).toBe(true);
    expect(document.querySelector('.a-body')).not.toBeNull();
  });
});

describe('Tabs cckTabContent', () => {
  const LAZY = `
    <div cckTabs aria-label="x" [preserveContent]="keep">
      <div cckTab label="A">A body</div>
      <div cckTab label="B"><ng-template cckTabContent><app-probe /></ng-template></div>
    </div>`;

  it('creates the template the first time its tab is selected and destroys it when the tab is left', async () => {
    const user = userEvent.setup();
    await render(LAZY, { imports, componentProperties: { keep: false } });
    expect(counts.created).toBe(0);
    expect(probes()).toBe(0);
    await user.click(tab('B'));
    expect(counts).toEqual({ created: 1, destroyed: 0 });
    expect(probes()).toBe(1);
    await user.click(tab('A'));
    expect(counts).toEqual({ created: 1, destroyed: 1 });
    expect(probes()).toBe(0);
    await user.click(tab('B'));
    expect(counts.created).toBe(2);
  });

  it('keeps the created template, hidden, with preserveContent', async () => {
    const user = userEvent.setup();
    await render(LAZY, { imports, componentProperties: { keep: true } });
    await user.click(tab('B'));
    await user.click(tab('A'));
    expect(counts).toEqual({ created: 1, destroyed: 0 });
    expect(probes()).toBe(1);
    expect(panels()[1]?.hidden).toBe(true);
    await user.click(tab('B'));
    expect(counts.created).toBe(1);
  });

  it('takes preserveContent from CCK_TABS_CONFIG, and an input wins', async () => {
    const user = userEvent.setup();
    await render(LAZY, {
      imports,
      componentProperties: { keep: false },
      providers: [{ provide: CCK_TABS_CONFIG, useValue: { preserveContent: true } }],
    });
    await user.click(tab('B'));
    await user.click(tab('A'));
    expect(probes()).toBe(0);
  });

  it('uses the config default when the input is left out', async () => {
    const user = userEvent.setup();
    await render(
      `<div cckTabs aria-label="x">
        <div cckTab label="A">A body</div>
        <div cckTab label="B"><ng-template cckTabContent><app-probe /></ng-template></div>
      </div>`,
      { imports, providers: [{ provide: CCK_TABS_CONFIG, useValue: { preserveContent: true } }] },
    );
    await user.click(tab('B'));
    await user.click(tab('A'));
    expect(probes()).toBe(1);
  });
});
