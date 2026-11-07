// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { leadingAnatomy, leadingMeta } from '@cocokits/machines/leading';
import { prefixAnatomy, prefixMeta } from '@cocokits/machines/prefix';
import { suffixAnatomy, suffixMeta } from '@cocokits/machines/suffix';
import { trailingAnatomy, trailingMeta } from '@cocokits/machines/trailing';
import { ThemeProvider } from '@cocokits/react-core';
import { defineThemeConfig } from '@cocokits/shared';
import { Leading } from '../../leading';
import { Suffix } from '../../suffix';
import { Trailing } from '../../trailing';
import { Prefix } from '../index';

afterEach(cleanup);

const zones = [
  ['Prefix', Prefix, prefixAnatomy, prefixMeta],
  ['Suffix', Suffix, suffixAnatomy, suffixMeta],
  ['Leading', Leading, leadingAnatomy, leadingMeta],
  ['Trailing', Trailing, trailingAnatomy, trailingMeta],
] as const;

describe.each(zones)('%s', (_name, Zone, anatomy, meta) => {
  it('renders the default element of the meta with the class, no role and no other attribute', () => {
    render(<Zone data-testid="zone">Content</Zone>);
    const zone = screen.getByTestId('zone');
    expect(zone.tagName.toLowerCase()).toBe(meta.defaultElements?.root);
    expect(zone.className).toBe(anatomy.classes.root);
    expect(zone.getAttributeNames().sort()).toEqual(['class', 'data-testid']);
    expect(zone.textContent).toBe('Content');
  });

  it('passes id, aria-hidden and native attributes, joins className and forwards ref', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Zone data-testid="zone" ref={ref} id="own" aria-hidden="true" className="mine" style={{ color: 'red' }}>
        x
      </Zone>,
    );
    const zone = screen.getByTestId('zone');
    expect(ref.current).toBe(zone);
    expect(zone.id).toBe('own');
    expect(zone.getAttribute('aria-hidden')).toBe('true');
    expect(zone.className).toBe(`${anatomy.classes.root} mine`);
    expect(zone.style.color).toBe('red');
  });

  it('replaces the element with render and renders the children it is given', () => {
    render(
      <Zone data-testid="zone" render={<span className="s">own</span>}>
        Content
      </Zone>,
    );
    const zone = screen.getByTestId('zone');
    expect(zone.tagName.toLowerCase()).toBe('span');
    expect(zone.textContent).toBe('Content');
  });

  it('puts the theme attribute on its root', () => {
    const config = defineThemeConfig({
      name: 'test',
      components: {
        [anatomy.block]: {
          probe: { attrName: 'probe', values: ['on'], default: 'on', partNames: Object.keys(anatomy.parts) },
        },
      },
    });
    render(
      <ThemeProvider themeConfig={config}>
        <Zone data-testid="zone">x</Zone>
      </ThemeProvider>,
    );
    expect(screen.getByTestId('zone').getAttribute('data-probe')).toBe('on');
  });
});
