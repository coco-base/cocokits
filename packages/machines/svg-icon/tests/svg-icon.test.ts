import { describe, expect, it } from 'vitest';
import { checkIcon, heartIcon } from '@cocokits/icons';
import { getSvgIconProps, svgIconAnatomy, svgIconMeta } from '../index';

const check = checkIcon;
const ring = { viewBox: heartIcon.viewBox, body: `<g>${heartIcon.body}</g>` };

describe('anatomy', () => {
  it('has a root and the svg with their classes', () => {
    expect(svgIconAnatomy.block).toBe('svg-icon');
    expect(svgIconAnatomy.classes).toEqual({ root: 'cck-svg-icon', svg: 'cck-svg-icon__svg' });
  });
});

describe('getSvgIconProps', () => {
  it('a found icon gives the viewBox, the body as it is and the name', () => {
    expect(getSvgIconProps({ iconName: 'ring', icon: ring })).toEqual({
      root: { class: 'cck-svg-icon', 'data-icon': 'ring', 'aria-hidden': 'true' },
      svg: { class: 'cck-svg-icon__svg', viewBox: ring.viewBox, 'aria-hidden': 'true', focusable: 'false' },
      body: ring.body,
    });
  });

  it('keeps any markup of the body untouched', () => {
    expect(getSvgIconProps({ icon: ring }).body).toBe(ring.body);
  });

  it.each([
    ['no icon', { iconName: 'missing' }],
    ['an undefined icon', { iconName: 'missing', icon: undefined }],
  ])('%s: the owned svg has no viewBox and an empty body, the name kept', (_name, props) => {
    const out = getSvgIconProps(props);
    expect(out.svg).toEqual({ class: 'cck-svg-icon__svg', 'aria-hidden': 'true', focusable: 'false' });
    expect(out.svg).not.toHaveProperty('viewBox');
    expect(out.body).toBe('');
    expect(out.root['data-icon']).toBe('missing');
  });

  it.each([
    ['no name', undefined],
    ['an empty name', ''],
  ])('%s: no data-icon', (_name, iconName) => {
    expect(getSvgIconProps({ iconName, icon: check }).root).not.toHaveProperty('data-icon');
  });

  it('always renders the svg ARIA, also with a label', () => {
    const { svg } = getSvgIconProps({ iconName: 'check', icon: check, label: 'Done' });
    expect(svg['aria-hidden']).toBe('true');
    expect(svg.focusable).toBe('false');
  });

  it.each([
    ['no label', undefined],
    ['an empty label', ''],
  ])('%s: aria-hidden, no role', (_name, label) => {
    const { root } = getSvgIconProps({ iconName: 'check', icon: check, label });
    expect(root['aria-hidden']).toBe('true');
    expect(root).not.toHaveProperty('role');
    expect(root).not.toHaveProperty('aria-label');
  });

  it('a label: role img and aria-label, no aria-hidden', () => {
    const { root } = getSvgIconProps({ iconName: 'check', icon: check, label: 'Done' });
    expect(root).toEqual({ class: 'cck-svg-icon', 'data-icon': 'check', role: 'img', 'aria-label': 'Done' });
    expect(root).not.toHaveProperty('aria-hidden');
  });

  it('does not mutate the icon', () => {
    const before = JSON.stringify(ring);
    getSvgIconProps({ iconName: 'ring', icon: ring });
    expect(JSON.stringify(ring)).toBe(before);
  });

  it('only emits root data-* declared in the meta', () => {
    const { root } = getSvgIconProps({ iconName: 'ring', icon: ring, label: 'x' });
    const keys = Object.keys(root).filter((k) => k.startsWith('data-'));
    expect(svgIconMeta.dataAttrs.root).toEqual(expect.arrayContaining(keys));
  });
});

describe('svgIconMeta', () => {
  it('records the root role as null and says when data-icon is set', () => {
    expect(svgIconMeta.roles).toEqual({ root: null, svg: null });
    expect(svgIconMeta.dataAttrs).toEqual({ root: ['data-icon'], svg: [] });
    expect(svgIconMeta.dataAttrDetails?.['data-icon']?.setWhen).toMatch(/iconName/);
    expect(svgIconMeta.keyboard).toEqual([]);
  });
});
