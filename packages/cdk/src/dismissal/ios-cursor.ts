/**
 * iOS and iPadOS WebKit send no `click` for a non-interactive element unless it looks clickable, and a touch
 * press is dispatched on `click`. Angular CDK's outside-click dispatcher does the same: `cursor: pointer` on `body`.
 */
function isIos(doc: Document): boolean {
  const navigator = doc.defaultView?.navigator;
  if (!navigator) return false;
  const agent = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(agent) || (agent.includes('Macintosh') && navigator.maxTouchPoints > 1);
}

/** @internal Sets and restores the body cursor on iOS while a listening layer exists. */
export interface IosCursor {
  /** `wanted`: at least one layer listens for outside presses. */
  sync(wanted: boolean): void;
}

/** @internal The author's cursor is restored after the last listening layer. */
export function createIosCursor(doc: Document): IosCursor {
  let previous: string | null = null;
  return {
    sync(wanted) {
      if (wanted && previous === null && isIos(doc)) {
        previous = doc.body.style.cursor;
        doc.body.style.cursor = 'pointer';
      } else if (!wanted && previous !== null) {
        doc.body.style.cursor = previous;
        previous = null;
      }
    },
  };
}
