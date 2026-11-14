import { describe, expect, it } from 'vitest';
import * as entry from '../src/index';
import type { Icon } from '../src/index';

const pack = Object.entries(entry).filter(([name]) => name.endsWith('Icon')) as [string, Icon][];

const NAMES = [
  'arrow-up',
  'arrow-down',
  'arrow-left',
  'arrow-right',
  'chevron-up',
  'chevron-down',
  'chevron-left',
  'chevron-right',
  'check',
  'check-circle',
  'close',
  'plus',
  'minus',
  'search',
  'info',
  'warning',
  'email',
  'link',
  'copy',
  'code',
  'heart',
  'heart-fill',
  'user',
  'menu',
  'setting',
  'tools',
  'trash',
  'light',
  'dark',
  'mic',
  'card',
  'dollar',
  'pizza-slice',
  'steak',
  'volume-mute',
  'volume-off',
  'volume-low',
  'volume',
  'volume-high',
];

const camel = (name: string): string => name.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase()) + 'Icon';

describe('@cocokits/icons pack', () => {
  it('exports exactly the 39 icons, one per name', () => {
    expect(pack.map(([name]) => name).sort()).toEqual(NAMES.map(camel).sort());
    expect(NAMES).toHaveLength(39);
  });

  it.each(pack)('%s has a viewBox and a body that paints with currentColor only', (_name, icon) => {
    expect(icon.viewBox).toMatch(/^\d+ \d+ \d+ \d+$/);
    expect(icon.body).toMatch(/^<path /);
    expect(icon.body).toContain('fill="currentColor"');
    expect(icon.body).not.toMatch(/#[0-9a-f]{3,8}|rgb|hsl|stroke=/i);
    expect(icon.body.match(/fill="([^"]*)"/g)?.every((fill) => fill === 'fill="currentColor"')).toBe(true);
  });
});

describe('@cocokits/icons base icons and defaults', () => {
  it('holds the four base icons', () => {
    expect(Object.keys(entry.baseIcons)).toEqual(['chevron-down', 'check', 'minus', 'close']);
    expect(entry.baseIcons['chevron-down']).toBe(entry.chevronDownIcon);
    expect(entry.baseIcons.check).toBe(entry.checkIcon);
    expect(entry.baseIcons.minus).toBe(entry.minusIcon);
    expect(entry.baseIcons.close).toBe(entry.closeIcon);
  });

  it('names a base icon for every default part icon', () => {
    const names = Object.values(entry.defaultPartIcons).flatMap((parts) => Object.values(parts));
    expect(names.length).toBeGreaterThan(0);
    for (const name of names) expect(Object.keys(entry.baseIcons)).toContain(name);
  });
});
