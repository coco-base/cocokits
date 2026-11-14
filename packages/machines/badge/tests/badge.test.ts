import { describe, expect, it } from 'vitest';
import { badgeAnatomy, badgeMeta, getBadgeProps, getBadgeText } from '../index';

describe('anatomy and meta', () => {
  it('has the classes of the spec', () => {
    expect(badgeAnatomy.classes).toEqual({
      root: 'cck-badge',
      content: 'cck-badge__content',
      maxIndicator: 'cck-badge__max-indicator',
    });
  });

  it('describes the root without naming an element or a look', () => {
    expect(badgeAnatomy.parts.root.description).toBe('The root of the badge. It holds the shown text.');
  });

  it('names a default element per part', () => {
    expect(badgeMeta.defaultElements).toEqual({ root: 'span', content: 'span', maxIndicator: 'span' });
  });

  it('declares no keyboard and no role', () => {
    expect(badgeMeta.keyboard).toEqual([]);
    expect(Object.values(badgeMeta.roles).every((r) => r === null)).toBe(true);
  });
});

describe('getBadgeText', () => {
  it.each([
    [5, undefined, '5', false],
    ['5', undefined, '5', false],
    [null, undefined, '', false],
    [undefined, undefined, '', false],
    ['', undefined, '', false],
    [0, undefined, '', false],
    ['0', undefined, '0', false],
    [0, 99, '', false],
    ['0', 99, '0', false],
    [120, 99, '99', true],
    ['120', 99, '99', true],
    [99, 99, '99', false],
    ['New', 1, 'New', false],
    [120, 0, '120', false],
    [120, undefined, '120', false],
  ] as const)('content %j max %j shows %j truncated %j', (content, max, shownText, truncated) => {
    expect(getBadgeText(content, max)).toEqual({ shownText, truncated });
  });
});

describe('getBadgeProps', () => {
  it('shows a count', () => {
    const parts = getBadgeProps({ content: 5 });
    expect(parts.root).toEqual({ class: 'cck-badge', 'data-empty': undefined, 'data-truncated': undefined });
    expect(parts.content).toEqual({ class: 'cck-badge__content', text: '5' });
    expect(parts.maxIndicator).toBeNull();
  });

  it.each([null, undefined, '', 0])('content %j is empty', (content) => {
    const parts = getBadgeProps({ content });
    expect(parts.root['data-empty']).toBe('');
    expect(parts.content).toEqual({ class: 'cck-badge__content', text: '' });
    expect(parts.maxIndicator).toBeNull();
  });

  it('does not treat "0" as empty', () => {
    expect(getBadgeProps({ content: '0' }).root['data-empty']).toBeUndefined();
  });

  it('truncates with a separate indicator', () => {
    const parts = getBadgeProps({ content: 120, max: 99 });
    expect(parts.root['data-truncated']).toBe('');
    expect(parts.root['data-empty']).toBeUndefined();
    expect(parts.content?.text).toBe('99');
    expect(parts.maxIndicator).toEqual({ class: 'cck-badge__max-indicator', text: '+' });
  });

  it('hide renders the root only, with no empty fact and no truncation', () => {
    const parts = getBadgeProps({ content: 120, max: 99, hide: true });
    expect(parts.root).toEqual({ class: 'cck-badge', hidden: true });
    expect(parts.content).toBeNull();
    expect(parts.maxIndicator).toBeNull();
    expect(getBadgeProps({ hide: true }).root['data-empty']).toBeUndefined();
  });

  it('only emits data-* declared in the meta', () => {
    const inputs = [{ content: 120, max: 99 }, { hide: true }, {}] as const;
    for (const input of inputs) {
      const keys = Object.keys(getBadgeProps(input).root).filter((k) => k.startsWith('data-'));
      expect(badgeMeta.dataAttrs.root).toEqual(expect.arrayContaining(keys));
    }
  });

  it('is pure', () => {
    const input = { content: 120, max: 99 };
    expect(getBadgeProps(input)).toEqual(getBadgeProps(input));
  });
});
