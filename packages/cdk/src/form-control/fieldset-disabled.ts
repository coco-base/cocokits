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
 * Whether an ancestor `fieldset[disabled]` disables the element, as HTML defines it.
 * The element's own `disabled` attribute is not read.
 * A disabled fieldset does not count when its first `legend` contains the element.
 *
 * @param element - The control to check.
 * @returns `true` when a disabling ancestor fieldset exists.
 * @example
 * const input = document.querySelector<HTMLInputElement>('input')!;
 * console.log(isDisabledByFieldset(input));
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
 * Reports whether an ancestor fieldset disables the element. It reports once now, then again whenever the
 * `disabled` attribute of a fieldset changes and the answer is different.
 *
 * @remarks
 * A move into a disabled fieldset is seen on the next change. One observer serves each document.
 *
 * @param element - The control to watch.
 * @param onChange - Called with the current answer, then with each different answer.
 * @returns The stop function. Calling it again does nothing.
 * @example
 * const input = document.querySelector<HTMLInputElement>('input')!;
 * const stop = watchFieldsetDisabled(input, (disabled) => {
 *   input.toggleAttribute('data-disabled', disabled);
 * });
 * // Later, when you are done:
 * stop();
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
