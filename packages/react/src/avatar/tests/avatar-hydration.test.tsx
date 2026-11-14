// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import { StrictMode, type ReactElement } from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Avatar } from '../index';
import { FakeImage } from './fixtures';

beforeEach(() => {
  vi.stubGlobal('Image', FakeImage);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function App(): ReactElement {
  return (
    <StrictMode>
      <Avatar.Root>
        <Avatar.Image src="/ada.webp" alt="Ada Park" />
        <Avatar.Fallback>AP</Avatar.Fallback>
      </Avatar.Root>
      <Avatar.Root>
        <Avatar.Image src="/bob.webp" alt="Bob Kim" />
        <Avatar.Fallback delayMs={600}>BK</Avatar.Fallback>
      </Avatar.Root>
    </StrictMode>
  );
}

describe('Avatar hydration', () => {
  it('hydrates the server markup without a mismatch and leaves it unchanged', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const container = document.body.appendChild(document.createElement('div'));
    container.innerHTML = renderToString(<App />);
    const serverHtml = container.innerHTML;

    render(<App />, { container, hydrate: true });

    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    expect(container.innerHTML).toBe(serverHtml);
  });
});
