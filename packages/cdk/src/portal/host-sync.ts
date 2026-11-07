import type { Direction } from '@cocokits/shared';
import { composedParent, isShadowRoot } from '@cocokits/utils';

/** @internal One live host and what it mirrors. */
export interface HostEntry {
  readonly host: HTMLElement;
  readonly getTrigger: () => Element | null;
  readonly modeAttrNames: readonly string[];
  readonly getDirection: () => Direction;
  /** Moves the host to the container the trigger resolves to now, and shows it again, when that changed. */
  readonly relocate: () => void;
}

interface DocumentSync {
  readonly observer: MutationObserver;
  /** In creation order: a set keeps the order of insertion. */
  readonly entries: Set<HostEntry>;
  /** Removes the fullscreen listeners. */
  readonly stopFullscreen: () => void;
}

/** The standard event and the prefixed one older Safari fires; the second is idempotent after the first. */
const FULLSCREEN_EVENTS = ['fullscreenchange', 'webkitfullscreenchange'] as const;

const syncs = new WeakMap<Document, DocumentSync>();

/** The value of `data-<name>` on the closest ancestor of the element that has it, shadow roots crossed. */
function resolveMode(trigger: Element, name: string): string | null {
  const attribute = `data-${name}`;
  for (let current: Node | null = trigger; current; current = composedParent(current)) {
    if (current.nodeType === 1 && (current as Element).hasAttribute(attribute)) {
      return (current as Element).getAttribute(attribute);
    }
  }
  return null;
}

/** Writes only a changed value: the observer sees the host too, and a same-value write would loop. */
function setAttributeIfChanged(host: HTMLElement, name: string, value: string | null): void {
  if (host.getAttribute(name) === value) return;
  if (value === null) host.removeAttribute(name);
  else host.setAttribute(name, value);
}

/** @internal Copies the direction and the modes of the trigger onto the host. */
export function syncHost(entry: HostEntry): void {
  setAttributeIfChanged(entry.host, 'dir', entry.getDirection());
  const trigger = entry.getTrigger();
  if (!trigger) return;
  for (const name of entry.modeAttrNames) {
    setAttributeIfChanged(entry.host, `data-${name}`, resolveMode(trigger, name));
  }
}

function observe(doc: Document, sync: DocumentSync): void {
  sync.observer.disconnect();
  const attributeFilter = new Set(['dir']);
  const targets = new Set<Node>([doc]);
  for (const entry of sync.entries) {
    entry.modeAttrNames.forEach((name) => attributeFilter.add(`data-${name}`));
    const root = entry.getTrigger()?.getRootNode();
    if (root && isShadowRoot(root)) targets.add(root);
  }
  for (const target of targets) {
    sync.observer.observe(target, { attributes: true, subtree: true, attributeFilter: [...attributeFilter] });
  }
}

/** @internal Keeps the host in sync until `release`; one observer per document serves every host. */
export function registerHost(doc: Document, entry: HostEntry): () => void {
  let sync = syncs.get(doc);
  if (!sync) {
    const entries = new Set<HostEntry>();
    // A fullscreen element is drawn above hosts that were shown before it: each open host moves into the
    // new container and is shown again, parent overlays first so a nested overlay stays above its parent.
    const onFullscreenChange = (): void => {
      entries.forEach((entry) => {
        entry.relocate();
      });
    };
    FULLSCREEN_EVENTS.forEach((name) => {
      doc.addEventListener(name, onFullscreenChange);
    });
    const created: DocumentSync = {
      entries,
      observer: new (doc.defaultView?.MutationObserver ?? MutationObserver)(() => {
        created.entries.forEach(syncHost);
      }),
      stopFullscreen: () => {
        FULLSCREEN_EVENTS.forEach((name) => {
          doc.removeEventListener(name, onFullscreenChange);
        });
      },
    };
    sync = created;
    syncs.set(doc, sync);
  }
  const current = sync;
  current.entries.add(entry);
  syncHost(entry);
  observe(doc, current);
  return () => {
    if (!current.entries.delete(entry)) return;
    if (current.entries.size === 0) {
      current.observer.disconnect();
      current.stopFullscreen();
      syncs.delete(doc);
    } else {
      observe(doc, current);
    }
  };
}
