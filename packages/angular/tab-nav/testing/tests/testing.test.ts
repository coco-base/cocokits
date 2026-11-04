import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { tabNavAnatomy } from '@cocokits/machines/tab-nav';
import { describe, expect, it } from 'vitest';
import { CckTabNavImports } from '../../index';
import { CckTabNavHarness, CckTabNavLinkHarness, CckTabNavPanelHarness } from '../index';

@Component({
  imports: [CckTabNavImports],
  template: `
    <nav cckTabNav aria-label="Plain">
      <a cckTabNavLink href="#overview" active>Overview</a>
      <a cckTabNavLink href="#activity" (click)="clicks.push('activity')">Activity</a>
      <a cckTabNavLink href="#settings" disabled>Settings</a>
    </nav>
    <nav cckTabNav aria-label="Linked" [tabPanel]="panel">
      <a cckTabNavLink href="#a">A</a>
      <a cckTabNavLink href="#b" active>B</a>
    </nav>
    <div cckTabNavPanel #panel="cckTabNavPanel">Panel text</div>
  `,
})
class Host {
  readonly clicks: string[] = [];
}

async function setup() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  const loader = TestbedHarnessEnvironment.loader(fixture);
  const [plain, linked] = await loader.getAllHarnesses(CckTabNavHarness);
  return { fixture, plain, linked };
}

describe('CckTabNavHarness', () => {
  it('uses the anatomy classes as its host selectors', () => {
    const { classes } = tabNavAnatomy;
    expect(CckTabNavHarness.hostSelector).toBe(`.${classes.root}`);
    expect(CckTabNavLinkHarness.hostSelector).toBe(`.${classes.link}`);
    expect(CckTabNavPanelHarness.hostSelector).toBe(`.${classes.panel}`);
  });

  it('reads the links', async () => {
    const { plain } = await setup();
    const links = await plain.getLinks();
    expect(await Promise.all(links.map((link) => link.getLabel()))).toEqual(['Overview', 'Activity', 'Settings']);
    expect(await Promise.all(links.map((link) => link.isActive()))).toEqual([true, false, false]);
    expect(await Promise.all(links.map((link) => link.isDisabled()))).toEqual([false, false, true]);
    expect(await plain.getLinks({ label: /^Act/ })).toHaveLength(1);
    expect(await (await plain.getActiveLink())?.getLabel()).toBe('Overview');
  });

  it('clicks a link', async () => {
    const { plain, fixture } = await setup();
    await plain.clickLink({ label: 'Activity' });
    await fixture.whenStable();
    expect(fixture.componentInstance.clicks).toEqual(['activity']);
    await expect(plain.clickLink({ label: 'Nope' })).rejects.toThrow(/Cannot find a link/);
  });

  it('gets the panel a nav controls', async () => {
    const { plain, linked } = await setup();
    const panel = await linked.getPanel();
    expect(await panel.getTextContent()).toBe('Panel text');
    await expect(plain.getPanel()).rejects.toThrow(/controls no panel/);
  });
});
