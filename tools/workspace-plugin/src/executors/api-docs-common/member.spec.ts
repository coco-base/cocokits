import { describe, expect, it } from 'vitest';
import { memberOf } from './member';

const param = { name: 'param', comment: 'value - The value to use.' };

const remarksOf = (type: string): string | undefined =>
  memberOf('thing', { name: 'run', type, required: true, description: 'Runs it.', tags: [param] }, 'Thing', [])
    ?.remarks;

describe('memberOf', () => {
  it('shows the @param text of a function member, also of a function in parentheses', () => {
    expect(remarksOf('(value: string) => void')).toBe('`value`: The value to use.');
    expect(remarksOf('((value: string, details: Details) => void)')).toBe('`value`: The value to use.');
    expect(remarksOf('(() => void)')).toBe('`value`: The value to use.');
  });

  it('shows no @param text for a type in parentheses that is no function', () => {
    expect(remarksOf("('a' | 'b')[]")).toBeUndefined();
    expect(remarksOf('(string | number)')).toBeUndefined();
  });
});
