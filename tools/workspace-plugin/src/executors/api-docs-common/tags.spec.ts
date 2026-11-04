import { describe, expect, it } from 'vitest';
import { parseSlotTag } from './tags';

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
