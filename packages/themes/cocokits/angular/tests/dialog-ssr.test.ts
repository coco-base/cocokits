// @vitest-environment node
import '@angular/compiler';
import { Component } from '@angular/core';
import { CckDialogImports } from '@cocokits/angular/dialog';
import { describe, expect, it } from 'vitest';
import { CckDialogContentTheme, CckDialogTheme } from '../src/index';
import { renderThemedApp } from './ssr-helpers';

@Component({
  selector: 'app-root',
  imports: [CckDialogImports, CckDialogTheme, CckDialogContentTheme],
  template: `
    <button [cckDialogTriggerFor]="dialog" [open]="true" dialogSize="lg" type="button">Open</button>
    <ng-template #dialog>
      <dialog cckDialogContent>
        <h2 cckDialogTitle>{{ title }}</h2>
      </dialog>
    </ng-template>
  `,
})
class Root {
  protected readonly title = 'Delete project';
}

describe('theme dialog on the server', () => {
  // The base content renders nothing on the server, even for a dialog that starts open, so no `data-size` is there
  // to read: the size shows in the first browser render (`dialog-open-at-start.test.ts`).
  it('has no window access and renders the trigger of a dialog that is open at start, and no content', async () => {
    expect(typeof window).toBe('undefined');
    const html = await renderThemedApp(Root, true);
    expect(html).toContain('aria-expanded="true"');
    expect(html).not.toContain('<dialog');
    expect(html).not.toContain('data-size');
  });
});
