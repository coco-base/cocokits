// @vitest-environment jsdom
import { cleanup, screen } from '@testing-library/vue';
import { h, ref } from 'vue';
import { afterEach, describe, expect, it } from 'vitest';
import { leadingAnatomy, leadingMeta } from '@cocokits/machines/leading';
import { prefixAnatomy, prefixMeta } from '@cocokits/machines/prefix';
import { suffixAnatomy, suffixMeta } from '@cocokits/machines/suffix';
import { trailingAnatomy, trailingMeta } from '@cocokits/machines/trailing';
import { ThemeProvider } from '@cocokits/vue-core';
import { defineThemeConfig } from '@cocokits/shared';
import { Leading } from '../../leading';
import { Suffix } from '../../suffix';
import { Trailing } from '../../trailing';
import { Prefix } from '../index';
import { mountView } from '../../internal/tests/mount-helpers';

afterEach(cleanup);

const zones = [
  ['Prefix', Prefix, prefixAnatomy, prefixMeta],
  ['Suffix', Suffix, suffixAnatomy, suffixMeta],
  ['Leading', Leading, leadingAnatomy, leadingMeta],
  ['Trailing', Trailing, trailingAnatomy, trailingMeta],
] as const;

describe.each(zones)('%s', (_name, Zone, anatomy, meta) => {
  it('renders the default element of the meta with the class, no role and no other attribute', () => {
    mountView(() => h(Zone, { 'data-testid': 'zone' }, () => 'Content'));
    const zone = screen.getByTestId('zone');
    expect(zone.tagName.toLowerCase()).toBe(meta.defaultElements?.root);
    expect(zone.className).toBe(anatomy.classes.root);
    expect(zone.getAttributeNames().sort()).toEqual(['class', 'data-testid']);
    expect(zone.textContent).toBe('Content');
  });

  it('passes id, aria-hidden and native attributes, joins class and exposes the element', () => {
    const exposed = ref<{ element: Element | null } | null>(null);
    mountView(() =>
      h(
        Zone,
        {
          ref: exposed,
          'data-testid': 'zone',
          id: 'own',
          'aria-hidden': 'true',
          class: 'mine',
          style: { color: 'red' },
        },
        () => 'x',
      ),
    );
    const zone = screen.getByTestId('zone');
    expect(exposed.value?.element).toBe(zone);
    expect(zone.id).toBe('own');
    expect(zone.getAttribute('aria-hidden')).toBe('true');
    expect(zone.className).toBe(`${anatomy.classes.root} mine`);
    expect(zone.style.color).toBe('red');
  });

  it('renders as another tag, and merges onto a child with asChild', () => {
    mountView(() => [
      h(Zone, { 'data-testid': 'zone', as: 'span' }, () => 'Content'),
      h(Zone, { 'data-testid': 'child', asChild: true }, () => h('em', 'Own')),
    ]);
    expect(screen.getByTestId('zone').tagName.toLowerCase()).toBe('span');
    const child = screen.getByTestId('child');
    expect(child.tagName.toLowerCase()).toBe('em');
    expect(child.className).toBe(anatomy.classes.root);
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
    mountView(() => h(ThemeProvider, { themeConfig: config }, () => h(Zone, { 'data-testid': 'zone' }, () => 'x')));
    expect(screen.getByTestId('zone').getAttribute('data-probe')).toBe('on');
  });
});
