// @vitest-environment jsdom
import { act, cleanup, render } from '@testing-library/react';
import { useEffect, type ReactElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { chevronDownIcon, heartIcon } from '@cocokits/icons';
import { IconProvider, ThemeProvider, useIconRegistry } from '@cocokits/react-core';
import { defineThemeConfig } from '@cocokits/shared';
import { Accordion } from '../../accordion';
import { Checkbox } from '../../checkbox';
import { Select } from '../../select';
import { drawnIconsIn } from './part-icon-fixtures';
import { stubTopLayer } from '../../select/tests/fixtures';

beforeEach(() => {
  stubTopLayer();
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

interface Part {
  readonly block: 'select' | 'accordion' | 'checkbox';
  readonly part: string;
  /** The default icon of the part. */
  readonly fallback: string;
  /** Whether the part takes content. */
  readonly takesContent: boolean;
  readonly ui: (own?: ReactElement) => ReactElement;
}

const accordion = (
  <Accordion.Root type="single" collapsible>
    <Accordion.Item value="a">
      <Accordion.Header>
        <Accordion.Trigger>Shipping</Accordion.Trigger>
      </Accordion.Header>
    </Accordion.Item>
  </Accordion.Root>
);

const parts: readonly Part[] = [
  {
    block: 'select',
    part: 'dropdownIcon',
    fallback: 'chevron-down',
    takesContent: true,
    ui: (own) => (
      <Select.Root>
        <Select.Trigger aria-label="Dish">
          <Select.Icon>{own}</Select.Icon>
        </Select.Trigger>
      </Select.Root>
    ),
  },
  {
    block: 'select',
    part: 'optionIndicator',
    fallback: 'check',
    takesContent: true,
    ui: (own) => (
      <Select.Root defaultValue="Cake" defaultOpen>
        <Select.Trigger aria-label="Dish" />
        <Select.Content>
          <Select.Item value="Cake">
            <Select.ItemIndicator>{own}</Select.ItemIndicator>
            <Select.ItemText>Cake</Select.ItemText>
          </Select.Item>
        </Select.Content>
      </Select.Root>
    ),
  },
  { block: 'accordion', part: 'indicator', fallback: 'chevron-down', takesContent: false, ui: () => accordion },
  {
    block: 'checkbox',
    part: 'background',
    fallback: 'check',
    takesContent: false,
    ui: () => <Checkbox defaultChecked>Accept</Checkbox>,
  },
];

const themeOf = (block: string, part: string, name: string | undefined): ReturnType<typeof defineThemeConfig> =>
  defineThemeConfig({
    name: 'test',
    components: name === undefined ? {} : { [block]: { icons: { [part]: name } } },
  });

describe.each(parts)('$block $part: content, theme icon, default', ({ block, part, fallback, takesContent, ui }) => {
  const rows: readonly [string, string | undefined, boolean, string][] = [
    ['a registered theme name', 'heart', true, 'heart'],
    ['an unregistered theme name', 'missing', false, fallback],
    ['no entry in the theme', undefined, false, fallback],
  ];

  it.each(rows)('with %s', (_row, themeName, registered, expected) => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { baseElement } = render(
      <ThemeProvider themeConfig={themeOf(block, part, themeName)}>
        <IconProvider icons={registered ? { heart: heartIcon } : {}}>{ui()}</IconProvider>
      </ThemeProvider>,
    );
    expect(drawnIconsIn(baseElement)).toEqual([expected]);
    const messages = error.mock.calls.map(([message]) => String(message));
    if (themeName === 'missing') {
      expect(messages).toHaveLength(1);
      expect(messages[0]).toMatch(new RegExp(`^CocoKits: .*"missing".*${block} ${part}`));
    } else {
      expect(messages).toEqual([]);
    }
  });

  it.runIf(takesContent)('shows the author content instead of any icon', () => {
    const { baseElement } = render(
      <ThemeProvider themeConfig={themeOf(block, part, 'heart')}>
        <IconProvider icons={{ heart: heartIcon }}>{ui(<i data-own="" />)}</IconProvider>
      </ThemeProvider>,
    );
    expect(drawnIconsIn(baseElement)).toEqual([]);
    expect(baseElement.querySelector('[data-own]')).not.toBeNull();
  });
});

describe('a late registration', () => {
  it('replaces the default icon of a part with the theme icon registered afterwards', () => {
    let registry: ReturnType<typeof useIconRegistry> | undefined;
    function Grab(): null {
      const own = useIconRegistry();
      useEffect(() => {
        registry = own;
      }, [own]);
      return null;
    }
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { baseElement } = render(
      <ThemeProvider themeConfig={themeOf('accordion', 'indicator', 'late')}>
        <IconProvider icons={{ 'chevron-down': chevronDownIcon }}>
          <Grab />
          {accordion}
        </IconProvider>
      </ThemeProvider>,
    );
    expect(drawnIconsIn(baseElement)).toEqual(['chevron-down']);
    act(() => {
      registry?.registerIcons({ late: heartIcon });
    });
    expect(drawnIconsIn(baseElement)).toEqual(['late']);
  });
});
