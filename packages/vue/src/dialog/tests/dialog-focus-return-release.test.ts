// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { cleanup } from '@testing-library/vue';
import { h, ref } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { FocusReturnOptions } from '@cocokits/cdk/focus';
import { button, dialog, dialogView, mountView, open, settle, stubOverlayBrowser } from './fixtures';

// Each captured focus return, and whether it was restored or destroyed: until then the cdk keeps it.
const { returns } = vi.hoisted(() => ({ returns: [] as { released: boolean }[] }));

vi.mock('@cocokits/cdk/focus', async (importOriginal) => {
  const original = await importOriginal<typeof import('@cocokits/cdk/focus')>();
  return {
    ...original,
    captureFocusReturn: (options: FocusReturnOptions) => {
      const focusReturn = original.captureFocusReturn(options);
      const entry = { released: false };
      returns.push(entry);
      return {
        restore: () => {
          entry.released = true;
          focusReturn.restore();
        },
        destroy: () => {
          entry.released = true;
          focusReturn.destroy();
        },
      };
    },
  };
});

beforeEach(() => {
  stubOverlayBrowser();
  returns.length = 0;
});
afterEach(() => {
  cleanup();
  Reflect.deleteProperty(document, 'fullscreenElement');
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
  document.documentElement.removeAttribute('style');
});

/** Expects every captured focus return to be restored or destroyed. */
function expectAllReleased(): void {
  expect(returns.length).toBeGreaterThan(0);
  expect(returns.filter((entry) => !entry.released)).toHaveLength(0);
}

describe('The focus return of a Dialog', () => {
  it('is released when a dialog with restoreFocus false closes', async () => {
    mountView(dialogView({ rootProps: { restoreFocus: false } }));
    await open();
    await userEvent.click(button('Cancel'));
    await settle();
    expect(dialog()).toBeNull();
    expectAllReleased();
  });

  it('is released when the open dialog is removed', async () => {
    const shown = ref(true);
    const inner = dialogView({});
    mountView(() => (shown.value ? inner() : [h('p', null, 'gone')]));
    await open();
    shown.value = false;
    await settle();
    expect(dialog()).toBeNull();
    expectAllReleased();
  });
});
