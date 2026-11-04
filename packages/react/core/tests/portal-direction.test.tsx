// @vitest-environment jsdom
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { act, cleanup, render } from '@testing-library/react';
import { StrictMode, createContext, useContext, type ReactElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineThemeConfig, type ModeCollection } from '@cocokits/shared';
import { DirectionProvider, Portal, ThemeProvider, useDirection } from '../src/index';

const showPopover = vi.fn();

beforeEach(() => {
  // jsdom has no top layer: emulate `:modal` (a dialog with `data-modal`) and `showPopover`.
  vi.spyOn(Element.prototype, 'matches').mockImplementation(function (this: Element, selector: string) {
    return selector === ':modal' && this.localName === 'dialog' && this.hasAttribute('data-modal');
  });
  HTMLElement.prototype.showPopover = showPopover;
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  showPopover.mockClear();
  document.body.innerHTML = '';
  document.documentElement.removeAttribute('dir');
});

const modeCollection = (attrName: string, componentName?: string): ModeCollection => ({
  name: attrName,
  attrName,
  ...(componentName === undefined ? {} : { componentName }),
  modes: [{ name: 'Light', value: 'light' }],
  defaultMode: 'Light',
});

const themeConfig = defineThemeConfig({
  name: 'test',
  components: {},
  modeCollections: [modeCollection('cck-color-mode'), modeCollection('cck-btn-mode', 'button')],
});

const getTrigger = (): Element | null => document.getElementById('t');
const hosts = (): Element[] => [...document.querySelectorAll('[popover="manual"]')];

function Overlay({ open = true }: { readonly open?: boolean }): ReactElement {
  return (
    <>
      <button id="t">trigger</button>
      <Portal open={open} getTrigger={getTrigger}>
        <p id="content">content</p>
      </Portal>
    </>
  );
}

describe('Portal', () => {
  it('renders the content in the host, not inside the trigger parent', () => {
    const { container } = render(
      <StrictMode>
        <Overlay />
      </StrictMode>,
    );
    const content = document.getElementById('content');
    expect(content).not.toBeNull();
    expect(container.contains(content)).toBe(false);
    expect(content?.parentElement?.getAttribute('popover')).toBe('manual');
    expect(hosts()).toHaveLength(1);
    expect(showPopover).toHaveBeenCalled();
  });

  it('renders nothing and creates no host while closed, and removes the host on close', () => {
    const { rerender } = render(<Overlay open={false} />);
    expect(document.getElementById('content')).toBeNull();
    expect(hosts()).toHaveLength(0);
    rerender(<Overlay open />);
    expect(hosts()).toHaveLength(1);
    rerender(<Overlay open={false} />);
    expect(document.getElementById('content')).toBeNull();
    expect(hosts()).toHaveLength(0);
  });

  it('leaves no host after unmount in StrictMode', () => {
    const { unmount } = render(
      <StrictMode>
        <Overlay />
      </StrictMode>,
    );
    unmount();
    expect(hosts()).toHaveLength(0);
  });

  it('puts the host inside an open modal dialog that contains the trigger', () => {
    render(
      <dialog open data-modal="">
        <Overlay />
      </dialog>,
    );
    expect(hosts()[0]?.parentElement?.localName).toBe('dialog');
  });

  it('copies the page-wide mode attribute of the trigger and not a component one', () => {
    render(
      <ThemeProvider themeConfig={themeConfig}>
        <div data-cck-color-mode="dark" data-cck-btn-mode="x">
          <Overlay />
        </div>
      </ThemeProvider>,
    );
    const host = hosts()[0];
    expect(host?.getAttribute('data-cck-color-mode')).toBe('dark');
    expect(host?.hasAttribute('data-cck-btn-mode')).toBe(false);
  });

  it('mirrors no mode without modeCollections', () => {
    render(
      <div data-cck-color-mode="dark">
        <Overlay />
      </div>,
    );
    expect(hosts()[0]?.hasAttribute('data-cck-color-mode')).toBe(false);
  });

  it('gives the host the direction of the direction runtime', () => {
    render(
      <DirectionProvider dir="rtl">
        <Overlay />
      </DirectionProvider>,
    );
    expect(hosts()[0]?.getAttribute('dir')).toBe('rtl');
  });

  it('keeps React context across the portal', () => {
    const Value = createContext('none');
    function Read(): ReactElement {
      return <i id="read">{useContext(Value)}</i>;
    }
    function Dir(): ReactElement {
      return <b id="dir">{useDirection()}</b>;
    }
    render(
      <Value value="from-provider">
        <DirectionProvider dir="rtl">
          <button id="t">t</button>
          <Portal open getTrigger={getTrigger}>
            <Read />
            <Dir />
          </Portal>
        </DirectionProvider>
      </Value>,
    );
    expect(document.getElementById('read')?.textContent).toBe('from-provider');
    expect(document.getElementById('dir')?.textContent).toBe('rtl');
  });

  it('renders nothing on the server, open or closed', () => {
    expect(renderToString(<Overlay open={false} />)).not.toContain('content');
    expect(renderToString(<Overlay open />)).not.toContain('content');
  });

  it('hydrates an open portal without a mismatch and shows the content after hydration', () => {
    const errors = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const container = document.createElement('div');
    document.body.append(container);
    container.innerHTML = renderToString(<Overlay open />);
    act(() => {
      hydrateRoot(container, <Overlay open />);
    });
    expect(errors).not.toHaveBeenCalled();
    expect(document.getElementById('content')).not.toBeNull();
    expect(hosts()).toHaveLength(1);
  });
});

describe('useDirection', () => {
  function Probe(): ReactElement {
    return <i>{useDirection()}</i>;
  }

  it('defaults to ltr, reads the provider and lets a nested provider win', () => {
    expect(renderToString(<Probe />)).toContain('ltr');
    expect(
      renderToString(
        <DirectionProvider dir="rtl">
          <Probe />
        </DirectionProvider>,
      ),
    ).toContain('rtl');
    expect(
      renderToString(
        <DirectionProvider dir="rtl">
          <DirectionProvider dir="ltr">
            <Probe />
          </DirectionProvider>
        </DirectionProvider>,
      ),
    ).toContain('ltr');
  });
});
