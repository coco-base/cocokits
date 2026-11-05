import { signal } from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { CckTabsImports, type CckTabChangeEvent } from '../index';
import { labels, tab } from './queries';

const imports = [...CckTabsImports];

const selectedLabels = (): string[] =>
  screen
    .getAllByRole('tab')
    .filter((element) => element.getAttribute('aria-selected') === 'true')
    .map((element) => element.textContent.trim());

describe('Tabs selectedIndex', () => {
  it('selects the first enabled tab for null and leaves the model null', async () => {
    const index = signal<number | null>(null);
    await render(
      `<div cckTabs aria-label="x" [(selectedIndex)]="index">
        <div cckTab label="A" disabled>a</div><div cckTab label="B">b</div><div cckTab label="C">c</div>
      </div>`,
      { imports, componentProperties: { index } },
    );
    expect(selectedLabels()).toEqual(['B']);
    expect(index()).toBeNull();
  });

  it('selects the tab a parent write names and clamps a position outside the tabs', async () => {
    const index = signal<number | null>(2);
    const changes: CckTabChangeEvent[] = [];
    await render(
      `<div cckTabs aria-label="x" [(selectedIndex)]="index" (selectedTabChange)="changes.push($event)">
        <div cckTab label="A">a</div><div cckTab label="B">b</div><div cckTab label="C">c</div>
      </div>`,
      { imports, componentProperties: { index, changes } },
    );
    expect(selectedLabels()).toEqual(['C']);
    index.set(1);
    await waitFor(() => {
      expect(selectedLabels()).toEqual(['B']);
    });
    index.set(9);
    await waitFor(() => {
      expect(selectedLabels()).toEqual(['C']);
    });
    expect(index()).toBe(2);
    expect(changes).toEqual([]);
  });

  it('lets the parent select a disabled tab, never the user', async () => {
    const user = userEvent.setup();
    const index = signal<number | null>(1);
    await render(
      `<div cckTabs aria-label="x" [(selectedIndex)]="index">
        <div cckTab label="A">a</div><div cckTab label="B" disabled>b</div><div cckTab label="C">c</div>
      </div>`,
      { imports, componentProperties: { index } },
    );
    expect(selectedLabels()).toEqual(['B']);
    await user.click(tab('C'));
    expect(index()).toBe(2);
  });

  it('writes the model and emits { index, tab } for a click and a key, for the user only', async () => {
    const user = userEvent.setup();
    const index = signal<number | null>(null);
    const changes: CckTabChangeEvent[] = [];
    await render(
      `<div cckTabs aria-label="x" [(selectedIndex)]="index" (selectedTabChange)="changes.push($event)">
        <div cckTab label="A">a</div><div cckTab label="B">b</div><div cckTab label="C">c</div>
      </div>`,
      { imports, componentProperties: { index, changes } },
    );
    await user.click(tab('C'));
    expect(index()).toBe(2);
    tab('C').focus();
    await user.keyboard('{ArrowRight}');
    expect(index()).toBe(0);
    expect(changes.map((change) => change.index)).toEqual([2, 0]);
    expect(changes[0]?.tab._element.getAttribute('role')).toBe('tabpanel');
  });

  it('keeps the selected tab and updates the position when tabs are inserted before it', async () => {
    const names = signal(['a', 'b']);
    const index = signal<number | null>(1);
    const changes: CckTabChangeEvent[] = [];
    await render(
      `<div cckTabs aria-label="x" [(selectedIndex)]="index" (selectedTabChange)="changes.push($event)">
        @for (name of names(); track name) { <div cckTab [label]="name">{{ name }} body</div> }
      </div>`,
      { imports, componentProperties: { names, index, changes } },
    );
    expect(selectedLabels()).toEqual(['b']);
    names.set(['z', 'a', 'b']);
    await waitFor(() => {
      expect(labels()).toEqual(['z', 'a', 'b']);
    });
    expect(selectedLabels()).toEqual(['b']);
    await waitFor(() => {
      expect(index()).toBe(2);
    });
    expect(changes).toEqual([]);
  });

  it('keeps the selected tab and updates the position when a tab before it is removed', async () => {
    const names = signal(['a', 'b', 'c']);
    const index = signal<number | null>(2);
    const changes: CckTabChangeEvent[] = [];
    await render(
      `<div cckTabs aria-label="x" [(selectedIndex)]="index" (selectedTabChange)="changes.push($event)">
        @for (name of names(); track name) { <div cckTab [label]="name">{{ name }} body</div> }
      </div>`,
      { imports, componentProperties: { names, index, changes } },
    );
    expect(selectedLabels()).toEqual(['c']);
    names.set(['b', 'c']);
    await waitFor(() => {
      expect(labels()).toEqual(['b', 'c']);
    });
    expect(selectedLabels()).toEqual(['c']);
    await waitFor(() => {
      expect(index()).toBe(1);
    });
    expect(changes).toEqual([]);
  });

  it('keeps a null position on the selected tab when a tab is inserted before it', async () => {
    const names = signal(['a', 'b']);
    await render(
      `<div cckTabs aria-label="x">
        @for (name of names(); track name) { <div cckTab [label]="name">{{ name }} body</div> }
      </div>`,
      { imports, componentProperties: { names } },
    );
    expect(selectedLabels()).toEqual(['a']);
    names.set(['z', 'a', 'b']);
    await waitFor(() => {
      expect(labels()).toEqual(['z', 'a', 'b']);
    });
    expect(selectedLabels()).toEqual(['a']);
  });

  it('selects the tab now at the place of a removed selected tab', async () => {
    const names = signal(['a', 'b', 'c']);
    const index = signal<number | null>(1);
    await render(
      `<div cckTabs aria-label="x" [(selectedIndex)]="index">
        @for (name of names(); track name) { <div cckTab [label]="name">{{ name }} body</div> }
      </div>`,
      { imports, componentProperties: { names, index } },
    );
    names.set(['a', 'c']);
    await waitFor(() => {
      expect(selectedLabels()).toEqual(['c']);
    });
    expect(index()).toBe(1);
    names.set(['a']);
    await waitFor(() => {
      expect(selectedLabels()).toEqual(['a']);
    });
    expect(index()).toBe(0);
  });
});

describe('Tabs focusChange', () => {
  const TEMPLATE = `
    <button>before</button>
    <div cckTabs aria-label="x" (focusChange)="focused.push($event)">
      <div cckTab label="A">a</div><div cckTab label="B">b</div><div cckTab label="C">c</div>
    </div>`;

  it('fires for Tab into the list and for arrow, Home and End focus', async () => {
    const user = userEvent.setup();
    const focused: CckTabChangeEvent[] = [];
    await render(TEMPLATE, { imports, componentProperties: { focused } });
    await user.tab();
    await user.tab();
    await user.keyboard('{ArrowRight}{End}{Home}');
    expect(focused.map((event) => event.index)).toEqual([0, 1, 2, 0]);
    expect(focused[1]?.tab._element.getAttribute('role')).toBe('tabpanel');
  });

  it('does not fire for a mouse click', async () => {
    const user = userEvent.setup();
    const focused: CckTabChangeEvent[] = [];
    await render(TEMPLATE, { imports, componentProperties: { focused } });
    await user.click(tab('B'));
    expect(focused).toEqual([]);
  });
});

describe('Tabs trigger labelling', () => {
  it('puts aria-label, aria-labelledby and id on the trigger and not on the section', async () => {
    const { container } = await render(
      `<span id="name">Named</span>
       <div cckTabs aria-label="x">
         <div cckTab label="A" id="first" aria-label="First tab">a</div>
         <div cckTab label="B" aria-labelledby="name">b</div>
       </div>`,
      { imports },
    );
    const first = tab('First tab');
    expect(first.id).toBe('first');
    expect(first.hasAttribute('aria-labelledby')).toBe(false);
    expect(tab('Named').getAttribute('aria-labelledby')).toBe('name');
    const panels = [...container.querySelectorAll('.cck-tabs__panel')];
    for (const panel of panels) expect(panel.hasAttribute('aria-label')).toBe(false);
    expect(panels[0]?.id).toBe(first.getAttribute('aria-controls'));
    expect(panels[0]?.getAttribute('aria-labelledby')).toBe('first');
    expect(panels[1]?.getAttribute('aria-labelledby')).toBe(tab('Named').id);
    expect(container.querySelector('#first')).toBe(first);
  });
});
