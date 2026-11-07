import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { screen } from '@testing-library/angular';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

/**
 * The cocokits theme owns the look, so each part that is a tag lays out like the element it used to be: the tag
 * and the same part class on its default element get the same computed `display`.
 */
const PARTS = [
  { tag: 'cck-accordion', cls: 'cck-accordion', element: 'div' },
  { tag: 'cck-accordion-item', cls: 'cck-accordion__item', element: 'div', parent: 'cck-accordion' },
  { tag: 'cck-badge', cls: 'cck-badge', element: 'span' },
  { tag: 'cck-badge-container', cls: 'cck-badge-container', element: 'div' },
  { tag: 'cck-checkbox', cls: 'cck-checkbox', element: 'div' },
  { tag: 'cck-dialog-description', cls: 'cck-dialog__description', element: 'p' },
  { tag: 'cck-field-error', cls: 'cck-field-error', element: 'div' },
  { tag: 'cck-form-field', cls: 'cck-form-field', element: 'div' },
  { tag: 'cck-hint', cls: 'cck-hint', element: 'div' },
  { tag: 'cck-popover-arrow', cls: 'cck-popover__arrow', element: 'span' },
  { tag: 'cck-popover-content', cls: 'cck-popover__content', element: 'div' },
  { tag: 'cck-popover-description', cls: 'cck-popover__description', element: 'p' },
  { tag: 'cck-radio', cls: 'cck-radio', element: 'div' },
  { tag: 'cck-radio-group', cls: 'cck-radio-group', element: 'div' },
  { tag: 'cck-select', cls: 'cck-select', element: 'div' },
  { tag: 'cck-select-option', cls: 'cck-select__option', element: 'div' },
  { tag: 'cck-select-option-group', cls: 'cck-select__option-group', element: 'div' },
  { tag: 'cck-select-separator', cls: 'cck-select__separator', element: 'div' },
  { tag: 'cck-switch', cls: 'cck-switch', element: 'div' },
  { tag: 'cck-tab-nav-panel', cls: 'cck-tab-nav__panel', element: 'div' },
  { tag: 'cck-tabs', cls: 'cck-tabs', element: 'div' },
  { tag: 'cck-tab', cls: 'cck-tabs__panel', element: 'div' },
  { tag: 'cck-tooltip-arrow', cls: 'cck-tooltip__arrow', element: 'span' },
  { tag: 'cck-tooltip-content', cls: 'cck-tooltip__content', element: 'div' },
] as const;

const displayOf = (name: string, cls: string, parent?: string, hidden = false): string => {
  const el = document.createElement(name);
  el.className = cls;
  el.hidden = hidden;
  const box = document.createElement('div');
  if (parent) box.className = parent;
  box.append(el);
  document.body.append(box);
  return getComputedStyle(el).display;
};

describe('display of the tag parts', () => {
  beforeAll(() => {
    const css = readFileSync(join(import.meta.dirname, '../../core/dist/styles.css'), 'utf8');
    const style = document.createElement('style');
    // jsdom does not read cascade layers; the rules are the same without the wrapper.
    style.textContent = css.replace(/@layer\s+cocokits\s*\{/g, '@media all {');
    document.head.append(style);
  });
  afterEach(() => {
    document.body.replaceChildren();
  });

  it.each(PARTS)('$tag lays out like its $element', (part) => {
    const { tag, cls, element } = part;
    const parent = 'parent' in part ? part.parent : undefined;
    expect(displayOf(tag, cls, parent)).toBe(displayOf(element, cls, parent));
  });

  it.each(PARTS)('$tag stays hidden with the hidden attribute', (part) => {
    const parent = 'parent' in part ? part.parent : undefined;
    expect(displayOf(part.tag, part.cls, parent, true)).toBe('none');
  });

  it('keeps a space between a hint and an error in the description of the control', () => {
    document.body.innerHTML =
      '<cck-form-field class="cck-form-field"><input aria-label="Message" aria-describedby="feedback" />' +
      '<div id="feedback" class="cck-form-field__feedback-wrapper">' +
      '<cck-hint class="cck-hint">Help</cck-hint><cck-field-error class="cck-field-error">Enter a message.</cck-field-error>' +
      '</div></cck-form-field>';
    expect(screen.getByRole('textbox', { description: 'Help Enter a message.' })).toBeTruthy();
  });
});
