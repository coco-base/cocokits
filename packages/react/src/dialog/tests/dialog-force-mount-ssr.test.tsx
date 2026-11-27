// @vitest-environment node
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Dialog } from '../index';

describe('Dialog forceMount and modal on the server', () => {
  it('renders a force-mounted closed dialog without the content, as for every overlay', () => {
    const html = renderToString(
      <Dialog.Root>
        <Dialog.Trigger>Delete</Dialog.Trigger>
        <Dialog.Content forceMount>
          <Dialog.Title>Delete project</Dialog.Title>
        </Dialog.Content>
      </Dialog.Root>,
    );
    expect(html).toContain('class="cck-dialog__trigger"');
    expect(html).not.toContain('aria-controls');
    expect(html).not.toContain('<dialog');
    expect(html).not.toContain('cck-dialog__title');
  });

  it('renders a non-modal dialog that is open by default closed', () => {
    const html = renderToString(
      <Dialog.Root modal={false} defaultOpen>
        <Dialog.Trigger>Delete</Dialog.Trigger>
        <Dialog.Content aria-label="x">text</Dialog.Content>
      </Dialog.Root>,
    );
    expect(html).toContain('aria-expanded="true"');
    expect(html).not.toContain('<dialog');
  });
});
