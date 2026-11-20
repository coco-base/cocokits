// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { Dialog } from '../src/index';
import { html } from './helpers';

describe('theme dialog on the server', () => {
  it('has no window or document, so the import and render prove no DOM access', () => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
  });

  // The base content renders nothing on the server, even for a dialog that starts open, so no `data-size` is there
  // to read: the size shows after hydration (`dialog-hydration.test.tsx`).
  it('renders the trigger of a dialog with a root size that is open at start, and no content', () => {
    const markup = html(
      <Dialog.Root defaultOpen size="lg">
        <Dialog.Trigger>Open</Dialog.Trigger>
        <Dialog.Content aria-label="Panel">
          <Dialog.Title>Delete project</Dialog.Title>
        </Dialog.Content>
      </Dialog.Root>,
    );
    expect(markup).toContain('aria-expanded="true"');
    expect(markup).not.toContain('<dialog');
    expect(markup).not.toContain('data-size');
  });
});
