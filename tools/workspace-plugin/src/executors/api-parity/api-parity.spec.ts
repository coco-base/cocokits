import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ApiDocJson, ApiMemberJson, ApiSlotJson } from '../api-docs-common/types';
import { compareApiDocs } from './compare';
import executor from './executor';
import { readApiDocs } from './read';

const FIXTURES = join(import.meta.dirname, 'fixtures');
const FRAMEWORKS = ['angular', 'react', 'vue'] as const;
type Framework = (typeof FRAMEWORKS)[number];

const fixture = (framework: Framework): ApiDocJson =>
  JSON.parse(readFileSync(join(FIXTURES, `button-${framework}.json`), 'utf8')) as ApiDocJson;
const buttons = (): ApiDocJson[] => FRAMEWORKS.map(fixture);

function member(over: Partial<ApiMemberJson>): ApiMemberJson {
  return { name: 'x', semanticId: 'button.x', type: 'boolean', required: false, description: 'Text.', ...over };
}

/** The fixtures with `change` applied to the first part of one framework. */
function changed(framework: Framework, change: (part: ApiDocJson['parts'][number]) => void): ApiDocJson[] {
  const docs = buttons();
  const part = docs.find((doc) => doc.framework === framework)?.parts[0];
  if (!part) throw new Error('no part');
  change(part);
  return docs;
}

describe('compareApiDocs on the three Button shapes', () => {
  it('passes with the default slot in all three, and reports its type difference only', () => {
    const result = compareApiDocs(buttons());
    expect(result.failures).toEqual([]);
    expect(result.reports).toEqual([
      'button.root slots "button.default" type differs: angular content; react ReactNode; vue any',
    ]);
  });

  it('fails on a slot that exists in one framework only, but not on a slot marked none', () => {
    const sided = compareApiDocs(changed('react', (part) => void (part.slots.length = 0)));
    expect(sided.failures).toEqual(['button.root slots "button.default" exists in angular, vue only, not in react']);
    const none = compareApiDocs(
      changed('vue', (part) => part.slots.push(member({ name: 'host', semanticId: 'none' }))),
    );
    expect(none.failures).toEqual([]);
  });

  it('fails on a prop that exists in one framework only', () => {
    const { failures } = compareApiDocs(changed('react', (part) => part.props.push(member({}))));
    expect(failures).toEqual(['button.root props "button.x" exists in react only, not in angular, vue']);
  });

  it('does not require an aria-* member in Vue, but still requires it in Angular and React', () => {
    const aria = (): ApiMemberJson => member({ name: 'aria-label', semanticId: 'button.aria-label', type: 'string' });
    const docs = buttons();
    for (const doc of docs) if (doc.framework !== 'vue') doc.parts[0]?.props.push(aria());
    expect(compareApiDocs(docs).failures).toEqual([]);
    const sided = compareApiDocs(changed('react', (part) => part.props.push(aria())));
    expect(sided.failures).toEqual(['button.root props "button.aria-label" exists in react only, not in angular']);
    const vueOnly = compareApiDocs(changed('vue', (part) => part.props.push(aria())));
    expect(vueOnly.failures).toEqual([
      'button.root props "button.aria-label" exists in vue only, not in angular, react',
    ]);
    const other = compareApiDocs(
      changed('react', (part) => part.props.push(member({ name: 'arialess', semanticId: 'button.arialess' }))),
    );
    expect(other.failures).toEqual(['button.root props "button.arialess" exists in react only, not in angular, vue']);
    const glued = compareApiDocs(
      changed('react', (part) => part.props.push(member({ name: 'x', semanticId: 'button.formaria-label' }))),
    );
    expect(glued.failures).toEqual([
      'button.root props "button.formaria-label" exists in react only, not in angular, vue',
    ]);
  });

  it('fails on an event that exists in one framework only', () => {
    const { failures } = compareApiDocs(
      changed('vue', (part) => part.events.push(member({ name: 'press', semanticId: 'button.press' }))),
    );
    expect(failures).toEqual(['button.root events "button.press" exists in vue only, not in angular, react']);
  });

  it('fails on a one-sided method but not on a method marked none', () => {
    const none = compareApiDocs(changed('vue', (part) => part.methods.push(member({ semanticId: 'none' }))));
    expect(none.failures).toEqual([]);
    const sided = compareApiDocs(changed('vue', (part) => part.methods.push(member({ semanticId: 'button.focus' }))));
    expect(sided.failures).toHaveLength(1);
  });

  it('fails on a default difference, and on a default present in one framework only', () => {
    const differs = compareApiDocs(
      changed('react', (part) => {
        const disabled = part.props.find((prop) => prop.semanticId === 'button.disabled');
        if (disabled) disabled.default = 'true';
      }),
    );
    expect(differs.failures).toEqual([
      'button.root props "button.disabled" default differs: angular CckButton false, react Button true',
    ]);
    const missing = compareApiDocs(
      changed('vue', (part) => {
        const disabled = part.props.find((prop) => prop.semanticId === 'button.disabled');
        if (disabled) delete disabled.default;
      }),
    );
    expect(missing.failures).toHaveLength(1);
  });

  it('compares a React controlled value without its default, and the others as before', () => {
    const value = (over: Partial<ApiMemberJson>): ApiMemberJson =>
      member({ name: 'value', semanticId: 'button.value', type: 'string', ...over });
    const docs = buttons();
    for (const doc of docs) {
      const react = doc.framework === 'react';
      doc.parts[0]?.props.push(value(react ? {} : { default: "''" }));
    }
    expect(compareApiDocs(docs).failures).toEqual([]);
    const differs = buttons();
    for (const doc of differs) {
      doc.parts[0]?.props.push(value({ default: doc.framework === 'vue' ? "'a'" : "''" }));
    }
    expect(compareApiDocs(differs).failures).toHaveLength(1);
  });

  it('fails on a required difference, also between two parts of one framework', () => {
    const { failures } = compareApiDocs(
      changed('angular', (part) => {
        const disabled = part.props.find((prop) => prop.semanticId === 'button.disabled');
        if (disabled) disabled.required = true;
      }),
    );
    expect(failures).toEqual([
      'button.root props "button.disabled" required differs: angular CckButton true, angular CckButtonAnchor false',
    ]);
  });

  it('reports a type difference without failing', () => {
    const { failures, reports } = compareApiDocs(
      changed('vue', (part) => {
        const disabled = part.props.find((prop) => prop.semanticId === 'button.disabled');
        if (disabled) disabled.type = 'boolean | undefined';
      }),
    );
    expect(failures).toEqual([]);
    expect(reports.join('\n')).toContain('type differs: angular boolean; react boolean; vue boolean | undefined');
  });

  it('fails on a part that exists in some frameworks only', () => {
    const docs = buttons().map((doc) => ({ ...doc, parts: doc.framework === 'react' ? [] : doc.parts }));
    expect(compareApiDocs(docs).failures).toEqual(['button.root: the part exists in angular, vue only']);
  });

  it('fails on a member with an empty semantic id', () => {
    const docs = buttons();
    for (const doc of docs) doc.parts[0]?.props.push(member({ semanticId: '' }));
    expect(compareApiDocs(docs).failures).toEqual(['button.root props: a member has no semantic id']);
  });

  it('reports a component with a single framework instead of failing', () => {
    const result = compareApiDocs([fixture('angular')]);
    expect(result.failures).toEqual([]);
    expect(result.reports).toEqual(['button: only angular has an ApiDoc, nothing to compare']);
  });

  it('treats a member named __proto__ as data', () => {
    const docs = buttons();
    for (const doc of docs) doc.parts[0]?.props.push(member({ name: '__proto__', semanticId: '__proto__' }));
    expect(compareApiDocs(docs).failures).toEqual([]);
  });
});

describe('executor and readApiDocs', () => {
  let root = '';

  const write = (framework: string, name: string, text: string): void => {
    mkdirSync(join(root, framework), { recursive: true });
    writeFileSync(join(root, framework, name), text);
  };
  const writeAll = (docs: ApiDocJson[]): void => {
    for (const doc of docs) write(doc.framework, `${doc.component}.json`, JSON.stringify(doc));
  };
  const run = (): Promise<{ success: boolean }> =>
    executor({ apiDocsDirs: [...FRAMEWORKS] }, {
      root,
      projectName: undefined,
      projectsConfigurations: { projects: {} },
    } as never);

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'api-parity-'));
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    rmSync(root, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it('succeeds on the three Button shapes and fails on a one-sided prop', async () => {
    writeAll(buttons());
    expect((await run()).success).toBe(true);
    writeAll(changed('react', (part) => part.props.push(member({}))));
    expect((await run()).success).toBe(false);
  });

  it('fails on a missing folder', async () => {
    writeAll(buttons().filter((doc) => doc.framework !== 'vue'));
    expect((await run()).success).toBe(false);
  });

  it.each([
    ['invalid JSON', '{ not json'],
    ['a JSON array', '[]'],
    ['null', 'null'],
    ['an unknown framework', JSON.stringify({ component: 'b', framework: 'svelte', parts: [] })],
    ['parts that are not an array', JSON.stringify({ component: 'b', framework: 'vue', parts: {} })],
    [
      'a part with no member arrays',
      JSON.stringify({ component: 'b', framework: 'vue', parts: [{ semanticId: 'b.root' }] }),
    ],
  ])('reports %s as a problem, never a crash or a pass', (_name, text) => {
    write('vue', 'bad.json', text);
    const { docs, problems } = readApiDocs([join(root, 'vue')]);
    expect(docs).toEqual([]);
    expect(problems).toHaveLength(1);
  });

  it('fails on a member whose fields have the wrong type', () => {
    const doc = fixture('vue');
    (doc.parts[0]?.props[0] as unknown as Record<string, unknown>)['required'] = 'yes';
    write('vue', 'button.json', JSON.stringify(doc));
    expect(readApiDocs([join(root, 'vue')]).problems).toHaveLength(1);
  });

  it('fails on two files for one component and framework, and ignores files that are not JSON', () => {
    write('vue', 'a.json', JSON.stringify(fixture('vue')));
    write('vue', 'b.json', JSON.stringify(fixture('vue')));
    write('vue', 'notes.txt', 'ignored');
    const { docs, problems } = readApiDocs([join(root, 'vue')]);
    expect(docs).toHaveLength(1);
    expect(problems).toHaveLength(1);
  });

  it('fails on a file that is too large and on a link', () => {
    write('vue', 'big.json', JSON.stringify({ pad: 'x'.repeat(5_100_000) }));
    expect(readApiDocs([join(root, 'vue')]).problems[0]).toContain('too large');
    write('react', 'outside.json', JSON.stringify(fixture('react')));
    try {
      symlinkSync(join(root, 'react', 'outside.json'), join(root, 'react', 'link.json'));
    } catch {
      return; // the OS refuses links
    }
    const { docs, problems } = readApiDocs([join(root, 'react')]);
    expect(docs).toHaveLength(1);
    expect(problems.some((problem) => problem.includes('not a regular file'))).toBe(true);
  });

  it('refuses an input outside the workspace', async () => {
    const result = await executor({ apiDocsDirs: ['../outside'] }, {
      root,
      projectName: undefined,
      projectsConfigurations: { projects: {} },
    } as never);
    expect(result.success).toBe(false);
  });
});

describe('compareApiDocs on compound components', () => {
  const m = (name: string, semanticId: string, rest: Partial<ApiMemberJson> = {}): ApiMemberJson => ({
    name,
    semanticId,
    type: 'string',
    required: false,
    description: 'Text.',
    ...rest,
  });
  const part = (
    name: string,
    semanticId: string,
    props: ApiMemberJson[],
    rest: object = {},
  ): ApiDocJson['parts'][number] => ({
    name,
    semanticId,
    anatomyPart: semanticId.split('.')[1] ?? '',
    description: 'Text.',
    props,
    events: [],
    slots: [],
    methods: [],
    ...rest,
  });
  const doc = (framework: Framework, parts: ApiDocJson['parts']): ApiDocJson => ({
    component: 'tabs',
    framework,
    parts,
  });
  const react = (): ApiDocJson =>
    doc('react', [
      part('Tabs.Root', 'tabs.root', []),
      part('Tabs.List', 'tabs.list', [m('aria-label', 'tabs.list.aria-label')]),
      part('Tabs.Trigger', 'tabs.trigger', [
        m('value', 'tabs.trigger.value'),
        m('disabled', 'tabs.trigger.disabled', { type: 'boolean' }),
      ]),
      part('Tabs.Panel', 'tabs.panel', [m('value', 'tabs.panel.value')]),
    ]);
  const angular = (): ApiDocJson =>
    doc('angular', [
      part('CckTabs', 'tabs.root', [m('aria-label', 'tabs.list.aria-label')], { renders: ['list', 'trigger'] }),
      part(
        'CckTab',
        'tabs.panel',
        [m('value', 'tabs.panel.value'), m('disabled', 'tabs.trigger.disabled', { type: 'boolean' })],
        { section: { partName: 'trigger', slotName: 'header', inputName: 'header' } },
      ),
    ]);

  it('counts a rendered part and a section as present and compares their members with the Angular part that has them', () => {
    expect(compareApiDocs([angular(), react()]).failures).toEqual([]);
  });

  it('compares the slot a section feeds with the part the section stands for', () => {
    const header = (semanticId: string): ApiSlotJson => ({
      name: 'header',
      semanticId,
      type: 'content',
      required: false,
      description: 'The trigger label.',
    });
    const withHeader = (docOf: ApiDocJson, partName: string, semanticId: string): ApiDocJson => {
      const target = docOf.parts.find((candidate) => candidate.name === partName);
      if (target) target.slots = [header(semanticId)];
      return docOf;
    };
    const ok = compareApiDocs([
      withHeader(angular(), 'CckTab', 'tabs.header'),
      withHeader(react(), 'Tabs.Trigger', 'tabs.header'),
    ]);
    expect(ok.failures).toEqual([]);
    const misplaced = compareApiDocs([
      withHeader(angular(), 'CckTab', 'tabs.header'),
      withHeader(react(), 'Tabs.Panel', 'tabs.header'),
    ]);
    expect(misplaced.failures).toContain('tabs.panel slots "tabs.header" exists in react only, not in angular');
  });

  it('takes the value of a section for the key of the trigger too, and the default slot of a renderer for the list', () => {
    const content = (): ApiSlotJson => ({
      name: 'default',
      semanticId: 'tabs.default',
      type: 'content',
      required: false,
      description: 'The content.',
    });
    const rendersList = (docOf: ApiDocJson): ApiDocJson => {
      const root = docOf.parts.find((candidate) => candidate.name === 'CckTabs');
      if (root) root.renders = ['list'];
      return docOf;
    };
    const withContent = (docOf: ApiDocJson, partNames: string[]): ApiDocJson => {
      for (const target of docOf.parts) if (partNames.includes(target.name)) target.slots = [content()];
      return docOf;
    };
    expect(
      compareApiDocs([
        withContent(rendersList(angular()), ['CckTabs']),
        withContent(react(), ['Tabs.Root', 'Tabs.List']),
      ]).failures,
    ).toEqual([]);
    const noKey = react();
    const trigger = noKey.parts.find((candidate) => candidate.name === 'Tabs.Trigger');
    if (trigger) trigger.props = trigger.props.filter((prop) => prop.name !== 'value');
    expect(compareApiDocs([rendersList(angular()), noKey]).failures).toEqual([
      'tabs.trigger props "tabs.trigger.value" exists in angular only, not in react',
    ]);
  });

  it('fails on a member of a rendered part that Angular lacks, and on a part nothing covers', () => {
    const lacking = angular();
    const root = lacking.parts[0];
    if (root) root.props = [];
    expect(compareApiDocs([lacking, react()]).failures).toEqual([
      'tabs.list props "tabs.list.aria-label" exists in react only, not in angular',
    ]);
    const uncovered = angular();
    const first = uncovered.parts[0];
    if (first) first.renders = ['list'];
    const second = uncovered.parts[1];
    if (second) delete second.section;
    const failures = compareApiDocs([uncovered, react()]).failures;
    expect(failures).toContain('tabs.trigger: the part exists in react only');
  });

  it('fails when the scope fields of a slot differ', () => {
    const slot = (names: string[]) => ({
      ...m('preview', 'tabs.preview', { type: 'content' }),
      scope: names.map((name) => ({ name, type: 'string', description: 'Text.' })),
    });
    const withScope = (docOf: ApiDocJson, names: string[]): ApiDocJson => {
      const first = docOf.parts[0];
      if (first) first.slots = [slot(names)];
      return docOf;
    };
    const ok = compareApiDocs([withScope(angular(), ['selected']), withScope(react(), ['selected'])]);
    expect(ok.failures).toEqual([]);
    const bad = compareApiDocs([withScope(angular(), ['selected']), withScope(react(), ['chosen'])]);
    expect(bad.failures).toEqual(['tabs.root slots "tabs.preview" scope differs: angular selected; react chosen']);
  });
  it('skips a scope field tagged none, and still fails on one without the tag', () => {
    const slot = (fields: { name: string; semanticId?: 'none' }[]) => ({
      ...m('preview', 'tabs.preview', { type: 'content' }),
      scope: fields.map((field) => ({ type: 'string', description: 'Text.', ...field })),
    });
    const withScope = (docOf: ApiDocJson, fields: { name: string; semanticId?: 'none' }[]): ApiDocJson => {
      const first = docOf.parts[0];
      if (first) first.slots = [slot(fields)];
      return docOf;
    };
    const selected = { name: 'selected' };
    const open = { name: 'open', semanticId: 'none' as const };
    expect(compareApiDocs([withScope(angular(), [selected]), withScope(react(), [selected, open])]).failures).toEqual(
      [],
    );
    const untagged = { name: 'open' };
    expect(
      compareApiDocs([withScope(angular(), [selected]), withScope(react(), [selected, untagged])]).failures,
    ).toEqual(['tabs.root slots "tabs.preview" scope differs: angular selected; react open, selected']);
  });
});

describe('the change event of a model', () => {
  const dialog = (framework: Framework, names: { prop: string; event?: string; binding?: string }): ApiDocJson => ({
    component: 'dialog',
    framework,
    parts: [
      {
        name: 'Dialog',
        semanticId: 'dialog.root',
        description: 'Text.',
        props: [
          { name: names.prop, semanticId: 'dialog.open', type: 'boolean', required: false, description: 'Text.' },
        ],
        events:
          names.event === undefined
            ? []
            : [
                {
                  name: names.event,
                  semanticId: 'dialog.openChange',
                  type: '(open: boolean) => void',
                  required: false,
                  description: 'Text.',
                },
              ],
        slots: [],
        methods: [],
        ...(names.binding === undefined
          ? {}
          : { bindings: [{ semanticId: 'dialog.open', value: 'open', syntax: names.binding }] }),
      },
    ],
  });

  it('is the model output in Angular: React onOpenChange and Vue update:open pair with the open model', () => {
    const docs = [
      dialog('angular', { prop: 'open', binding: '[(open)]' }),
      dialog('react', { prop: 'open', event: 'onOpenChange' }),
      dialog('vue', { prop: 'open', event: 'update:open', binding: 'v-model:open' }),
    ];
    expect(compareApiDocs(docs).failures).toEqual([]);
  });

  it('still fails when a framework has neither the event nor a model for it', () => {
    const docs = [
      dialog('angular', { prop: 'open' }),
      dialog('react', { prop: 'open', event: 'onOpenChange' }),
      dialog('vue', { prop: 'open', event: 'update:open', binding: 'v-model:open' }),
    ];
    expect(compareApiDocs(docs).failures).toEqual([
      'dialog.root events "dialog.openChange" exists in react, vue only, not in angular',
    ]);
  });
});
