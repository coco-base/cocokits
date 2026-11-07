import { Component, signal } from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { CckDir } from '@cocokits/angular-core';
import { tabsAnatomy, tabsMeta } from '@cocokits/machines/tabs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CckTabsImports, type CckTabChangeEvent } from '../index';
import { labels, tab } from './queries';

const imports = [...CckTabsImports, CckDir];
const { classes } = tabsAnatomy;

const THREE = `
  <div cckTabs aria-label="Account settings" [(selectedIndex)]="index" [orientation]="orientation()"
    [activationMode]="mode()" (selectedTabChange)="changes.push($event)">
    <div cckTab label="Account">Account panel</div>
    <div cckTab label="Password" [disabled]="lockPassword()">Password panel</div>
    <div cckTab label="Notifications">Notifications panel</div>
  </div>`;

function hostState(): {
  index: ReturnType<typeof signal<number | null>>;
  orientation: ReturnType<typeof signal<'horizontal' | 'vertical'>>;
  mode: ReturnType<typeof signal<'automatic' | 'manual'>>;
  lockPassword: ReturnType<typeof signal<boolean>>;
  changes: CckTabChangeEvent[];
} {
  return {
    index: signal<number | null>(null),
    orientation: signal<'horizontal' | 'vertical'>('horizontal'),
    mode: signal<'automatic' | 'manual'>('automatic'),
    lockPassword: signal(false),
    changes: [],
  };
}

@Component({ imports, template: THREE })
class Host {
  readonly index = signal<number | null>(null);
  readonly orientation = signal<'horizontal' | 'vertical'>('horizontal');
  readonly mode = signal<'automatic' | 'manual'>('automatic');
  readonly lockPassword = signal(false);
  readonly changes: CckTabChangeEvent[] = [];
}

const panel = (name: string): HTMLElement => {
  const element = document.getElementById(tab(name).getAttribute('aria-controls') ?? '');
  if (!element) throw new Error(`no panel for ${name}`);
  return element;
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Tabs rendered contract', () => {
  it('renders the meta default element for every part', async () => {
    const { container } = await render(Host);
    for (const [part, tagName] of Object.entries(tabsMeta.defaultElements ?? {})) {
      const element = container.querySelector(`.${classes[part as keyof typeof classes]}`);
      expect(element?.tagName.toLowerCase(), part).toBe(tagName);
    }
  });

  it('renders the list first, a trigger per tab, the indicator and a panel per tab with the fixed classes', async () => {
    const { container } = await render(Host);
    const root = container.querySelector(`.${classes.root}`);
    expect(root?.firstElementChild?.className).toBe(classes.list);
    const list = screen.getByRole('tablist', { name: 'Account settings' });
    expect(list.children).toHaveLength(4);
    expect(list.lastElementChild?.className).toBe(classes.indicator);
    expect(list.lastElementChild?.getAttribute('aria-hidden')).toBe('true');
    for (const name of ['Account', 'Password', 'Notifications']) {
      expect(tab(name).className).toBe(classes.trigger);
      expect(tab(name).getAttribute('type')).toBe('button');
      expect(tab(name).querySelector(`.${classes.triggerLabel}`)?.textContent.trim()).toBe(name);
    }
    expect(container.querySelectorAll(`.${classes.panel}`)).toHaveLength(3);
    expect(root?.getAttribute('data-orientation')).toBe('horizontal');
    expect(list.getAttribute('aria-orientation')).toBeNull();
    expect(list.getAttribute('data-orientation')).toBe('horizontal');
  });

  it('selects the first enabled tab, links trigger and panel and hides the other panels', async () => {
    await render(Host);
    expect(tab('Account').getAttribute('aria-selected')).toBe('true');
    expect(tab('Password').getAttribute('aria-selected')).toBe('false');
    expect(tab('Account').hasAttribute('data-selected')).toBe(true);
    expect(tab('Password').hasAttribute('data-selected')).toBe(false);
    const accountPanel = panel('Account');
    expect(accountPanel.id).toBe(tab('Account').getAttribute('aria-controls'));
    expect(accountPanel.getAttribute('aria-labelledby')).toBe(tab('Account').id);
    expect(accountPanel.getAttribute('tabindex')).toBe('0');
    expect(accountPanel.hidden).toBe(false);
    expect(accountPanel.hasAttribute('data-selected')).toBe(true);
    expect(panel('Password').hidden).toBe(true);
    expect(panel('Password').hasAttribute('data-selected')).toBe(false);
    expect(tab('Account').tabIndex).toBe(0);
    expect(tab('Password').tabIndex).toBe(-1);
  });

  it('keeps none of label, disabled, aria-label and aria-labelledby on the host elements', async () => {
    const { container } = await render(Host);
    const root = container.querySelector(`.${classes.root}`);
    expect(root?.hasAttribute('aria-label')).toBe(false);
    expect(root?.hasAttribute('aria-labelledby')).toBe(false);
    for (const panelElement of container.querySelectorAll(`.${classes.panel}`)) {
      for (const name of ['label', 'disabled']) {
        expect(panelElement.hasAttribute(name), name).toBe(false);
      }
    }
  });

  it('forwards aria-labelledby to the list', async () => {
    await render(
      `<h2 id="title">Settings</h2><div cckTabs aria-labelledby="title"><div cckTab label="A">a</div></div>`,
      { imports },
    );
    expect(screen.getByRole('tablist', { name: 'Settings' })).toBeTruthy();
  });

  it('marks the vertical orientation on the root, the list, the triggers and the panels', async () => {
    const { fixture } = await render(Host);
    fixture.componentInstance.orientation.set('vertical');
    await waitFor(() => {
      expect(screen.getByRole('tablist').getAttribute('aria-orientation')).toBe('vertical');
    });
    expect(tab('Account').getAttribute('data-orientation')).toBe('vertical');
    expect(panel('Account').getAttribute('data-orientation')).toBe('vertical');
  });

  it('marks a disabled tab natively and with data-disabled, and keeps it visible', async () => {
    const { fixture } = await render(Host);
    fixture.componentInstance.lockPassword.set(true);
    await waitFor(() => {
      expect((tab('Password') as HTMLButtonElement).disabled).toBe(true);
    });
    expect(tab('Password').hasAttribute('data-disabled')).toBe(true);
    expect(tab('Account').hasAttribute('data-disabled')).toBe(false);
  });

  it('renders the label markup of a cckTabLabel template in the trigger label', async () => {
    await render(
      `<div cckTabs aria-label="x">
        <div cckTab><ng-template cckTabLabel><b>Bold</b> tab</ng-template>Body</div>
      </div>`,
      { imports },
    );
    expect(tab('Bold tab').querySelector('b')).not.toBeNull();
  });
});

describe('Tabs selection', () => {
  it('is uncontrolled without a bound value: a click selects and reports the position and the tab', async () => {
    const user = userEvent.setup();
    const changes: CckTabChangeEvent[] = [];
    await render(
      `<div cckTabs aria-label="x" (selectedTabChange)="changes.push($event)">
        <div cckTab label="A">a</div><div cckTab label="B">b</div>
      </div>`,
      { imports, componentProperties: { changes } },
    );
    await user.click(tab('B'));
    expect(tab('B').getAttribute('aria-selected')).toBe('true');
    expect(panel('B').hidden).toBe(false);
    expect(changes).toHaveLength(1);
    expect(changes[0]).toMatchObject({ index: 1 });
    expect(changes[0]?.tab._element).toBe(panel('B'));
  });

  it('reports nothing for a click on the selected tab or a disabled tab', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(Host);
    fixture.componentInstance.lockPassword.set(true);
    await user.click(tab('Account'));
    await user.click(tab('Password'));
    expect(fixture.componentInstance.changes).toEqual([]);
    expect(tab('Account').getAttribute('aria-selected')).toBe('true');
  });

  it('is controlled by a two-way value: the parent value wins and a write reports nothing', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(Host);
    const host = fixture.componentInstance;
    host.index.set(2);
    await waitFor(() => {
      expect(tab('Notifications').getAttribute('aria-selected')).toBe('true');
    });
    expect(host.changes).toEqual([]);
    await user.click(tab('Password'));
    expect(host.index()).toBe(1);
    expect(host.changes).toHaveLength(1);
  });

  it('starts at a one-way index', async () => {
    await render(
      `<div cckTabs aria-label="x" [selectedIndex]="1"><div cckTab label="A">a</div><div cckTab label="B">b</div></div>`,
      { imports },
    );
    expect(tab('B').getAttribute('aria-selected')).toBe('true');
    expect(tab('B').tabIndex).toBe(0);
    expect(tab('A').tabIndex).toBe(-1);
  });

  it('skips a disabled first tab for the start tab, and keeps the selection when that tab becomes disabled', async () => {
    const lock = signal(false);
    await render(
      `<div cckTabs aria-label="x">
        <div cckTab label="A" disabled>a</div>
        <div cckTab label="B" [disabled]="lock()">b</div>
        <div cckTab label="C">c</div>
      </div>`,
      { imports, componentProperties: { lock } },
    );
    expect(tab('B').getAttribute('aria-selected')).toBe('true');
    lock.set(true);
    await waitFor(() => {
      expect((tab('B') as HTMLButtonElement).disabled).toBe(true);
    });
    expect(tab('B').getAttribute('aria-selected')).toBe('true');
    expect(tab('C').getAttribute('aria-selected')).toBe('false');
    expect(tab('C').tabIndex).toBe(0);
  });
});

describe('Tabs keyboard', () => {
  it('has one tab stop: Tab enters at the selected tab and the next Tab goes to its panel', async () => {
    const user = userEvent.setup();
    await render(`<button>before</button>${THREE}`, { imports, componentProperties: hostState() });
    await user.tab();
    await user.tab();
    expect(document.activeElement).toBe(tab('Account'));
    await user.tab();
    expect(document.activeElement).toBe(panel('Account'));
  });

  it('moves with the arrows, wraps, and selects in automatic mode', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(Host);
    tab('Account').focus();
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(tab('Password'));
    expect(tab('Password').getAttribute('aria-selected')).toBe('true');
    await user.keyboard('{ArrowRight}{ArrowRight}');
    expect(document.activeElement).toBe(tab('Account'));
    await user.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(tab('Notifications'));
    expect(fixture.componentInstance.changes.map((change) => change.index)).toEqual([1, 2, 0, 2]);
    expect(tab('Notifications').tabIndex).toBe(0);
  });

  it('moves to the first and last enabled tab with Home and End', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(Host);
    fixture.componentInstance.lockPassword.set(true);
    tab('Account').focus();
    await user.keyboard('{End}');
    expect(document.activeElement).toBe(tab('Notifications'));
    await user.keyboard('{Home}');
    expect(document.activeElement).toBe(tab('Account'));
  });

  it('skips a disabled tab', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(Host);
    fixture.componentInstance.lockPassword.set(true);
    await waitFor(() => {
      expect((tab('Password') as HTMLButtonElement).disabled).toBe(true);
    });
    tab('Account').focus();
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(tab('Notifications'));
  });

  it('moves focus without selecting in manual mode, and selects with Enter and Space', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(Host);
    fixture.componentInstance.mode.set('manual');
    tab('Account').focus();
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(tab('Password'));
    expect(tab('Password').getAttribute('aria-selected')).toBe('false');
    expect(tab('Account').tabIndex).toBe(0);
    await user.keyboard('{Enter}');
    expect(tab('Password').getAttribute('aria-selected')).toBe('true');
    await user.keyboard('{ArrowRight}');
    await user.keyboard(' ');
    expect(tab('Notifications').getAttribute('aria-selected')).toBe('true');
  });

  it('uses Up and Down in a vertical list and ignores Left and Right', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(Host);
    fixture.componentInstance.orientation.set('vertical');
    await waitFor(() => {
      expect(screen.getByRole('tablist').getAttribute('aria-orientation')).toBe('vertical');
    });
    tab('Account').focus();
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(tab('Account'));
    await user.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(tab('Password'));
    await user.keyboard('{ArrowUp}{ArrowUp}');
    expect(document.activeElement).toBe(tab('Notifications'));
  });

  it('flips the horizontal arrows in rtl', async () => {
    const user = userEvent.setup();
    await render(`<div cckDir dir="rtl">${THREE}</div>`, { imports, componentProperties: hostState() });
    tab('Account').focus();
    await user.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(tab('Password'));
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(tab('Account'));
  });

  it('does not handle a key with a modifier', async () => {
    const user = userEvent.setup();
    await render(Host);
    tab('Account').focus();
    await user.keyboard('{Shift>}{ArrowRight}{/Shift}');
    expect(document.activeElement).toBe(tab('Account'));
  });

  it('marks the trigger focused by keyboard with data-focus-visible, and not after a pointer press', async () => {
    const user = userEvent.setup();
    await render(Host);
    tab('Account').focus();
    await user.keyboard('{ArrowRight}');
    expect(tab('Password').hasAttribute('data-focus-visible')).toBe(true);
    expect(tab('Account').hasAttribute('data-focus-visible')).toBe(false);
    await user.click(tab('Notifications'));
    expect(tab('Notifications').hasAttribute('data-focus-visible')).toBe(false);
  });
});

describe('Tabs collection', () => {
  it('follows tabs added, removed and reordered in the template', async () => {
    const tabs = signal(['a', 'b', 'c']);
    const user = userEvent.setup();
    await render(
      `<div cckTabs aria-label="x">
        @for (name of tabs(); track name) { <div cckTab [label]="name">{{ name }} body</div> }
      </div>`,
      { imports, componentProperties: { tabs } },
    );
    expect(labels()).toEqual(['a', 'b', 'c']);
    tabs.set(['c', 'a']);
    await waitFor(() => {
      expect(labels()).toEqual(['c', 'a']);
    });
    expect(tab('a').getAttribute('aria-selected')).toBe('true');
    tab('a').focus();
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(tab('c'));
  });
});
