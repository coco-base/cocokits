/** `Node.TEXT_NODE` and `Node.ELEMENT_NODE`, as numbers so the module needs no `Node` global (server rendering). */
const TEXT_NODE = 3;
const ELEMENT_NODE = 1;

/** The roles that the browser names by their content. `option`, `treeitem` and `row` count only in their container. */
const CONTENT_ROLES: ReadonlySet<string> = new Set(
  (
    'button cell checkbox columnheader gridcell heading link menuitem menuitemcheckbox menuitemradio radio ' +
    'rowheader switch tab tooltip'
  ).split(' '),
);

/** The roles that the browser names by `title` and not by their content. */
const TITLE_ROLES: ReadonlySet<string> = new Set(
  (
    'alert alertdialog application article banner blockquote combobox complementary contentinfo dialog directory ' +
    'document feed figure form grid group img list listbox log main marquee math menu menubar meter navigation note ' +
    'progressbar radiogroup region row rowgroup scrollbar search searchbox separator slider spinbutton status table ' +
    'tablist tabpanel textbox timer toolbar tree treegrid'
  ).split(' '),
);

/** The elements without a `role` attribute that the browser names by `title`. A custom element is one too. */
const TITLE_TAGS =
  /^(article|aside|button|details|dialog|fieldset|figure|footer|form|h[1-6]|header|iframe|input|li|main|meter|nav|ol|optgroup|option|output|progress|search|section|select|svg|table|td|textarea|th|ul|video)$|-/;

/** The first child with this tag names its parent. */
const NAMING_CHILD: Readonly<Record<string, string>> = { fieldset: 'legend', table: 'caption', svg: 'title' };

/** The input types that are not a text field: no placeholder names them. */
const NOT_TEXT_FIELD =
  /^(hidden|checkbox|radio|file|color|range|date|month|week|time|datetime-local|button|submit|reset|image)$/;

/** Elements whose text is never read. */
const NO_TEXT_TAGS = /^(desc|noscript|script|style|template)$/;

/** How the text of a name source is read. */
interface Scan {
  /** An element that never counts: the control inside its own label. */
  readonly skipped?: Element;
  /** Hidden content counts too: the content of an `aria-labelledby` target that is hidden. */
  readonly withHidden: boolean;
  /** An `aria-labelledby` inside the content is followed. A target does not follow another one. */
  readonly followIds: boolean;
  /** `visibility: hidden` does not count: the control is not visible itself, so the answer is for when it is shown. */
  readonly ignoreVisibility: boolean;
}

const filled = (element: Element, attrName: string): boolean => (element.getAttribute(attrName) ?? '').trim() !== '';

const styleOf = (element: Element): CSSStyleDeclaration | undefined =>
  element.ownerDocument.defaultView?.getComputedStyle(element);

/** The computed `visibility` is not `visible`: `hidden` and `collapse` both hide the element. */
const isInvisible = (element: Element): boolean => (styleOf(element)?.visibility ?? 'visible') !== 'visible';

const skipsContent = (element: Element): boolean =>
  styleOf(element)?.getPropertyValue('content-visibility') === 'hidden';

const inputType = (element: Element): string =>
  element.localName === 'input' ? (element.getAttribute('type') ?? 'text').toLowerCase() : '';

const isTextField = (element: Element): boolean =>
  element.localName === 'textarea' || (element.localName === 'input' && !NOT_TEXT_FIELD.test(inputType(element)));

/** The first word of the `role` attribute, in lower case. */
const firstRole = (element: Element): string =>
  (element.getAttribute('role') ?? '').trim().toLowerCase().split(/\s+/)[0] ?? '';

const hasNoRole = (element: Element): boolean => /^(none|presentation)$/.test(firstRole(element));

/** `alt` names only an image and an image button. An empty `alt` gives no name, and an image without a role has none. */
const hasAlt = (element: Element): boolean =>
  (element.localName === 'img' || inputType(element) === 'image') && !hasNoRole(element) && filled(element, 'alt');

const firstSummary = (details: Element): Element | undefined =>
  Array.from(details.children).find((child) => child.localName === 'summary');

/** The `<summary>` that the browser uses: the first one of a `<details>`. */
const isUsedSummary = (element: Element): boolean =>
  element.parentElement?.localName === 'details' && firstSummary(element.parentElement) === element;

const isClosedDetails = (element: Element): boolean => element.localName === 'details' && !element.hasAttribute('open');

/** The element and its content are removed for assistive technology. Ancestors are not checked. */
function isRemoved(element: Element): boolean {
  if (element.getAttribute('aria-hidden') === 'true' || element.hasAttribute('inert')) return true;
  const tag = element.localName;
  // An SVG `<title>` names its parent and is never drawn.
  if (tag === 'title') return false;
  if (NO_TEXT_TAGS.test(tag)) return true;
  // The browser reads content that is hidden until found, and it keeps its `display`.
  return element.getAttribute('hidden') !== 'until-found' && styleOf(element)?.display === 'none';
}

/** The nodes that the browser shows inside the element: the shadow tree, the slotted nodes or the children. */
function shownChildNodes(element: Element): Node[] {
  const shadow = (element as Partial<Pick<HTMLElement, 'shadowRoot'>>).shadowRoot;
  if (shadow) return Array.from(shadow.childNodes);
  if (element.localName === 'slot') {
    const assigned = (element as Partial<Pick<HTMLSlotElement, 'assignedNodes'>>).assignedNodes?.({ flatten: true });
    if (assigned && assigned.length > 0) return assigned;
  }
  // A closed `<details>` shows only its summary.
  if (isClosedDetails(element)) return Array.from(element.children).filter(isUsedSummary);
  return Array.from(element.childNodes);
}

/** The text that the user typed or the author set in a text field. The browser does not read a password. */
const hasFieldValue = (element: Element): boolean =>
  isTextField(element) &&
  inputType(element) !== 'password' &&
  ((element as Partial<Pick<HTMLInputElement, 'value'>>).value ?? '').trim() !== '';

/** The element gives text through `aria-labelledby`, `aria-label`, `alt`, a field value or its content. */
function givesText(element: Element, scan: Scan): boolean {
  // An element that is not visible gives nothing itself. A child can be visible again.
  const readsOwn = scan.withHidden || scan.ignoreVisibility || !isInvisible(element);
  return (
    (readsOwn &&
      ((scan.followIds && isLabelledBy(element, { ...scan, followIds: false })) ||
        filled(element, 'aria-label') ||
        hasAlt(element) ||
        hasFieldValue(element))) ||
    hasContentText(element, scan)
  );
}

/** The text nodes of the element are read: it is visible and CSS does not skip its content. */
function showsText(element: Element, scan: Scan): boolean {
  if (scan.withHidden) return true;
  if (!scan.ignoreVisibility && isInvisible(element)) return false;
  return !skipsContent(element) || element.getAttribute('hidden') === 'until-found';
}

/** The content of the element gives text. */
function hasContentText(element: Element, scan: Scan): boolean {
  const textShown = showsText(element, scan);
  return shownChildNodes(element).some((child) => {
    if (child.nodeType === TEXT_NODE) return textShown && (child.textContent ?? '').trim() !== '';
    if (child.nodeType !== ELEMENT_NODE || child === scan.skipped) return false;
    return (scan.withHidden || !isRemoved(child as Element)) && givesText(child as Element, scan);
  });
}

/** A native control that keeps its role when the author writes `none` or `presentation`. */
const isNativeControl = (element: Element): boolean =>
  element.localName === 'button' || (element.localName === 'a' && element.hasAttribute('href'));

/** The elements that can hold a row. */
const ROW_CONTAINERS = '[role="grid" i], [role="treegrid" i], [role="table" i], table';

/** The role of the nearest ancestor that matches the selector. */
const containerRole = (element: Element, selector: string): string => {
  const container = element.parentElement?.closest(selector);
  return container ? firstRole(container) : '';
};

/** The element has a role that the browser names by content, by its `role` attribute. */
function hasContentRole(element: Element, role: string): boolean {
  // An option, a tree item or a row that is not in its container has no such role for the browser.
  if (role === 'option') return element.closest('[role="listbox" i]') !== null;
  if (role === 'treeitem') return element.closest('[role="tree" i], [role="treegrid" i]') !== null;
  if (role === 'row') return /^(grid|treegrid)$/.test(containerRole(element, ROW_CONTAINERS));
  return CONTENT_ROLES.has(role);
}

/** The element has a role that the browser names by content. */
function isNamedFromContent(element: Element): boolean {
  if (hasNoRole(element)) return isNativeControl(element);
  const role = firstRole(element);
  if (role !== '') return hasContentRole(element, role);
  const tag = element.localName;
  if (tag === 'summary') return element.parentElement?.localName === 'details';
  if (tag === 'option') return element.closest('select') !== null;
  // A cell of a layout table has no role, and only the row of a grid is named by its cells.
  if (tag === 'td' || tag === 'th') return !/^(none|presentation)$/.test(containerRole(element, 'table'));
  if (tag === 'tr') return /^(grid|treegrid)$/.test(containerRole(element, 'table'));
  return /^(button|h[1-6])$/.test(tag) || isNativeControl(element);
}

/** The name that HTML gives without ARIA: a default button name, a button value, a placeholder or a naming child. */
function hasNativeName(element: Element, scan: Scan): boolean {
  const tag = element.localName;
  const type = inputType(element);
  if (type === 'image') return true;
  if (type === 'submit' || type === 'reset') return !element.hasAttribute('value') || filled(element, 'value');
  if (type === 'button') return filled(element, 'value');
  if (tag === 'optgroup') return filled(element, 'label');
  if (isTextField(element)) return filled(element, 'placeholder') || filled(element, 'aria-placeholder');
  const namingChild = NAMING_CHILD[tag];
  if (namingChild === undefined) return false;
  const first = Array.from(element.children).find((child) => child.localName === namingChild);
  return first !== undefined && !isRemoved(first) && givesText(first, scan);
}

/** `title` names the element. It names only the roles and elements that the browser names by it. */
function hasTitleName(element: Element): boolean {
  if (!filled(element, 'title')) return false;
  const role = firstRole(element);
  if (role !== '') return TITLE_ROLES.has(role) || isNamedFromContent(element);
  const tag = element.localName;
  if (tag === 'img') return !element.hasAttribute('alt');
  return TITLE_TAGS.test(tag) || isNamedFromContent(element);
}

/** The control is in the closed part of the `<details>`, so it is shown together with that part. */
const isInClosedPart = (details: Element, control: Element): boolean =>
  details.contains(control) && !firstSummary(details)?.contains(control);

/**
 * The browser skips a name source: something hides it that does not hide the control too. Only the elements between
 * the source and the nearest ancestor that also holds the control are looked at.
 */
function isSkippedSource(source: Element, control: Element, hides: (element: Element) => boolean): boolean {
  for (let current: Element | null = source; current && !current.contains(control); current = current.parentElement) {
    if (hides(current)) return true;
    const parent = current.parentElement;
    if (!parent) return false;
    if (isClosedDetails(parent) && !isUsedSummary(current) && !isInClosedPart(parent, control)) return true;
    if (skipsContent(parent) && !parent.contains(control)) return true;
  }
  return false;
}

/** An `aria-labelledby` target that the browser does not read: a script, a style, the page title, skipped or inert content. */
function isUnreadTarget(target: Element, control: Element): boolean {
  const tag = target.localName;
  return (
    NO_TEXT_TAGS.test(tag) ||
    (tag === 'title' && target.closest('svg') === null) ||
    isSkippedSource(target, control, (element) => element.hasAttribute('inert') || skipsContent(element))
  );
}

/** The `title` of an `aria-labelledby` target gives text. It does not on an image that has an `alt`. */
const hasTargetTitle = (target: Element): boolean =>
  filled(target, 'title') && !(target.localName === 'img' && target.hasAttribute('alt'));

/** An element that `aria-labelledby` points to exists and gives text. A hidden one counts, with all its content. */
function isLabelledBy(element: Element, scan: Scan): boolean {
  if (!element.hasAttribute('aria-labelledby')) return false;
  const root = element.getRootNode() as Partial<Pick<Document, 'getElementById'>>;
  const ids = (element.getAttribute('aria-labelledby') ?? '').split(/\s+/).filter(Boolean);
  return ids.some((id) => {
    const target = root.getElementById?.(id) ?? null;
    if (target === null || (!scan.followIds && target === element) || isUnreadTarget(target, element)) return false;
    // A target does not follow its own `aria-labelledby`.
    const targetScan = { ...scan, withHidden: isRemoved(target) || isInvisible(target), followIds: false };
    return hasTargetTitle(target) || hasNativeName(target, targetScan) || givesText(target, targetScan);
  });
}

/** A label gives no name when it is hidden, or when CSS removes or skips it and not the control with it. */
function isHiddenLabel(label: Element, control: Element, scan: Scan): boolean {
  if (label.contains(control)) return false;
  if (label.getAttribute('aria-hidden') === 'true' || (!scan.ignoreVisibility && isInvisible(label))) return true;
  return isSkippedSource(label, control, (element) => styleOf(element)?.display === 'none');
}

/**
 * Checks whether an element has an accessible name: the text that a screen reader says for it.
 *
 * @remarks
 * It returns `true` when one of these gives text that is not empty:
 *
 * - `aria-labelledby` that points to an element with text. A hidden element counts here.
 * - `aria-label`.
 * - A `<label for>` or a wrapping `<label>` with text, for a native control. A hidden label does not count.
 * - `alt` on an image.
 * - The first `<legend>` of a `<fieldset>`, the first `<caption>` of a `<table>` and the first `<title>` of an `<svg>`.
 * - A submit, reset or image button (the browser names it), and the `value` of an `<input type="button">`.
 * - The element's own content, only when its role takes the name from content. A button, a link, a heading, a tab,
 *   an option in its list, a table cell and a row of a grid do. A dialog, a text field, a combobox, a list, a row of
 *   a table and a `<nav>` do not.
 * - `placeholder` or `aria-placeholder` on a text field, and `title`. The browser uses them as a last choice.
 *   A visible label is better.
 *
 * Text in the content counts when it is a text node, an image `alt`, an `aria-label` or the value of a text field.
 * Content with `aria-hidden="true"`, `inert`, `display: none`, `visibility: hidden` or `visibility: collapse` does
 * not count.
 *
 * Use it in a development check, after the element and the elements that name it are in the document.
 *
 * It answers "would this element have a name when it is shown". It does not check that the element itself is shown.
 * A closed dialog with an `aria-label` gives `true`. So does a field with its label inside content that is not shown
 * yet. A label or an `aria-labelledby` target that is hidden while the element is shown gives no name. For an element
 * that is not visible, `visibility: hidden` on its label or content is not checked.
 *
 * It follows the name that Chromium computes, and it does not cover all of it. Where it does not follow the browser
 * it returns `false`. A check can then warn for an element that has a name. It never stays silent for one that has
 * none. It returns `false` for a name that comes only from one of these:
 *
 * - text from CSS `::before` or `::after`.
 * - the `title` of a child.
 * - `title` on an element that is not a control, a landmark, a heading, a list, a table or a table cell.
 * - a second role in the `role` attribute when the first is not a real role.
 * - a `<summary role="none">`.
 * - a control inside a label or an `aria-labelledby` target, unless it is a text field with a value.
 * - a password field, a slider, a date field, a button or a placeholder inside a label or an `aria-labelledby` target.
 * - the browser's own text for `<input type="file">`.
 * - an image map `<area>`.
 * - an `<option>` outside a `<select>`, and an option that its list owns with `aria-owns`.
 * - a `<style>` element that CSS shows.
 * - a label with `content-visibility: hidden` on itself.
 * - an image with `role="none"` that `aria-labelledby` points to.
 *
 * @param element - The element, in a document.
 * @returns `true` when the element has an accessible name.
 * @example
 * const button = document.querySelector('button')!;
 * if (!hasAccessibleName(button)) console.warn('This button has no accessible name.');
 */
export function hasAccessibleName(element: Element): boolean {
  if (inputType(element) === 'hidden') return false;
  const scan: Scan = { withHidden: false, followIds: true, ignoreVisibility: isInvisible(element) };
  const labels = Array.from((element as Partial<Pick<HTMLInputElement, 'labels'>>).labels ?? []);
  return (
    isLabelledBy(element, scan) ||
    filled(element, 'aria-label') ||
    labels.some((label) => !isHiddenLabel(label, element, scan) && givesText(label, { ...scan, skipped: element })) ||
    hasAlt(element) ||
    hasNativeName(element, scan) ||
    (/^(textbox|searchbox)$/.test(firstRole(element)) && filled(element, 'aria-placeholder')) ||
    (isNamedFromContent(element) && hasContentText(element, scan)) ||
    hasTitleName(element)
  );
}
