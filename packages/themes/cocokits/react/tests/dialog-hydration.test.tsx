// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { StrictMode, type ReactElement } from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '@cocokits/react-core';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { Dialog } from '../src/index';

/** jsdom has no top layer and no modal dialog: the stubs show a popover and mark a modal dialog as open. */
beforeEach(() => {
  Object.defineProperty(document.documentElement, 'scrollHeight', { configurable: true, value: 2000 });
  const matches = Reflect.get(Element.prototype, 'matches') as (this: Element, selector: string) => boolean;
  vi.spyOn(Element.prototype, 'matches').mockImplementation(function (this: Element, selector: string) {
    if (selector === ':modal') return this.localName === 'dialog' && this.hasAttribute('data-modal');
    return matches.call(this, selector);
  });
  HTMLElement.prototype.showPopover = function (this: HTMLElement) {
    this.style.display = 'block';
  };
  Element.prototype.scrollIntoView = vi.fn();
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
    this.setAttribute('open', '');
    this.setAttribute('data-modal', '');
  };
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
    this.removeAttribute('open');
    this.removeAttribute('data-modal');
  };
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
  document.documentElement.removeAttribute('style');
});

function App({ size }: { size: 'lg' | 'sm' }): ReactElement {
  return (
    <StrictMode>
      <ThemeProvider themeConfig={cocokitsThemeConfig}>
        <Dialog.Root defaultOpen size={size}>
          <Dialog.Trigger>Open</Dialog.Trigger>
          <Dialog.Content aria-label="Panel">
            <Dialog.Title>Delete project</Dialog.Title>
          </Dialog.Content>
        </Dialog.Root>
      </ThemeProvider>
    </StrictMode>
  );
}

describe('theme dialog hydration', () => {
  it('shows the root size on the open content right after hydration, and a later change shows the new size', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const container = document.body.appendChild(document.createElement('div'));
    container.innerHTML = renderToString(<App size="lg" />);
    expect(container.querySelector('dialog')).toBeNull();

    const { rerender } = render(<App size="lg" />, { container, hydrate: true });
    const content = await screen.findByRole('dialog');
    expect(content.getAttribute('data-size')).toBe('lg');
    expect(error).not.toHaveBeenCalled();

    rerender(<App size="sm" />);
    expect((await screen.findByRole('dialog')).getAttribute('data-size')).toBe('sm');
  });
});
