import { describe, expect, it } from 'vitest';
import { baseIcons, defaultPartIcons } from '@cocokits/icons';
import { accordionAnatomy } from '../index';

describe('accordion default part icons', () => {
  it('names only parts of the anatomy, each a base icon', () => {
    const entry: Readonly<Record<string, string>> = defaultPartIcons[accordionAnatomy.block];
    expect(Object.keys(entry).length).toBeGreaterThan(0);
    for (const [part, iconName] of Object.entries(entry)) {
      expect(Object.keys(accordionAnatomy.parts)).toContain(part);
      expect(Object.keys(baseIcons)).toContain(iconName);
    }
  });
});
