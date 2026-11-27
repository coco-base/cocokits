import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import type { ApiDocJson } from '../api-docs-common/types';
import { extractAngularApiDocs } from './extract';
import { REPO, scratchArea } from '../api-docs-common/testing/scratch';

const FIXTURES = resolve(import.meta.dirname, 'fixtures');
const area = scratchArea('api-docs-angular-trigger');

/** The `ApiDoc` of the fixture `trigger` (a root its trigger applies) with a change of its text. */
function extract(name: string, change: (text: string) => string = (text) => text): ApiDocJson[] {
  const { project, tsConfig } = area.create(
    name,
    {
      'thing/index.ts': change(readFileSync(join(FIXTURES, 'trigger.ts.txt'), 'utf8')),
      'thing/ng-package.json': JSON.stringify({ lib: { entryFile: 'index.ts' } }),
    },
    {
      compilerOptions: { experimentalDecorators: true, strict: true, types: [], noEmit: true, paths: {} },
      angularCompilerOptions: { strictTemplates: true },
      include: ['**/*.ts'],
    },
  );
  return extractAngularApiDocs(REPO, project, tsConfig);
}

afterEach(() => {
  area.clean();
});

describe('extractAngularApiDocs: a root its trigger applies and a template given to an input', () => {
  it('writes appliedBy on the root from the hostDirectives of the trigger', () => {
    const [root, trigger] = extract('applied')[0]?.parts ?? [];
    expect(root).toMatchObject({ name: 'Menu', semanticId: 'thing.root', appliedBy: 'trigger' });
    expect(root?.anatomyPart).toBeUndefined();
    expect(root?.props.map((prop) => prop.name)).toEqual(['open', 'disableClose']);
    expect(trigger?.appliedBy).toBeUndefined();
  });

  it('writes the input the template of the content is given to, and no template selector', () => {
    const content = extract('template-input')[0]?.parts.find((part) => part.name === 'MenuContent');
    expect(content?.templateInput).toEqual({ partName: 'trigger', inputName: 'menuTriggerFor' });
    expect(content?.templateSelector).toBeUndefined();
  });

  const INPUTS = "inputs: ['open', 'disableClose']";
  const OUTPUTS = "outputs: ['openChange', 'closed']";
  it.each([
    ['an input', 'input', INPUTS, "inputs: ['open']", '"disableClose" under its own name in its inputs'],
    [
      'the change of a model',
      'model',
      OUTPUTS,
      "outputs: ['closed']",
      '"openChange" under its own name in its outputs',
    ],
    ['an output', 'output', OUTPUTS, "outputs: ['openChange']", '"closed" under its own name in its outputs'],
    [
      'an input under another name',
      'alias',
      INPUTS,
      "inputs: ['open: menuOpen', 'disableClose']",
      '"open" under its own name in its inputs',
    ],
  ])('fails when the trigger does not expose %s of the root', (_case, id, from, to, problem) => {
    expect(() => extract(`hidden-${id}`, (text) => text.replace(from, to))).toThrow(
      `MenuTrigger: the host directive Menu must expose ${problem}`,
    );
  });

  it('writes no appliedBy for a host directive that is no part of the entry point', () => {
    const parts =
      extract('not-a-part', (text) =>
        text.replace('@cckPart root\n * @cckNoElement\n', '@internal\n').replace('export class Menu ', 'class Menu '),
      )[0]?.parts ?? [];
    expect(parts.map((part) => part.name)).toEqual(['MenuTrigger', 'MenuContent']);
    expect(parts.some((part) => part.appliedBy !== undefined)).toBe(false);
  });

  it.each([
    ['shape', '@cckTemplate input trigger', '"@cckTemplate input" needs the shape "@cckTemplate input <part> <input>"'],
    ['part', '@cckTemplate input list menuTriggerFor', 'names no part "list" with the input "menuTriggerFor"'],
    ['input', '@cckTemplate input trigger menuFor', 'names no part "trigger" with the input "menuFor"'],
  ])('fails on a tag that names no input of a part (%s)', (id, tag, problem) => {
    expect(() =>
      extract(`bad-${id}`, (text) => text.replace('@cckTemplate input trigger menuTriggerFor', tag)),
    ).toThrow(problem);
  });
});
