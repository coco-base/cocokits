// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { writeContentSize } from '../index';

const variables = { height: '--box-height', width: '--box-width' } as const;

function measuredElement(scrollHeight: number, scrollWidth: number): HTMLElement {
  const element = document.createElement('div');
  Object.defineProperty(element, 'scrollHeight', { configurable: true, value: scrollHeight });
  Object.defineProperty(element, 'scrollWidth', { configurable: true, value: scrollWidth });
  return element;
}

describe('writeContentSize', () => {
  it('writes scrollHeight and scrollWidth in px to the two variables', () => {
    const element = measuredElement(120, 340);
    writeContentSize(element, variables);
    expect(element.style.getPropertyValue('--box-height')).toBe('120px');
    expect(element.style.getPropertyValue('--box-width')).toBe('340px');
  });

  it('writes nothing but the two variables', () => {
    const element = measuredElement(10, 20);
    element.style.setProperty('color', 'red');
    writeContentSize(element, variables);
    expect(element.style.length).toBe(3);
    expect(element.style.getPropertyValue('color')).toBe('red');
    expect(element.getAttributeNames()).toEqual(['style']);
  });

  it('overwrites an earlier measurement', () => {
    const element = measuredElement(10, 20);
    writeContentSize(element, variables);
    Object.defineProperty(element, 'scrollHeight', { configurable: true, value: 55 });
    writeContentSize(element, variables);
    expect(element.style.getPropertyValue('--box-height')).toBe('55px');
    expect(element.style.getPropertyValue('--box-width')).toBe('20px');
  });
});
