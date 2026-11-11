const TABBABLE =
  'a[href], area[href], button, input:not([type="hidden"]), select, textarea, summary, iframe, ' +
  'audio[controls], video[controls], [contenteditable]:not([contenteditable="false"]), [tabindex]';

/** The first `<summary>` child of a `<details>`: the only one that toggles it. */
function isFirstSummary(summary: Element): boolean {
  const details = summary.parentElement;
  return details?.localName === 'details' && details.querySelector(':scope > summary') === summary;
}

/** Whether the group of `radio` has an enabled checked radio. A disabled one takes no focus, so its peers stay reachable. */
function groupHasChecked(radio: HTMLInputElement): boolean {
  const scope = radio.form ?? radio.getRootNode();
  const members: Iterable<Element> = radio.form
    ? Array.from(radio.form.elements)
    : (scope as ParentNode).querySelectorAll('input[type="radio"]');
  for (const member of members) {
    const input = member as HTMLInputElement;
    if (
      input.type === 'radio' &&
      input.name === radio.name &&
      !input.form === !radio.form &&
      input.checked &&
      !input.matches(':disabled')
    ) {
      return true;
    }
  }
  return false;
}

function isTabbable(element: Element, view: Window): boolean {
  if (!element.matches(TABBABLE) || element.matches(':disabled')) return false;
  const tabindex = element.getAttribute('tabindex');
  if (tabindex !== null && Number.parseInt(tabindex, 10) < 0) return false;
  if (element.localName === 'summary' && !isFirstSummary(element)) return false;
  const radio = element as HTMLInputElement;
  if (radio.localName === 'input' && radio.type === 'radio' && radio.name && !radio.checked && groupHasChecked(radio)) {
    return false;
  }
  return view.getComputedStyle(element).visibility !== 'hidden';
}

/**
 * The elements drawn inside `parent`, in order.
 * An open shadow root replaces the light children of its host.
 *
 * A slot yields its assigned elements, or its own children when it has none. A closed `<details>` yields only its first `<summary>`.
 */
function renderedChildren(parent: ParentNode): Element[] {
  const element = parent as Element;
  if (element.shadowRoot) return Array.from(element.shadowRoot.children);
  if (element.localName === 'slot') {
    // Any assigned node (text too) replaces the fallback content, which is then not drawn.
    const assigned = (element as HTMLSlotElement).assignedNodes();
    if (assigned.length > 0) return assigned.filter((node): node is Element => node.nodeType === 1);
  }
  if (element.localName === 'details' && !element.hasAttribute('open')) {
    const summary = element.querySelector(':scope > summary');
    return summary ? [summary] : [];
  }
  return Array.from(parent.children);
}

function collect(parent: ParentNode, view: Window, found: HTMLElement[]): void {
  for (const child of renderedChildren(parent)) {
    if (child.hasAttribute('inert') || view.getComputedStyle(child).display === 'none') continue;
    if (isTabbable(child, view)) found.push(child as HTMLElement);
    collect(child, view, found);
  }
}

/**
 * Lists the elements inside a container that Tab can reach, in rendered order. It only reads the page and changes nothing.
 *
 * @remarks
 * An open shadow root is entered at its host. A slot lists its assigned elements at its position, once each. It skips
 * disabled controls, `tabindex="-1"`, `inert` and `hidden` subtrees, `display: none` and `visibility: hidden`.
 *
 * Radios of one group (same `name`, same form owner or tree) are one stop. That is the checked one, or all when none is
 * checked. A disabled radio does not count, so its enabled peers stay stops.
 *
 * A closed `<details>` lists only its first `<summary>`. A positive `tabindex` does not reorder the list. The container
 * itself is not in the result.
 *
 * @param container - The element to search.
 * @returns The tabbable descendants, in rendered order.
 * @example
 * const dialog = document.querySelector<HTMLElement>('#dialog')!;
 * const tabbables = getTabbables(dialog);
 * console.log(tabbables.length);
 */
export function getTabbables(container: Element): HTMLElement[] {
  const view = container.ownerDocument.defaultView;
  if (!view) return [];
  const found: HTMLElement[] = [];
  collect(container, view, found);
  return found;
}

/** Whether the element can take focus (it may have `tabindex="-1"`): not disabled, not `visibility: hidden`. */
function canTakeFocus(element: Element, view: Window): boolean {
  if (!element.matches(TABBABLE) || element.matches(':disabled')) return false;
  return view.getComputedStyle(element).visibility !== 'hidden';
}

/** Depth first, entering open shadow roots like {@link getTabbables}, skipping `inert` and `display: none` subtrees. */
function findAutofocusIn(parent: ParentNode, view: Window): HTMLElement | undefined {
  for (const child of Array.from(parent.children)) {
    if (child.hasAttribute('inert') || view.getComputedStyle(child).display === 'none') continue;
    if (child.hasAttribute('autofocus') && canTakeFocus(child, view)) return child as HTMLElement;
    const found = (child.shadowRoot && findAutofocusIn(child.shadowRoot, view)) ?? findAutofocusIn(child, view);
    if (found) return found;
  }
  return undefined;
}

/** The first focusable `[autofocus]` descendant, the native marker of the element that should start focused. */
function findAutofocus(container: HTMLElement): HTMLElement | undefined {
  const view = container.ownerDocument.defaultView;
  return view ? findAutofocusIn(container, view) : undefined;
}

/**
 * Moves focus into a container. It picks the first focusable element with `autofocus`, else the first
 * tabbable element, else the container itself.
 *
 * @remarks
 * Give the container `tabindex="-1"` so it can take focus when it holds nothing tabbable.
 *
 * @param container - The overlay content.
 * @example
 * const dialog = document.querySelector<HTMLElement>('#dialog')!;
 * dialog.tabIndex = -1;
 * focusFirst(dialog);
 */
export function focusFirst(container: HTMLElement): void {
  const [first] = getTabbables(container);
  (findAutofocus(container) ?? first ?? container).focus();
}
