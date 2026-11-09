import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { unrealTagProblems } from './jsdoc';
import { memberOf } from './member';
import { exampleProblems, sourceExamplesOf } from './source-examples';
import { scratchArea } from './testing/scratch';
import type { ApiDocJson, ApiMemberJson, ApiPartJson } from './types';

const WHOLE = '<Button @click="save">Save</Button>';
const area = scratchArea('source-examples');

const docWith = (examples: string[], framework: ApiDocJson['framework'] = 'vue'): ApiDocJson => {
  const part: ApiPartJson = {
    name: 'Button',
    semanticId: 'button.root',
    description: 'A button.',
    examples,
    props: [],
    events: [],
    slots: [],
    methods: [],
  };
  return { component: 'button', framework, parts: [part] };
};

afterEach(() => {
  area.clean();
});

describe('sourceExamplesOf', () => {
  it('reads every @example of the .ts, .tsx and .vue files of packages, without tests and .d.ts files', () => {
    const root = join(area.dir, 'root');
    const write = (path: string, text: string): void => {
      mkdirSync(join(root, path, '..'), { recursive: true });
      writeFileSync(join(root, path), text);
    };
    write(
      'packages/vue/a.types.ts',
      `/**\n * A.\n * @example\n * ${WHOLE}\n * @cckPart root\n */\nexport type A = 1;\n`,
    );
    write(
      'packages/vue/B.vue',
      '<script setup lang="ts">\n/**\n * @example\n * <B\n *   @click="b" />\n */\nconst b = 1;\n</script>\n',
    );
    write('packages/vue/a.spec.ts', '/**\n * @example\n * <Test @click="t" />\n */\n');
    write('packages/vue/a.d.ts', '/**\n * @example\n * <Dts @click="t" />\n */\n');
    write('packages/vue/node_modules/x/x.ts', '/**\n * @example\n * <Dep @click="t" />\n */\n');
    expect([...sourceExamplesOf(root)].sort()).toEqual(['<B @click="b" />', WHOLE]);
  });
});

describe('exampleProblems', () => {
  const known = new Set([WHOLE]);

  it('fails a cut example and an empty one, and names the item', () => {
    expect(exampleProblems(docWith(['<Button']), known)).toEqual([
      'vue/button Button: @example is not the whole source example: "<Button"',
    ]);
    expect(exampleProblems(docWith([''], 'angular'), known)).toEqual([
      'angular/button Button: @example is not the whole source example: ""',
    ]);
  });

  it('passes the whole source example, also with other white space', () => {
    expect(exampleProblems(docWith([WHOLE]), known)).toEqual([]);
    expect(exampleProblems(docWith(['<Button  @click="save">\n  Save</Button>']), known)).toEqual([]);
  });

  it('checks the examples of members, slots and symbols too', () => {
    const doc = docWith([WHOLE]);
    const member: ApiMemberJson = {
      name: 'size',
      semanticId: 'button.size',
      type: 'string',
      required: true,
      description: 'Size.',
    };
    doc.parts[0]?.props.push({ ...member, examples: ['<Button'] });
    doc.parts[0]?.slots.push({ ...member, name: 'default', examples: ['<Button'] });
    doc.symbols = [{ kind: 'constant', name: 'CONFIG', description: 'A.', examples: [''], props: [], methods: [] }];
    expect(exampleProblems(doc, known)).toHaveLength(3);
  });
});

describe('unrealTagProblems', () => {
  it('names a tag that is not a TSDoc tag: the text before it was cut', () => {
    expect(unrealTagProblems('vue/button Button', [{ name: 'click', comment: 'Save' }])).toEqual([
      'vue/button Button: "@click" is not a TSDoc tag; the text before it was cut',
    ]);
  });

  it('passes the standard tags and the cck tags', () => {
    const tags = [
      { name: 'example', comment: '' },
      { name: 'cckPart', comment: 'root' },
    ];
    expect(unrealTagProblems('x', tags)).toEqual([]);
  });

  it('fails the run of a member whose tags hold a tag that is not real', () => {
    const problems: string[] = [];
    const tags = [{ name: 'click', comment: '' }];
    memberOf('button', { name: 'size', type: 'string', required: true, description: 'Use', tags }, 'Button', problems);
    expect(problems).toContain('Button.size: "@click" is not a TSDoc tag; the text before it was cut');
  });
});
