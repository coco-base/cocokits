interface Registry {
  readonly observer: MutationObserver;
  readonly subscribers: Set<() => void>;
}

/** One observer per document, torn down when its last subscriber leaves. */
const registries = new WeakMap<Document, Registry>();

/** Whether `fieldset` disables `element`: it has `disabled` and `element` is outside its first `legend`. */
function fieldsetDisables(fieldset: Element, element: Element): boolean {
  const legend = Array.from(fieldset.children).find((child) => child.localName === 'legend');
  return !legend?.contains(element);
}

/**
 * Whether an ancestor `fieldset[disabled]` disables the element (HTML "concept-fe-disabled"). The
 * element's own `disabled` attribute is not looked at, and neither is a disabled fieldset whose
 * first `legend` contains the element.
 *
 * @param element - The control to check.
 * @returns `true` when a disabling ancestor fieldset exists.
 */
export function isDisabledByFieldset(element: Element): boolean {
  let fieldset = element.parentElement?.closest('fieldset[disabled]') ?? null;
  while (fieldset !== null) {
    if (fieldsetDisables(fieldset, element)) return true;
    fieldset = fieldset.parentElement?.closest('fieldset[disabled]') ?? null;
  }
  return false;
}

function acquire(doc: Document): Registry | null {
  const existing = registries.get(doc);
  if (existing !== undefined) return existing;
  const Observer = doc.defaultView?.MutationObserver;
  if (Observer === undefined) return null;
  const subscribers = new Set<() => void>();
  const observer = new Observer((records) => {
    if (!records.some((record) => (record.target as Element).localName === 'fieldset')) return;
    for (const subscriber of Array.from(subscribers)) subscriber();
  });
  observer.observe(doc, { attributes: true, attributeFilter: ['disabled'], subtree: true });
  const registry = { observer, subscribers };
  registries.set(doc, registry);
  return registry;
}

/**
 * Reports whether an ancestor fieldset disables the element: once now, then whenever a fieldset's
 * `disabled` attribute changes and the answer differs. A move into a disabled fieldset is seen on
 * the next change. Observers are per document and ref-counted.
 *
 * @param element - The control to watch.
 * @param onChange - Called with the current answer, then with each different answer.
 * @returns An idempotent cleanup.
 */
export function watchFieldsetDisabled(element: Element, onChange: (disabled: boolean) => void): () => void {
  let last = isDisabledByFieldset(element);
  onChange(last);
  const doc = element.ownerDocument;
  const registry = acquire(doc);
  if (registry === null) return () => undefined;
  const subscriber = (): void => {
    const next = isDisabledByFieldset(element);
    if (next === last) return;
    last = next;
    onChange(next);
  };
  registry.subscribers.add(subscriber);
  return () => {
    if (!registry.subscribers.delete(subscriber)) return;
    if (registry.subscribers.size > 0) return;
    registry.observer.disconnect();
    registries.delete(doc);
  };
}
