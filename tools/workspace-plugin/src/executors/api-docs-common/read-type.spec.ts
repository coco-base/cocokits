import { describe, expect, it } from 'vitest';
import { readType } from './read-type';

describe('readType', () => {
  it.each([
    ['InputSignalWithTransform<boolean, unknown>', 'boolean'],
    ['InputSignalWithTransform<number, string | number>', 'number'],
    ['InputSignal<string>', 'string'],
    ['InputSignal<Array<string>>', 'Array<string>'],
    ['InputSignal<Map<string, number> | null>', 'Map<string, number> | null'],
    ['InputSignal<(a: string, b: number) => void>', '(a: string, b: number) => void'],
    ["InputSignal<'a,b' | 'c'>", "'a,b' | 'c'"],
    [String.raw`InputSignalWithTransform<'a\\', unknown>`, String.raw`'a\\'`],
    [String.raw`InputSignalWithTransform<"x\\\"y,z", unknown>`, String.raw`"x\\\"y,z"`],
    ['ModelSignal<string | undefined>', 'string | undefined'],
    ['OutputEmitterRef<boolean>', 'boolean'],
    ['OutputEmitterRef<void>', 'void'],
    ['EventEmitter<number>', 'number'],
    ['string', 'string'],
    ['Signal<number>', 'Signal<number>'],
    ['Promise<string>', 'Promise<string>'],
  ])('%s reads %s', (type, read) => {
    expect(readType(type)).toBe(read);
  });
});
