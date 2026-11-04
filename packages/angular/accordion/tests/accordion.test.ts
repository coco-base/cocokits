import { Component, signal } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { accordionAnatomy } from '@cocokits/machines/accordion';
import { describe, expect, it } from 'vitest';
import { CckAccordion, CckAccordionImports, CckAccordionItem } from '../index';

const imports = [...CckAccordionImports];
const { classes } = accordionAnatomy;

function must<T>(value: T | null | undefined): T {
  if (value == null) throw new Error('expected a value');
  return value;
}

const trigger = (name: string): HTMLElement => screen.getByRole('button', { name });
const expanded = (name: string): string | null => trigger(name).getAttribute('aria-expanded');
const region = (name: string): HTMLElement => {
  const element = document.getElementById(trigger(name).getAttribute('aria-controls') ?? '');
  if (!element) throw new Error(`no content for ${name}`);
  return element;
};

@Component({
  imports,
  template: `
    <div cckAccordion [multi]="multi()" #accordion="cckAccordion">
      <div
        cckAccordionItem
        #shipping="cckAccordionItem"
        label="Shipping"
        [(expanded)]="shippingOpen"
        (opened)="log.push('shipping opened')"
        (closed)="log.push('shipping closed')"
      >
        Shipping body <a href="#rates">Rates</a>
      </div>
      <div
        cckAccordionItem
        label="Returns"
        [expanded]="returnsOpen()"
        (expandedChange)="log.push('returns ' + $event)"
        (opened)="log.push('returns opened')"
        (closed)="log.push('returns closed')"
      >
        Returns body
      </div>
      <div cckAccordionItem label="Warranty" [disabled]="locked()">Warranty body</div>
      <div cckAccordionItem label="Care" [disabled]="true">Care body</div>
    </div>
    <button type="button" (click)="accordion.openAll()">open all</button>
    <button type="button" (click)="accordion.closeAll()">close all</button>
    <button type="button" (click)="shipping.toggle()">toggle shipping</button>
  `,
})
class Host {
  readonly multi = signal(false);
  readonly shippingOpen = signal(false);
  readonly returnsOpen = signal(false);
  readonly locked = signal(false);
  readonly log: string[] = [];
}

describe('Accordion rendered contract', () => {
  it('renders root > item > heading > button and a region per item with the fixed classes', async () => {
    const { container } = await render(Host);
    expect(container.querySelector(`.${classes.root}`)?.getAttribute('data-orientation')).toBe('vertical');
    expect(container.querySelector(`.${classes.root}`)?.hasAttribute('data-multiple')).toBe(false);
    expect(container.querySelector(`.${classes.root}`)?.hasAttribute('multi')).toBe(false);
    expect(container.querySelectorAll(`.${classes.root} > .${classes.item}`)).toHaveLength(4);
    const header = must(container.querySelector(`.${classes.item} > h3.${classes.header}`));
    expect(header.children).toHaveLength(1);
    const button = must(header.querySelector(`:scope > button.${classes.trigger}`));
    const content = must(container.querySelector(`.${classes.item} > div.${classes.content}`));
    expect(button.getAttribute('type')).toBe('button');
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(content.getAttribute('role')).toBe('region');
    expect(content.getAttribute('aria-labelledby')).toBe(button.id);
    expect(button.getAttribute('aria-controls')).toBe(content.id);
  });

  it('derives the trigger and content ids from one generated item id and leaves no input attribute on the item', async () => {
    const { container } = await render(Host);
    const item = must(container.querySelector(`.${classes.item}`));
    const button = must(item.querySelector(`.${classes.trigger}`));
    const content = must(item.querySelector(`.${classes.content}`));
    expect(button.id).toMatch(/-trigger$/);
    expect(content.id).toMatch(/-content$/);
    expect(button.id.replace(/-trigger$/, '')).toBe(content.id.replace(/-content$/, ''));
    for (const attribute of ['label', 'expanded', 'disabled', 'headinglevel']) {
      expect(item.hasAttribute(attribute), attribute).toBe(false);
    }
  });

  it('keeps closed content and its children in the DOM, hidden, and shows the open one', async () => {
    const user = userEvent.setup();
    await render(Host);
    expect(region('Shipping').hidden).toBe(true);
    expect(region('Shipping').textContent).toContain('Shipping body');
    expect(region('Shipping').getAttribute('data-state')).toBe('closed');
    await user.click(trigger('Shipping'));
    expect(region('Shipping').hidden).toBe(false);
    expect(region('Shipping').getAttribute('data-state')).toBe('open');
  });

  it('renders the label template and the heading level', async () => {
    const { container } = await render(
      `<div cckAccordion>
        <div cckAccordionItem headingLevel="2"><ng-template cckAccordionLabel><b>Returns</b> policy</ng-template>Body</div>
        <div cckAccordionItem [headingLevel]="6" label="Six">Six body</div>
      </div>`,
      { imports },
    );
    expect(container.querySelector(`h2.${classes.header} button b`)?.textContent).toBe('Returns');
    expect(trigger('Returns policy')).toBeTruthy();
    expect(container.querySelector(`h6.${classes.header}`)).toBeTruthy();
    expect(container.querySelectorAll(`h3.${classes.header}`)).toHaveLength(0);
  });

  it('throws a CocoKits error for an item outside an accordion', async () => {
    await expect(render('<div cckAccordionItem label="A">A</div>', { imports })).rejects.toThrow(
      /CocoKits: cckAccordionItem must be placed inside an element with cckAccordion/,
    );
  });
});

describe('Accordion open state', () => {
  it('single mode: opening an item closes the open one, and each closed item reports it', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(Host);
    await user.click(trigger('Shipping'));
    expect(expanded('Shipping')).toBe('true');
    await user.click(trigger('Returns'));
    expect(expanded('Shipping')).toBe('false');
    expect(expanded('Returns')).toBe('true');
    expect(fixture.componentInstance.shippingOpen()).toBe(false);
    expect(fixture.componentInstance.log).toEqual([
      'shipping opened',
      'shipping closed',
      'returns true',
      'returns opened',
    ]);
  });

  it('single mode can always close the open item', async () => {
    const user = userEvent.setup();
    await render(Host);
    await user.click(trigger('Shipping'));
    await user.click(trigger('Shipping'));
    expect(expanded('Shipping')).toBe('false');
    expect(trigger('Shipping').hasAttribute('aria-disabled')).toBe(false);
  });

  it('multi mode toggles each item on its own', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(Host);
    fixture.componentInstance.multi.set(true);
    await user.click(trigger('Shipping'));
    await user.click(trigger('Returns'));
    expect(expanded('Shipping')).toBe('true');
    expect(expanded('Returns')).toBe('true');
    await user.click(trigger('Shipping'));
    expect(expanded('Shipping')).toBe('false');
    expect(expanded('Returns')).toBe('true');
  });

  it('writes the model: [(expanded)] follows clicks and a parent write opens without a notification', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(Host);
    await user.click(trigger('Shipping'));
    expect(fixture.componentInstance.shippingOpen()).toBe(true);
    fixture.componentInstance.log.length = 0;
    fixture.componentInstance.returnsOpen.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(expanded('Returns')).toBe('true');
    expect(expanded('Shipping')).toBe('false');
    expect(fixture.componentInstance.log).toEqual(['shipping closed']);
    expect(region('Returns').hidden).toBe(false);
  });

  it('single mode keeps the last open item when several start expanded', async () => {
    await render(
      `<div cckAccordion>
        <div cckAccordionItem label="A" [expanded]="true">A</div>
        <div cckAccordionItem label="B" [expanded]="true">B</div>
        <div cckAccordionItem label="C">C</div>
      </div>`,
      { imports },
    );
    expect(expanded('A')).toBe('false');
    expect(expanded('B')).toBe('true');
  });

  it('multi mode keeps every item that starts expanded', async () => {
    await render(
      `<div cckAccordion multi>
        <div cckAccordionItem label="A" [expanded]="true">A</div>
        <div cckAccordionItem label="B" [expanded]="true">B</div>
      </div>`,
      { imports },
    );
    expect(expanded('A')).toBe('true');
    expect(expanded('B')).toBe('true');
  });
});

describe('Accordion methods', () => {
  it('item toggle, open and close notify; openAll needs multi; closeAll skips disabled items', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(Host);
    await user.click(screen.getByRole('button', { name: 'toggle shipping' }));
    expect(expanded('Shipping')).toBe('true');
    await user.click(screen.getByRole('button', { name: 'open all' }));
    expect(expanded('Returns')).toBe('false');
    fixture.componentInstance.multi.set(true);
    await user.click(screen.getByRole('button', { name: 'open all' }));
    expect(expanded('Returns')).toBe('true');
    expect(expanded('Warranty')).toBe('true');
    expect(expanded('Care')).toBe('false');
    await user.click(screen.getByRole('button', { name: 'close all' }));
    expect(expanded('Shipping')).toBe('false');
    expect(expanded('Returns')).toBe('false');
    expect(expanded('Warranty')).toBe('false');
  });

  it('do nothing for a disabled item', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(
      `<div cckAccordion multi>
        <div cckAccordionItem #a="cckAccordionItem" label="A" disabled (opened)="opened.push(1)">A</div>
        <div cckAccordionItem #b="cckAccordionItem" label="B" disabled [expanded]="true" (closed)="closed.push(1)">B</div>
        <button type="button" (click)="a.open(); a.toggle(); b.close()">go</button>
      </div>`,
      { imports, componentProperties: { opened: [] as number[], closed: [] as number[] } },
    );
    await user.click(screen.getByRole('button', { name: 'go' }));
    expect(expanded('A')).toBe('false');
    expect(expanded('B')).toBe('true');
    expect(fixture.componentInstance).toMatchObject({ opened: [], closed: [] });
  });
});

describe('Accordion disabled', () => {
  it('renders native disabled and data-disabled, ignores click and Enter', async () => {
    const user = userEvent.setup();
    const { container } = await render(Host);
    const care = trigger('Care');
    expect(care.hasAttribute('disabled')).toBe(true);
    expect(care.getAttribute('data-disabled')).toBe('');
    expect(care.closest(`.${classes.item}`)?.getAttribute('data-disabled')).toBe('');
    expect(container.querySelector(`.${classes.header}[data-disabled]`)).toBeTruthy();
    await user.click(care);
    expect(expanded('Care')).toBe('false');
  });

  it('a parent write can still open a disabled item', async () => {
    await render(`<div cckAccordion><div cckAccordionItem label="A" disabled [expanded]="true">A</div></div>`, {
      imports,
    });
    expect(expanded('A')).toBe('true');
    expect(trigger('A').hasAttribute('disabled')).toBe(true);
  });
});

describe('Accordion keyboard', () => {
  it('arrows move between enabled triggers and wrap; Home and End go to the ends; Tab visits each enabled trigger', async () => {
    const user = userEvent.setup();
    await render(Host);
    trigger('Shipping').focus();
    await user.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(trigger('Returns'));
    await user.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(trigger('Warranty'));
    await user.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(trigger('Shipping'));
    await user.keyboard('{ArrowUp}');
    expect(document.activeElement).toBe(trigger('Warranty'));
    await user.keyboard('{Home}');
    expect(document.activeElement).toBe(trigger('Shipping'));
    await user.keyboard('{End}');
    expect(document.activeElement).toBe(trigger('Warranty'));
    expect(expanded('Shipping')).toBe('false');
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(trigger('Warranty'));
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(trigger('Returns'));
  });

  it('Enter and Space toggle the focused item', async () => {
    const user = userEvent.setup();
    await render(Host);
    trigger('Returns').focus();
    await user.keyboard('{Enter}');
    expect(expanded('Returns')).toBe('true');
    await user.keyboard(' ');
    expect(expanded('Returns')).toBe('false');
  });

  it('does not handle arrows with a modifier', async () => {
    const user = userEvent.setup();
    await render(Host);
    trigger('Shipping').focus();
    await user.keyboard('{Alt>}{ArrowDown}{/Alt}');
    expect(document.activeElement).toBe(trigger('Shipping'));
  });

  it('never reaches the triggers of a nested accordion', async () => {
    const user = userEvent.setup();
    await render(
      `<div cckAccordion>
        <div cckAccordionItem label="Outer 1" [expanded]="true">
          <div cckAccordion>
            <div cckAccordionItem label="Inner 1">I1</div>
            <div cckAccordionItem label="Inner 2">I2</div>
          </div>
        </div>
        <div cckAccordionItem label="Outer 2">O2</div>
      </div>`,
      { imports },
    );
    trigger('Outer 1').focus();
    await user.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(trigger('Outer 2'));
    trigger('Inner 1').focus();
    await user.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(trigger('Inner 2'));
    await user.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(trigger('Inner 1'));
    await user.click(trigger('Inner 1'));
    expect(expanded('Inner 1')).toBe('true');
    expect(expanded('Outer 1')).toBe('true');
  });
});

describe('Accordion focus when content closes', () => {
  it('moves focus to the trigger when the content that holds it closes, before it is hidden', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(Host);
    await user.click(trigger('Shipping'));
    const link = screen.getByRole('link', { name: 'Rates' });
    link.focus();
    expect(document.activeElement).toBe(link);
    fixture.componentInstance.shippingOpen.set(false);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.activeElement).toBe(trigger('Shipping'));
    expect(region('Shipping').hidden).toBe(true);
  });

  it('falls back to the next enabled trigger when its own trigger is disabled', async () => {
    const open = signal(true);
    const { fixture } = await render(
      `<div cckAccordion>
        <div cckAccordionItem label="A">A</div>
        <div cckAccordionItem label="B" [disabled]="true" [expanded]="open()"><a href="#b">link b</a></div>
        <div cckAccordionItem label="C">C</div>
      </div>`,
      { imports, componentProperties: { open } },
    );
    screen.getByRole('link', { name: 'link b' }).focus();
    open.set(false);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.activeElement).toBe(trigger('C'));
  });

  it('does not move focus when an item opens', async () => {
    const user = userEvent.setup();
    await render(Host);
    trigger('Shipping').focus();
    await user.keyboard('{Enter}');
    expect(document.activeElement).toBe(trigger('Shipping'));
  });
});

describe('Accordion animation', () => {
  it('writes the size variables on a change after mount, never on the first render', async () => {
    const user = userEvent.setup();
    await render(
      `<div cckAccordion><div cckAccordionItem label="A" [expanded]="true">A</div><div cckAccordionItem label="B">B</div></div>`,
      { imports },
    );
    expect(region('A').style.getPropertyValue('--accordion-content-height')).toBe('');
    await user.click(trigger('B'));
    expect(region('B').style.getPropertyValue('--accordion-content-height')).toBe('0px');
    expect(region('B').style.getPropertyValue('--accordion-content-width')).toBe('0px');
    expect(region('A').style.getPropertyValue('--accordion-content-height')).toBe('0px');
  });

  it('keeps the closing content shown until its exit animation has finished, then hides it', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(
      `<div cckAccordion><div cckAccordionItem label="A" [expanded]="true">A</div></div>`,
      { imports },
    );
    const content = region('A');
    let finish: () => void = () => undefined;
    const finished = new Promise<void>((resolve) => {
      finish = resolve;
    });
    content.getAnimations = () => [
      {
        finished,
        animationName: 'close',
        playState: 'running',
        effect: { getComputedTiming: () => ({ endTime: 200 }) },
      } as unknown as Animation,
    ];
    await user.click(trigger('A'));
    expect(content.getAttribute('data-state')).toBe('closed');
    expect(content.hidden).toBe(false);
    finish();
    await finished;
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve, 0));
    fixture.detectChanges();
    expect(content.hidden).toBe(true);
  });
});

describe('Accordion classes', () => {
  it('exports the directives', () => {
    expect(CckAccordion).toBeDefined();
    expect(CckAccordionItem).toBeDefined();
  });
});
