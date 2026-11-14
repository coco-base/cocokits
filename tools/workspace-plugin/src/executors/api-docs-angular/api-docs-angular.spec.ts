import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import executor from './executor';
import type { ApiDocJson } from '../api-docs-common/types';
import { entryPointsOf, extractAngularApiDocs, sourceFileOf } from './extract';
import { REPO, scratchArea } from '../api-docs-common/testing/scratch';

const FIXTURES = resolve(import.meta.dirname, 'fixtures');
const area = scratchArea('api-docs-angular');

/** A package `pkg` with one entry point `thing` whose index.ts is a fixture. */
function createPackage(
  name: string,
  fixture: string,
  change: (text: string) => string = (text) => text,
): { root: string; project: string; tsConfig: string } {
  const { project, tsConfig } = area.create(
    name,
    {
      'thing/index.ts': change(readFileSync(join(FIXTURES, `${fixture}.ts.txt`), 'utf8')),
      'thing/ng-package.json': '{ "lib": { "entryFile": "index.ts" } }\n',
    },
    {
      compilerOptions: { experimentalDecorators: true, strict: true, types: [], noEmit: true, paths: {} },
      angularCompilerOptions: { strictTemplates: true },
      include: ['**/*.ts'],
    },
  );
  return { root: REPO, project, tsConfig };
}

function extract(name: string, fixture: string, change?: (text: string) => string): ApiDocJson[] {
  const { root, project, tsConfig } = createPackage(name, fixture, change);
  return extractAngularApiDocs(root, project, tsConfig);
}

afterEach(() => {
  area.clean();
});

describe('extractAngularApiDocs: inheritance', () => {
  it('lists the public inputs and outputs a directive inherits from an unexported abstract base', () => {
    const [doc, ...more] = extract('inherit', 'inherit');
    expect(more).toEqual([]);
    expect(doc?.component).toBe('thing');
    expect(doc?.framework).toBe('angular');
    const [part, ...otherParts] = doc?.parts ?? [];
    expect(otherParts).toEqual([]);
    expect(part).toMatchObject({
      name: 'Thing',
      semanticId: 'thing.root',
      selector: 'button[thing]',
      anatomyPart: 'root',
      description: 'The thing on a native `<button>`.',
    });
    const props = part?.props.map((member) => member.name);
    expect(props).toEqual(['disabled', 'value', 'label', 'sizeAlias', 'legacy']);
    expect(part?.events.map((member) => member.name)).toEqual(['toggled', 'legacyOut']);
  });

  it('gives the inherited input its TSDoc, default and read type (booleanAttribute reads boolean)', () => {
    const part = extract('inherit-read', 'inherit')[0]?.parts[0];
    expect(part?.props[0]).toEqual({
      name: 'disabled',
      semanticId: 'thing.disabled',
      type: 'boolean',
      default: 'false',
      required: false,
      description: 'Whether the thing is disabled.',
    });
    expect(part?.events[0]).toMatchObject({
      name: 'toggled',
      type: 'boolean',
      description: 'Emits when the thing is toggled.',
    });
  });

  it('reads the transform input of the subclass too, and the alias, required flag and decorators', () => {
    const part = extract('inherit-own', 'inherit')[0]?.parts[0];
    const byName = (name: string) => part?.props.find((member) => member.name === name);
    expect(byName('sizeAlias')).toMatchObject({ type: 'number', required: false, semanticId: 'thing.sizeAlias' });
    expect(byName('label')).toMatchObject({ type: 'string', required: true, semanticId: 'thing.title' });
    expect(byName('value')).toMatchObject({ type: 'string | undefined', required: false });
    expect(byName('legacy')).toMatchObject({ type: 'string', description: 'An old-style input.' });
    expect(part?.events[1]).toMatchObject({ name: 'legacyOut', type: 'number' });
  });

  it('writes a slot per @cckSlot tag, with the selector of a named one', () => {
    const part = extract('inherit-slots', 'inherit')[0]?.parts[0];
    expect(part?.slots).toEqual([
      {
        name: 'default',
        semanticId: 'thing.default',
        type: 'content',
        required: false,
        description: 'The label of the thing.',
      },
      {
        name: 'hint',
        semanticId: 'thing.hint',
        type: 'content',
        required: false,
        description: 'A hint below the thing.',
        selector: '[thingHint]',
      },
    ]);
  });

  it('keeps a hyphen with spaces inside the slot description, and writes the description of every part', () => {
    const twoParts = (text: string): string =>
      text.replace('The label of the thing.', 'Before - after.') +
      "\n/**\n * A second part.\n * @cckPart wrapper\n */\n@Directive({ selector: 'div[wrapper]' })\nexport class Wrapper {}\n";
    const doc = extract('inherit-parts', 'inherit', twoParts)[0];
    expect(doc?.parts[0]?.slots[0]?.description).toBe('Before - after.');
    expect(doc?.parts.map((part) => part.description)).toEqual(['The thing on a native `<button>`.', 'A second part.']);
  });

  const tag = (line: string) => (text: string) => text.replace('@cckSlot default - The label of the thing.', line);

  it('fails on a malformed @cckSlot tag, naming the tag', () => {
    expect(() => extract('slot-bad', 'inherit', tag('@cckSlot default The label.'))).toThrow(
      /@cckSlot default The label\./,
    );
  });

  it('fails on a default slot with a selector, naming the tag', () => {
    expect(() => extract('slot-default-selector', 'inherit', tag('@cckSlot default [sel] - The label.'))).toThrow(
      /@cckSlot default \[sel\] - The label\./,
    );
  });

  it('writes a model as a prop and a binding', () => {
    const part = extract('inherit-model', 'inherit')[0]?.parts[0];
    expect(part?.bindings).toEqual([{ semanticId: 'thing.value', value: 'value', syntax: '[(value)]' }]);
  });

  it('never lists protected, private, abstract, @internal or lifecycle members, nor a part for the base', () => {
    const doc = extract('inherit-hidden', 'inherit')[0];
    const part = doc?.parts[0];
    const names = [part?.props, part?.events, part?.methods].flatMap((list) => list ?? []).map((member) => member.name);
    for (const hidden of ['tag', 'helper', 'secret', 'ngOnInit', 'register']) expect(names).not.toContain(hidden);
    expect(doc?.parts.map((item) => item.name)).toEqual(['Thing']);
    expect(JSON.stringify(doc)).not.toContain('ThingBase');
  });

  it('lists a public method, with its signature as the type, and one a subclass made public from an abstract one', () => {
    const part = extract('inherit-methods', 'inherit')[0]?.parts[0];
    expect(part?.methods.map((member) => member.name)).toEqual(['close', 'open', 'oldOpen']);
    expect(part?.methods.find((member) => member.name === 'open')).toMatchObject({
      type: '(amount: number) => boolean',
      description: 'Opens it by an amount.',
    });
    expect(part?.methods.find((member) => member.name === 'close')?.description).toBe('Closes the thing.');
  });

  it('writes the first TSDoc paragraph as the description and folds the rest into remarks, @deprecated and @example', () => {
    const part = extract('inherit-tags', 'inherit')[0]?.parts[0];
    expect(part?.methods.find((member) => member.name === 'oldOpen')).toMatchObject({
      description: 'Opens it the old way.',
      deprecated: 'Use `open`.',
    });
  });
});

describe('extractAngularApiDocs: an exported abstract base', () => {
  const BASE = `import { Directive, input, output } from '@angular/core';

/** What a change carries. */
export interface Change<R extends string> {
  readonly reason: R;
}

/** The base of two controls: abstract, so it has no part. */
@Directive()
export abstract class ControlBase<R extends string = string> {
  /** Emits a change with its reason. */
  readonly changed = output<Change<R>>();

  /**
   * Whether the control is read-only.
   * @cckSemantic *.readOnly
   */
  readonly readonly = input(false);
}

export type FirstReason = 'typed' | 'reset';

/**
 * The first control.
 * @cckPart root
 */
@Directive({ selector: 'input[first]' })
export class First extends ControlBase<FirstReason> {}
`;
  const NG_PACKAGE = '{ "lib": { "entryFile": "index.ts" } }';
  const SECOND = `import { Directive } from '@angular/core';
import { ControlBase } from '../first';

export type SecondReason = 'pasted' | 'cleared';

/**
 * The second control.
 * @cckPart root
 */
@Directive({ selector: 'textarea[second]' })
export class Second extends ControlBase<SecondReason> {}
`;

  it('writes no part for it, resolves a "*." semantic id and a type argument per inheriting component', () => {
    const { project, tsConfig } = area.create(
      'abstract-base',
      {
        'first/index.ts': BASE,
        'first/ng-package.json': NG_PACKAGE,
        'second/index.ts': SECOND,
        'second/ng-package.json': NG_PACKAGE,
      },
      {
        compilerOptions: { experimentalDecorators: true, strict: true, types: [], noEmit: true, paths: {} },
        angularCompilerOptions: { strictTemplates: true },
        include: ['**/*.ts'],
      },
    );
    const docs = extractAngularApiDocs(REPO, project, tsConfig);
    expect(docs.map((doc) => [doc.component, doc.parts.map((part) => part.name)])).toEqual([
      ['first', ['First']],
      ['second', ['Second']],
    ]);
    expect(docs.map((doc) => doc.parts[0]?.props.map((prop) => prop.semanticId))).toEqual([
      ['first.readOnly'],
      ['second.readOnly'],
    ]);
    expect(docs.map((doc) => doc.parts[0]?.events.map((event) => event.type))).toEqual([
      ['Change<FirstReason>'],
      ['Change<SecondReason>'],
    ]);
  });
});

describe('extractAngularApiDocs: TSDoc is required', () => {
  it('fails on an inherited input without TSDoc and on an own one, naming the class that declares it', () => {
    expect(() => extract('missing', 'missing-doc')).toThrow(
      /Thing\.undocumented: no TSDoc description \(declared in Base\)/,
    );
  });

  it('lists every problem in one error', () => {
    const { root, project, tsConfig } = createPackage('missing-all', 'missing-doc');
    writeFileSync(
      join(project, 'thing', 'index.ts'),
      readFileSync(join(project, 'thing', 'index.ts'), 'utf8').replace(
        'readonly own = input',
        'readonly ownUndocumented = input',
      ),
    );
    try {
      extractAngularApiDocs(root, project, tsConfig);
      expect.unreachable();
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      expect(message).toContain('2 problem(s)');
      expect(message).toContain('Thing.undocumented');
      expect(message).toContain('Thing.ownUndocumented: no TSDoc description (declared in Thing)');
    }
  });

  it('fails on a directive without @cckPart or without a description', () => {
    expect(() => extract('no-part', 'no-part')).toThrow(/Thing: the TSDoc needs "@cckPart <part>"/);
    expect(() => extract('no-part-2', 'no-part')).toThrow(/Thing: no TSDoc description/);
  });

  it('fails on a package without an entry point', () => {
    const { root, project, tsConfig } = createPackage('empty', 'inherit');
    rmSync(join(project, 'thing', 'ng-package.json'));
    expect(() => extractAngularApiDocs(root, project, tsConfig)).toThrow(/no Angular entry point/);
  });
});

describe('entryPointsOf', () => {
  it('lists the folders with an ng-package.json and an index.ts, in name order, without core', () => {
    const { project } = createPackage('entries', 'inherit');
    for (const name of ['alpha', 'core', 'no-index', 'dist']) {
      mkdirSync(join(project, name), { recursive: true });
      writeFileSync(join(project, name, 'ng-package.json'), '{}');
    }
    for (const name of ['alpha', 'core', 'dist']) writeFileSync(join(project, name, 'index.ts'), 'export {};\n');
    expect(entryPointsOf(project).map((entry) => entry.name)).toEqual(['alpha', 'thing']);
  });
});

/** The inherit fixture with the text the text rules ask for: the "When not set" sentences and the method examples. */
function followsTextRules(text: string): string {
  const example = (doc: string, call: string): string => `/**\n   * ${doc}\n   * @example\n   * ${call}\n   */`;
  return text
    .replace(
      '/** The value, with two-way binding. */',
      '/** The value, with two-way binding. When not set, it is empty. */',
    )
    .replace('/** A number with an alias. */', '/** A number with an alias. When not set, it is 3. */')
    .replace('/** An old-style input. */', '/** An old-style input. When not set, it is empty. */')
    .replace('- The label of the thing.', '- The label of the thing. When not set, the thing has no label.')
    .replace('below the thing.', 'below the thing. When not set, no hint shows.')
    .replace('/** Closes the thing; the subclass makes it public. */', example('Closes the thing.', 'thing.close();'))
    .replace('/** Closes the thing. */', example('Closes the thing.', 'thing.close();'))
    .replace('   * Opens it by an amount.\n', '   * Opens it by an amount.\n   * @example\n   * thing.open(1);\n')
    .replace('   * Opens it the old way.\n', '   * Opens it the old way.\n   * @example\n   * thing.oldOpen();\n');
}

describe('api-docs-angular executor', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('writes one ApiDoc file per entry point into the project, deterministically', async () => {
    createPackage('run', 'inherit', followsTextRules);
    const out = join(area.dir, 'run', 'out');
    const outputDir = `tools/workspace-plugin/tmp/api-docs-angular/run/out`;
    const options = { outputDir, tsConfig: '{projectRoot}/tsconfig.lib.json' };
    expect((await executor(options, area.context('run'))).success).toBe(true);
    expect(readdirSync(out)).toEqual(['thing.json']);
    const first = readFileSync(join(out, 'thing.json'), 'utf8');
    expect(JSON.parse(first)).toMatchObject({ component: 'thing', framework: 'angular' });
    expect(first.endsWith('}\n')).toBe(true);
    await executor(options, area.context('run'));
    expect(readFileSync(join(out, 'thing.json'), 'utf8')).toBe(first);
  });

  it('fails on TSDoc that breaks a text rule, names the item and writes nothing', async () => {
    createPackage('rules', 'inherit');
    const outputDir = 'tools/workspace-plugin/tmp/api-docs-angular/rules/out';
    expect((await executor({ outputDir }, area.context('rules'))).success).toBe(false);
    expect(vi.mocked(console.error).mock.calls.join('\n')).toMatch(
      /angular\/thing Thing\.close\(\): needs an @example/,
    );
    expect(existsSync(join(area.dir, 'rules', 'out'))).toBe(false);
  });

  it('fails on a member without TSDoc and writes nothing', async () => {
    createPackage('fail', 'missing-doc');
    const result = await executor(
      { outputDir: 'tools/workspace-plugin/tmp/api-docs-angular/fail/out' },
      area.context('fail'),
    );
    expect(result.success).toBe(false);
    expect(vi.mocked(console.error).mock.calls.join('\n')).toMatch(/Thing\.undocumented/);
    expect(existsSync(join(area.dir, 'fail', 'out'))).toBe(false);
  });

  it('fails for an outputDir or a tsConfig outside the workspace', async () => {
    createPackage('paths', 'inherit');
    for (const options of [{ outputDir: '../outside' }, { tsConfig: '../tsconfig.json' }]) {
      expect((await executor(options, area.context('paths'))).success).toBe(false);
    }
    expect(vi.mocked(console.error).mock.calls.join('\n')).toMatch(/outputDir: .* is outside the workspace/);
    expect(vi.mocked(console.error).mock.calls.join('\n')).toMatch(/tsConfig: .* is outside the workspace/);
  });
});

describe('sourceFileOf', () => {
  const file = { fileName: '/work/repo/packages/angular/button/button.ts' } as never;
  const program = (directory: string) => ({
    getCurrentDirectory: () => directory,
    getSourceFile: (name: string) => (name === '/work/repo/packages/angular/button/button.ts' ? file : undefined),
  });

  it('finds a file by the path relative to the current directory, which Angular reports on Linux', () => {
    expect(sourceFileOf(program('/work/repo'), '/packages/angular/button/button.ts')).toBe(file);
    expect(sourceFileOf(program('/work/repo/'), '/packages/angular/button/button.ts')).toBe(file);
  });

  it('finds a file by its absolute path, which Angular reports on Windows', () => {
    expect(sourceFileOf(program('C:/other'), '/work/repo/packages/angular/button/button.ts')).toBe(file);
  });

  it('returns nothing for an unknown file', () => {
    expect(sourceFileOf(program('/work/repo'), '/packages/angular/none.ts')).toBeUndefined();
  });
});

describe('extractAngularApiDocs: compound components', () => {
  const parts = (name: string): ApiDocJson['parts'] => extract(name, 'compound')[0]?.parts ?? [];

  it('writes the parts a directive renders (renders), the section, the template and a root with no element', () => {
    const [thing, item, overlay, content, ...others] = parts('compound');
    expect(others).toEqual([]);
    expect(thing).toMatchObject({ name: 'Thing', semanticId: 'thing.root', anatomyPart: 'root', renders: ['list'] });
    expect(item).toMatchObject({
      semanticId: 'thing.panel',
      section: { partName: 'trigger', slotName: 'header', inputName: 'header' },
    });
    expect(overlay?.semanticId).toBe('thing.root');
    expect(overlay?.anatomyPart).toBeUndefined();
    expect(content).toMatchObject({ semanticId: 'thing.content', templateSelector: 'ng-template[thingPortal]' });
  });

  it('reads the text a template directive gives its slot to its end', () => {
    const [doc] = extract('compound-at-sign', 'compound', (text) =>
      text.replace(
        ' * The template of the preview slot.\n',
        ' * The template of the preview slot.\n * @remarks Use @click to listen.\n * @example\n * <ng-template thingPreview @click="x" />\n',
      ),
    );
    const preview = doc?.parts[0]?.slots.find((slot) => slot.name === 'preview');
    expect(preview?.remarks).toBe('Use @click to listen.');
    expect(preview?.examples).toEqual(['<ng-template thingPreview @click="x" />']);
  });

  it('does not list a portal directive or a slot template as a part', () => {
    expect(parts('compound-skip').map((part) => part.name)).not.toContain('ThingPortal');
    expect(parts('compound-skip-2').map((part) => part.name)).not.toContain('ThingPreview');
  });

  it('puts the part in the semantic id of the members of a part other than the root', () => {
    const [thing, item] = parts('compound-ids');
    expect(thing?.props[0]?.semanticId).toBe('thing.list.aria-label');
    expect(item?.props[0]?.semanticId).toBe('thing.panel.disabled');
  });

  it('reads the scope of a slot from the context guard of its template directive', () => {
    const preview = parts('compound-scope')[0]?.slots.find((slot) => slot.name === 'preview');
    expect(preview?.scope).toEqual([
      { name: 'selected', type: 'readonly string[]', description: 'The values that are selected.' },
    ]);
  });

  it('writes a type parameter of the scope with the default of the component', () => {
    const generic = (text: string): string =>
      text
        .replace('export class Thing {', 'export class Thing<T = string> {')
        .replace('readonly selected: readonly string[]', 'readonly selected: readonly T[]');
    const preview = extract('compound-scope-generic', 'compound', generic)[0]?.parts[0]?.slots.find(
      (slot) => slot.name === 'preview',
    );
    expect(preview?.scope?.[0]?.type).toBe('readonly string[]');
  });

  it('fails on a scope field without TSDoc and on a malformed @cckSection', () => {
    expect(() =>
      extract('compound-undocumented', 'compound', (text) => text.replace('/** The values that are selected. */', '')),
    ).toThrow(/scope field "selected" has no TSDoc/);
    expect(() =>
      extract('compound-section', 'compound', (text) => text.replace('trigger header header', 'trigger')),
    ).toThrow(/@cckSection/);
  });
});

describe('extractAngularApiDocs: generic components', () => {
  it('reads a member typed by a type parameter with the default of the parameter', () => {
    const part = extract('generic', 'generic')[0]?.parts[0];
    expect(part?.props.map((prop) => [prop.name, prop.type])).toEqual([
      ['value', 'string | undefined'],
      ['options', 'readonly string[]'],
    ]);
  });
});

describe('extractAngularApiDocs: parts and defaults that differ by design', () => {
  const parts = (name: string, change: (text: string) => string): ApiDocJson['parts'] =>
    extract(name, 'compound', change)[0]?.parts ?? [];
  const item = '  /** Whether the item is disabled. */';

  it('writes the reason of @cckDefaultDiffers on the member', () => {
    const [, panel] = parts('differs', (text) =>
      text.replace(
        item,
        '  /**\n   * Whether the item is disabled.\n   * @cckDefaultDiffers Angular reads it from a token.\n   */',
      ),
    );
    expect(panel?.props[0]?.defaultDiffers).toBe('Angular reads it from a token.');
  });

  it('fails on @cckDefaultDiffers without a reason', () => {
    expect(() =>
      parts('differs-empty', (text) =>
        text.replace(item, '  /**\n   * Whether the item is disabled.\n   * @cckDefaultDiffers\n   */'),
      ),
    ).toThrow(/ThingItem\.disabled: "@cckDefaultDiffers" needs a reason/);
  });

  it('marks a part tagged @cckSemantic none as framework-only, and needs its @cckParity', () => {
    const tagged = (reason: string) => (text: string) =>
      text.replace(' * @cckNoElement', ` * @cckNoElement\n * @cckSemantic none\n${reason}`);
    const [, , overlay] = parts('only', tagged(' * @cckParity Only this framework has the part.\n'));
    expect(overlay?.frameworkOnly).toBe(true);
    expect(JSON.stringify(overlay)).not.toMatch(/parity|Only this framework/i);
    expect(() => parts('only-remarks', tagged(' * @remarks The part.\n'))).toThrow(/needs a "@cckParity"/);
    expect(() => parts('only-empty', tagged(''))).toThrow(
      /ThingOverlay: the part is "@cckSemantic none" and needs a "@cckParity"/,
    );
    expect(() => parts('only-blank', tagged(' * @cckParity\n'))).toThrow(
      /ThingOverlay: the part: "@cckParity" needs a reason/,
    );
  });
});
