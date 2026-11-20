import { describe, expect, it } from 'vitest';
import { omitModes, pickModes } from '../src/narrow-modes';

const modes = ['brand', 'neutral', 'info', 'danger'] as const;

describe('pickModes', () => {
  it('keeps the picked modes in source order', () => {
    expect(pickModes(modes, ['danger', 'brand'], 'brand')).toEqual({ values: ['brand', 'danger'], default: 'brand' });
  });

  it('rejects a default that is not picked', () => {
    // @ts-expect-error 'info' is not among the picked modes
    pickModes(modes, ['brand', 'danger'], 'info');
    // @ts-expect-error 'other' is not a mode at all
    pickModes(modes, ['other'], 'brand');
  });
});

describe('omitModes', () => {
  it('drops the omitted modes in source order', () => {
    expect(omitModes(modes, ['neutral', 'info'], 'brand')).toEqual({ values: ['brand', 'danger'], default: 'brand' });
  });

  it('rejects an omitted default', () => {
    // @ts-expect-error 'info' is omitted
    omitModes(modes, ['neutral', 'info'], 'info');
  });
});
