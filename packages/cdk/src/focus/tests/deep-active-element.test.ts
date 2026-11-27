// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { deepActiveElement } from '../index';

describe('deepActiveElement', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  it('returns the focused element', () => {
    const button = document.body.appendChild(document.createElement('button'));
    button.focus();
    expect(deepActiveElement(document)).toBe(button);
  });

  it('looks through an open shadow root', () => {
    const host = document.body.appendChild(document.createElement('div'));
    const input = host.attachShadow({ mode: 'open' }).appendChild(document.createElement('input'));
    input.focus();
    expect(document.activeElement).toBe(host);
    expect(deepActiveElement(document)).toBe(input);
  });
});
