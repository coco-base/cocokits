// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createDescription } from '../index';

beforeEach(() => {
  // jsdom has no top layer: emulate `:modal` for a dialog marked with `data-modal`.
  vi.spyOn(Element.prototype, 'matches').mockImplementation(function (this: Element, selector: string) {
    return selector === ':modal' && this.localName === 'dialog' && this.hasAttribute('data-modal');
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

function mountTarget(markup = '<button id="t">t</button>'): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = markup;
  document.body.append(wrapper);
  const target = wrapper.querySelector<HTMLElement>('#t');
  if (!target) throw new Error('Missing target');
  return target;
}

describe('createDescription', () => {
  it('creates nothing until update', () => {
    createDescription(mountTarget(), { id: 'd' });
    expect(document.getElementById('d')).toBeNull();
  });

  it('creates a hidden tooltip element in the body and returns true', () => {
    const description = createDescription(mountTarget(), { id: 'd' });
    expect(description.update('  Copy link ')).toBe(true);
    const element = document.getElementById('d');
    expect(element?.parentElement).toBe(document.body);
    expect(element?.getAttribute('role')).toBe('tooltip');
    expect(element?.hidden).toBe(true);
    expect(element?.textContent).toBe('Copy link');
    expect(element?.className).toBe('');
  });

  it('updates the text of the same element', () => {
    const description = createDescription(mountTarget(), { id: 'd' });
    description.update('one');
    const element = document.getElementById('d');
    expect(description.update('two')).toBe(true);
    expect(document.getElementById('d')).toBe(element);
    expect(element?.textContent).toBe('two');
    expect(document.querySelectorAll('#d')).toHaveLength(1);
  });

  it('removes the element on an empty text and returns false', () => {
    const description = createDescription(mountTarget(), { id: 'd' });
    description.update('one');
    expect(description.update('   ')).toBe(false);
    expect(document.getElementById('d')).toBeNull();
    expect(description.update('again')).toBe(true);
    expect(document.getElementById('d')?.textContent).toBe('again');
  });

  it('removes the element when the text equals the aria-label of the target', () => {
    const target = mountTarget('<button id="t" aria-label=" Copy link ">t</button>');
    const description = createDescription(target, { id: 'd' });
    expect(description.update('Copy link')).toBe(false);
    expect(document.getElementById('d')).toBeNull();
    description.update('Other');
    expect(document.getElementById('d')).not.toBeNull();
    target.setAttribute('aria-label', 'Other');
    expect(description.update('Other')).toBe(false);
    expect(document.getElementById('d')).toBeNull();
  });

  it('never writes the attributes of the target', () => {
    const target = mountTarget();
    const before = target.outerHTML;
    const description = createDescription(target, { id: 'd' });
    description.update('text');
    description.destroy();
    expect(target.outerHTML).toBe(before);
  });

  it('goes into the shadow root of a target inside a shadow tree', () => {
    const host = mountTarget('<div id="t"></div>');
    const shadow = host.attachShadow({ mode: 'open' });
    const inner = document.createElement('button');
    shadow.append(inner);
    const description = createDescription(inner, { id: 'd' });
    expect(description.update('text')).toBe(true);
    expect(shadow.getElementById('d')?.parentNode).toBe(shadow);
    expect(document.getElementById('d')).toBeNull();
  });

  it('goes into the open modal dialog that holds the target', () => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = '<dialog id="m" data-modal open><button id="t">t</button></dialog>';
    document.body.append(wrapper);
    const target = wrapper.querySelector<HTMLElement>('#t');
    if (!target) throw new Error('Missing target');
    const description = createDescription(target, { id: 'd' });
    description.update('text');
    expect(document.getElementById('d')?.parentElement).toBe(document.getElementById('m'));
  });

  it('destroy removes the element and is idempotent', () => {
    const description = createDescription(mountTarget(), { id: 'd' });
    description.update('text');
    description.destroy();
    expect(document.getElementById('d')).toBeNull();
    expect(() => {
      description.destroy();
    }).not.toThrow();
    expect(() => {
      createDescription(mountTarget(), { id: 'e' }).destroy();
    }).not.toThrow();
  });
});
