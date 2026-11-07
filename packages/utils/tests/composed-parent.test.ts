// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { composedParent } from '../src/index';

describe('composedParent', () => {
  it('returns the parent node', () => {
    const parent = document.createElement('div');
    const child = parent.appendChild(document.createElement('span'));
    expect(composedParent(child)).toBe(parent);
  });

  it('returns the host for the root of a shadow tree', () => {
    const host = document.createElement('div');
    const root = host.attachShadow({ mode: 'open' });
    expect(composedParent(root)).toBe(host);
  });

  it('returns null at the top of a detached tree and of the document', () => {
    expect(composedParent(document.createElement('div'))).toBeNull();
    expect(composedParent(document)).toBeNull();
  });
});
