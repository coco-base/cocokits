import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { REPO, scratchArea } from '../api-docs-common/testing/scratch';
import type { ApiDocJson } from '../api-docs-common/types';
import { baseDocFiles, type FixturePart } from './testing/base-docs';
import { extractThemeApiDocs } from './extract';

const area = scratchArea('api-docs-theme-angular');

const BASE: FixturePart[] = [
  { id: 'dialog.root', selector: '[cckDialog]' },
  { id: 'dialog.content', selector: 'dialog[cckDialogContent]' },
  { id: 'tooltip.root', selector: '[cckTooltip]' },
  { id: 'select.root', selector: 'cck-select' },
  { id: 'menu.content', selector: 'cck-menu-content' },
  { id: 'menu.subContent', selector: 'cck-menu-sub-content' },
  { id: 'menu.item', selector: 'cck-menu-item' },
  { id: 'menu.checkboxItem', selector: 'cck-menu-checkbox-item' },
  { id: 'menu.radioItem', selector: 'cck-menu-radio-item' },
  { id: 'menu.subTrigger', selector: 'cck-menu-sub-trigger' },
  { id: 'button.root', selector: 'button[cckButton]' },
  { id: 'button.root', selector: 'a[cckButton]' },
];

const SOURCE = `
import { Directive, input } from '@angular/core';

/** The size values of the dialog. */
export type DialogSize = 'sm' | 'lg';
/** The size values of the tooltip. */
export type TooltipSize = 'sm' | 'lg';

/**
 * The theme option of the Dialog root.
 *
 * @cckPart root
 */
@Directive({ selector: '[cckDialog]' })
export class CckDialogTheme {
  /**
   * Width of the window. A dialog opened by the service shows the default.
   *
   * @cckSemantic dialog.size
   */
  readonly dialogSize = input<DialogSize | null>();
}

/**
 * The theme of the Dialog content, which has no option.
 *
 * @cckPart content
 */
@Directive({ selector: 'dialog[cckDialogContent]' })
export class CckDialogContentTheme {}

/**
 * The theme option of the Tooltip root.
 *
 * @cckPart root
 */
@Directive({ selector: '[cckTooltip]' })
export class CckTooltipTheme {
  /**
   * Padding of the bubble.
   *
   * @cckSemantic tooltip.size
   */
  readonly tooltipSize = input<TooltipSize | null>();
}

/**
 * The theme options of the Select root.
 *
 * @cckPart root
 */
@Directive({ selector: 'cck-select' })
export class CckSelectTheme {
  /** Height of the trigger. */
  readonly size = input<'sm' | 'lg' | null>();
  /** How the chosen item is marked. */
  readonly indicator = input<'checkmark' | 'none' | null>();
}

/**
 * The theme of the Menu content and sub content.
 *
 * @cckPart content
 */
@Directive({ selector: 'cck-menu-content, cck-menu-sub-content' })
export class CckMenuTheme {
  /** Width of the list. */
  readonly size = input<'sm' | 'lg' | null>();
}

/**
 * The theme of the four Menu item parts.
 *
 * @cckPart item
 */
@Directive({ selector: 'cck-menu-item, cck-menu-checkbox-item, cck-menu-radio-item, cck-menu-sub-trigger' })
export class CckMenuItemTheme {
  /** Colour of the item. */
  readonly color = input<'danger' | null>();
}

/**
 * The theme of the two Angular classes of the Button.
 *
 * @cckPart root
 */
@Directive({ selector: 'button[cckButton], a[cckButton]' })
export class CckButtonTheme {
  /** Fill of the button. */
  readonly variant = input<'solid' | 'outline' | null>();
}
`;

function extract(name: string, source: string): ApiDocJson[] {
  const { project, tsConfig } = area.create(
    name,
    { 'src/index.ts': source, ...baseDocFiles(BASE) },
    {
      compilerOptions: { experimentalDecorators: true, strict: true, types: [], noEmit: true, paths: {} },
      angularCompilerOptions: { strictTemplates: true },
      include: ['**/*.ts'],
    },
  );
  return extractThemeApiDocs('angular', 'acme', join(project, '..', 'base'), REPO, project, tsConfig);
}

const docOf = (docs: ApiDocJson[], component: string): ApiDocJson => {
  const doc = docs.find((item) => item.component === component);
  if (doc === undefined) throw new Error(`no doc for ${component}`);
  return doc;
};

afterEach(() => {
  area.clean();
});

describe('extractThemeApiDocs, Angular', () => {
  it('writes one doc per base component, with the theme and the directives it exports', () => {
    const docs = extract('docs', SOURCE);
    expect(docs.map((doc) => doc.component)).toEqual(['button', 'dialog', 'menu', 'select', 'tooltip']);
    expect(docOf(docs, 'dialog')).toMatchObject({
      framework: 'angular',
      theme: 'acme',
      exports: ['CckDialogContentTheme', 'CckDialogTheme'],
    });
  });

  it('keeps a part with no member (a directive that only draws)', () => {
    const parts = docOf(extract('no-member', SOURCE), 'dialog').parts;
    const content = parts.find((part) => part.name === 'CckDialogContentTheme');
    expect(content).toMatchObject({ semanticId: 'dialog.content', selector: 'dialog[cckDialogContent]' });
    expect(content?.props).toEqual([]);
  });

  it('gives an alias-typed input its @cckSemantic id, its type and declaredIn theme', () => {
    const root = docOf(extract('tooltip', SOURCE), 'tooltip').parts[0];
    expect(root).toMatchObject({ name: 'CckTooltipTheme', semanticId: 'tooltip.root' });
    expect(root?.props).toEqual([
      expect.objectContaining({
        name: 'tooltipSize',
        semanticId: 'tooltip.size',
        type: "'sm' | 'lg' | null",
        declaredIn: 'theme',
        description: 'Padding of the bubble.',
      }),
    ]);
  });

  it('keeps the service sentence in the description of dialogSize', () => {
    const parts = docOf(extract('dialog', SOURCE), 'dialog').parts;
    const size = parts.find((part) => part.name === 'CckDialogTheme')?.props[0];
    expect(size).toMatchObject({
      semanticId: 'dialog.size',
      description: expect.stringContaining('opened by the service') as string,
    });
  });

  it('lists two options of one directive', () => {
    const root = docOf(extract('select', SOURCE), 'select').parts[0];
    expect(root?.props.map((prop) => [prop.name, prop.semanticId])).toEqual([
      ['size', 'select.size'],
      ['indicator', 'select.indicator'],
    ]);
  });

  it('lets a selector list own content and subContent, with the members on each', () => {
    const parts = docOf(extract('menu', SOURCE), 'menu').parts.filter((part) => part.name === 'CckMenuTheme');
    expect(parts.map((part) => part.semanticId).sort()).toEqual(['menu.content', 'menu.subContent']);
    for (const part of parts) expect(part.props.map((prop) => prop.name)).toEqual(['size']);
  });

  it('gives the four Menu item parts the same member', () => {
    const parts = docOf(extract('items', SOURCE), 'menu').parts.filter((part) => part.name === 'CckMenuItemTheme');
    expect(parts.map((part) => part.semanticId).sort()).toEqual([
      'menu.checkboxItem',
      'menu.item',
      'menu.radioItem',
      'menu.subTrigger',
    ]);
    for (const part of parts) expect(part.props.map((prop) => prop.name)).toEqual(['color']);
  });

  it('counts the two Angular classes of one Button as one owner', () => {
    const parts = docOf(extract('button', SOURCE), 'button').parts;
    expect(parts).toHaveLength(1);
    expect(parts[0]).toMatchObject({ semanticId: 'button.root', selector: 'button[cckButton], a[cckButton]' });
  });

  it.each([
    ['no owner', "'[cckUnknown]'", 'CckDialogTheme: the selector "[cckUnknown]" names no base part'],
    [
      'an alternative with no base part',
      "'[cckDialog], [cckUnknown]'",
      'CckDialogTheme: the selector "[cckUnknown]" names no base part',
    ],
    ['two base components', "'[cckDialog], [cckTooltip]'", 'names parts of two base components (dialog, tooltip)'],
  ])('fails for %s, with the name of the export', (name, selector, message) => {
    const source = SOURCE.replace("'[cckDialog]'", selector);
    expect(() => extract(`fail-${name.replaceAll(' ', '-')}`, source)).toThrow(message);
  });
});
