import { describe, expect, it } from 'vitest';
import { baseIcons, defaultPartIcons } from '@cocokits/icons';
import { checkboxAnatomy } from '../index';

describe('checkbox default part icons', () => {
  it('names only parts of the anatomy, each a base icon', () => {
    const entry: Readonly<Record<string, string>> = defaultPartIcons[checkboxAnatomy.block];
    expect(Object.keys(entry).length).toBeGreaterThan(0);
    for (const [part, iconName] of Object.entries(entry)) {
      expect(Object.keys(checkboxAnatomy.parts)).toContain(part);
      expect(Object.keys(baseIcons)).toContain(iconName);
    }
  });
});
