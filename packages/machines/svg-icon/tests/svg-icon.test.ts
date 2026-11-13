import { describe, expect, it } from 'vitest';
import type { SvgIconSet } from '@cocokits/shared';
import { getSvgIconProps, svgIconAnatomy, svgIconMeta } from '../index';

const icons = {
  check: { viewBox: '0 0 24 24', paths: [{ d: 'M1 1' }] },
  ring: {
    viewBox: '0 0 24 25',
    paths: [
      { d: 'M2 2', fillRule: 'evenodd', clipRule: 'nonzero' },
      { d: 'M3 3', clipRule: 'evenodd' },
    ],
  },
} as const satisfies SvgIconSet;

describe('anatomy', () => {
  it('has a root and the svg with their classes', () => {
    expect(svgIconAnatomy.block).toBe('svg-icon');
    expect(svgIconAnatomy.classes).toEqual({ root: 'cck-svg-icon', svg: 'cck-svg-icon__svg' });
  });
});

describe('getSvgIconProps', () => {
  it('a found icon gives the viewBox, one path per icon path and the name', () => {
    expect(getSvgIconProps({ iconName: 'ring', icons })).toEqual({
      root: { class: 'cck-svg-icon', 'data-icon-name': 'ring', 'aria-hidden': 'true' },
      svg: { class: 'cck-svg-icon__svg', viewBox: '0 0 24 25' },
      paths: [
        { d: 'M2 2', 'fill-rule': 'evenodd', 'clip-rule': 'nonzero' },
        { d: 'M3 3', 'clip-rule': 'evenodd' },
      ],
    });
  });

  it('does not render the rule keys an icon path leaves out', () => {
    const { paths } = getSvgIconProps({ iconName: 'check', icons });
    expect(paths).toEqual([{ d: 'M1 1' }]);
    expect(Object.keys(paths[0] ?? {})).toEqual(['d']);
  });

  it.each([
    ['an unknown name', 'missing', icons],
    ['an empty set', 'check', {}],
    ['a name of Object.prototype', 'constructor', icons],
    ['__proto__', '__proto__', icons],
  ] as const)('%s: no viewBox, no path, the name kept', (_name, iconName, set) => {
    const props = getSvgIconProps({ iconName, icons: set });
    expect(props.svg).toEqual({ class: 'cck-svg-icon__svg' });
    expect(props.svg).not.toHaveProperty('viewBox');
    expect(props.paths).toEqual([]);
    expect(props.root['data-icon-name']).toBe(iconName);
  });

  it.each([
    ['no label', undefined],
    ['an empty label', ''],
  ])('%s: aria-hidden, no role', (_name, label) => {
    const { root } = getSvgIconProps({ iconName: 'check', icons, label });
    expect(root['aria-hidden']).toBe('true');
    expect(root).not.toHaveProperty('role');
    expect(root).not.toHaveProperty('aria-label');
  });

  it('a label: role img and aria-label, no aria-hidden', () => {
    const { root } = getSvgIconProps({ iconName: 'check', icons, label: 'Done' });
    expect(root).toEqual({ class: 'cck-svg-icon', 'data-icon-name': 'check', role: 'img', 'aria-label': 'Done' });
    expect(root).not.toHaveProperty('aria-hidden');
  });

  it('does not mutate the icon set, and shares no array with it', () => {
    const before = JSON.stringify(icons);
    const { paths } = getSvgIconProps({ iconName: 'ring', icons });
    expect(JSON.stringify(icons)).toBe(before);
    expect(paths).not.toBe(icons.ring.paths);
  });

  it('keeps markup in the path data as plain text', () => {
    const d = '"/><script>alert(1)</script><path d="';
    const { paths } = getSvgIconProps({ iconName: 'x', icons: { x: { viewBox: '0 0 1 1', paths: [{ d }] } } });
    expect(paths).toEqual([{ d }]);
  });

  it('only emits root data-* declared in the meta, and only declared path attributes', () => {
    const { root, paths } = getSvgIconProps({ iconName: 'ring', icons, label: 'x' });
    const keys = Object.keys(root).filter((k) => k.startsWith('data-'));
    expect(svgIconMeta.dataAttrs.root).toEqual(expect.arrayContaining(keys));
    for (const path of paths) {
      expect(['d', 'fill-rule', 'clip-rule']).toEqual(expect.arrayContaining(Object.keys(path)));
    }
  });
});

describe('svgIconMeta', () => {
  it('records the root role as null and explains the label in the data attribute detail', () => {
    expect(svgIconMeta.roles).toEqual({ root: null, svg: null });
    expect(svgIconMeta.dataAttrDetails?.['data-icon-name']?.setWhen).toMatch(/always/i);
    expect(svgIconMeta.keyboard).toEqual([]);
  });
});
