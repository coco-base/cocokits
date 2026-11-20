import { Component } from '@angular/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { stubOverlayApis } from './overlay-stubs';
import { dialogElement, must, setup, settle } from './service-fixtures';

@Component({
  selector: 'focus-body',
  template: `
    <h2 id="heading">Heading</h2>
    <button id="first">First</button>
    <span id="plain">Plain</span>
    <input id="marked" autofocus />
  `,
})
class FocusBody {
  readonly marker = true;
}

@Component({
  selector: 'focus-bare',
  template: `<button id="only">Only</button>
    <h3 id="h3">Heading</h3>`,
})
class FocusBare {
  readonly marker = true;
}

beforeEach(stubOverlayApis);
afterEach(() => {
  vi.restoreAllMocks();
  document.documentElement.removeAttribute('style');
  document.body.innerHTML = '';
});

const activeId = (): string | undefined => document.activeElement?.id;

describe('autoFocus', () => {
  it("'first-tabbable' (and true) focuses the [autofocus] element first", async () => {
    const { host } = await setup();
    host.service.open(FocusBody, { autoFocus: 'first-tabbable' });
    await dialogElement();
    expect(activeId()).toBe('marked');
  });

  it("'first-tabbable' focuses the first tabbable element when nothing is marked", async () => {
    const { host } = await setup();
    host.service.open(FocusBare, { autoFocus: true });
    await dialogElement();
    expect(activeId()).toBe('only');
  });

  it("'dialog' and false render the dialog with autofocus so the browser focuses the dialog itself", async () => {
    const { host } = await setup();
    host.service.open(FocusBody, { autoFocus: 'dialog' });
    const dialog = await dialogElement();
    expect(dialog.hasAttribute('autofocus')).toBe(true);
    host.service.closeAll();
    await vi.waitFor(() => {
      expect(document.querySelector('dialog')).toBeNull();
    });
    host.service.open(FocusBody, { autoFocus: false });
    expect((await dialogElement()).hasAttribute('autofocus')).toBe(true);
  });

  it("'first-heading' focuses the heading with a temporary tabindex", async () => {
    const { host } = await setup();
    host.service.open(FocusBody, { autoFocus: 'first-heading' });
    await dialogElement();
    const heading = must(document.getElementById('heading'));
    expect(document.activeElement).toBe(heading);
    expect(heading.getAttribute('tabindex')).toBe('-1');
    must(document.getElementById('first')).focus();
    expect(heading.hasAttribute('tabindex')).toBe(false);
  });

  it('a selector focuses the first match; no match leaves focus where the browser put it', async () => {
    const { host } = await setup();
    host.service.open(FocusBody, { autoFocus: '#plain' });
    await dialogElement();
    expect(activeId()).toBe('plain');
    host.service.closeAll();
    await vi.waitFor(() => {
      expect(document.querySelector('dialog')).toBeNull();
    });
    host.service.open(FocusBody, { autoFocus: '#missing' });
    await dialogElement();
    expect(activeId()).not.toBe('plain');
  });

  it('undefined moves nothing beyond the native focusing steps', async () => {
    const { host } = await setup();
    host.service.open(FocusBare, { autoFocus: undefined });
    await dialogElement();
    expect(activeId()).toBe('only');
  });
});

describe('restoreFocus', () => {
  async function closeAndSettle(open: (host: Awaited<ReturnType<typeof setup>>['host']) => void): Promise<void> {
    const { host } = await setup();
    open(host);
    await dialogElement();
    host.service.closeAll();
    await vi.waitFor(() => {
      expect(document.querySelector('dialog')).toBeNull();
    });
    await vi.waitFor(() => {
      expect(host.service.openDialogs).toHaveLength(0);
    });
    await settle();
  }

  it('true returns focus to the element that had it at the call', async () => {
    await closeAndSettle((host) => host.service.open(FocusBody, { restoreFocus: true }));
    await vi.waitFor(() => {
      expect(activeId()).toBe('opener');
    });
  });

  it('a selector returns focus to its first match at close', async () => {
    document.body.insertAdjacentHTML('beforeend', '<button id="elsewhere">Elsewhere</button>');
    await closeAndSettle((host) => host.service.open(FocusBody, { restoreFocus: '#elsewhere' }));
    await vi.waitFor(() => {
      expect(activeId()).toBe('elsewhere');
    });
  });

  it('an element returns focus to that element', async () => {
    const target = document.createElement('button');
    target.id = 'given';
    document.body.append(target);
    await closeAndSettle((host) => host.service.open(FocusBody, { restoreFocus: target }));
    await vi.waitFor(() => {
      expect(activeId()).toBe('given');
    });
  });

  it('false moves focus nowhere', async () => {
    await closeAndSettle((host) => host.service.open(FocusBody, { restoreFocus: false }));
    expect(activeId()).not.toBe('opener');
  });

  it('emits afterClosed after focus went back, so a subscriber can move focus elsewhere', async () => {
    const { host } = await setup();
    const other = document.createElement('button');
    other.id = 'other';
    document.body.append(other);
    const ref = host.service.open(FocusBody);
    ref.afterClosed().subscribe(() => {
      other.focus();
    });
    await dialogElement();
    ref.close();
    await vi.waitFor(() => {
      expect(ref.getState()).toBe('closed');
    });
    await settle();
    expect(activeId()).toBe('other');
  });
});
