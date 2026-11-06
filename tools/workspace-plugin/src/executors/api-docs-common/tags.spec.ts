import { describe, expect, it } from 'vitest';
import { checkParity, paragraphsOf, parseSlotTag, withoutLinks } from './tags';

describe('parseSlotTag', () => {
  it('reads the default slot, which has no selector', () => {
    expect(parseSlotTag('default - The label.')).toEqual({ name: 'default', description: 'The label.' });
  });

  it('reads a named slot with its selector and a description over several lines', () => {
    expect(parseSlotTag('label [cckLabel] - The label\n  of the field.')).toEqual({
      name: 'label',
      selector: '[cckLabel]',
      description: 'The label of the field.',
    });
  });

  it('keeps a hyphen with spaces inside the description', () => {
    expect(parseSlotTag('default - Before - after.')).toEqual({ name: 'default', description: 'Before - after.' });
    expect(parseSlotTag('hint [cckHint] - A - B')).toMatchObject({ selector: '[cckHint]', description: 'A - B' });
  });

  it.each(['', 'default', 'default -', 'default The label.', 'default [sel] - The label.'])('rejects %j', (text) => {
    expect(parseSlotTag(text)).toBeUndefined();
  });
});

describe('withoutLinks', () => {
  it('writes {@link X} as a code span and {@link X | text} as its text', () => {
    expect(withoutLinks('See {@link TabsState}.')).toBe('See `TabsState`.');
    expect(withoutLinks('See {@link TabsState | the state}.')).toBe('See the state.');
    expect(withoutLinks('See {@linkcode Tabs.value|the value}.')).toBe('See the value.');
  });

  it('reads the JSDoc form {@link X text}', () => {
    expect(withoutLinks('See {@link TabsState the state} and {@link Other}.')).toBe('See the state and `Other`.');
  });

  it('leaves text without links alone', () => {
    expect(withoutLinks('A `code` span and {braces}.')).toBe('A `code` span and {braces}.');
  });

  it('is applied by paragraphsOf and by the slot description', () => {
    expect(paragraphsOf('Uses {@link A}.\n\nAnd {@link B | b}.')).toEqual(['Uses `A`.', 'And b.']);
    expect(parseSlotTag('default - The {@link Label | label}.')?.description).toBe('The label.');
  });
});

describe('checkParity', () => {
  const tag = (name: string, comment: string) => ({ name, comment });

  it('accepts a none item with a @cckParity reason', () => {
    const problems: string[] = [];
    const tags = [tag('cckSemantic', 'none'), tag('cckParity', 'Only here.')];
    expect(checkParity('Thing.render', tags, problems)).toBe(true);
    expect(problems).toEqual([]);
  });

  it('adds a problem for a none item with only a @remarks', () => {
    const problems: string[] = [];
    const tags = [tag('cckSemantic', 'none'), tag('remarks', 'Only here.')];
    expect(checkParity('Thing.render', tags, problems)).toBe(true);
    expect(problems).toEqual(['Thing.render is "@cckSemantic none" and needs a "@cckParity" reason']);
  });

  it('adds a problem for an empty @cckParity, on any item', () => {
    const problems: string[] = [];
    expect(checkParity('Thing.size', [tag('cckParity', '')], problems)).toBe(false);
    expect(problems).toEqual(['Thing.size: "@cckParity" needs a reason ("@cckParity <reason>")']);
  });

  it('accepts @cckParity on an ordinary item', () => {
    const problems: string[] = [];
    expect(checkParity('Thing.size', [tag('cckParity', 'Differs by design.')], problems)).toBe(false);
    expect(problems).toEqual([]);
  });
});
