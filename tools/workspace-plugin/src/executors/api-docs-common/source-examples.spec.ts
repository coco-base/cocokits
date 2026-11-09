import { mkdirSync, symlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { memberOf } from './member';
import { exampleProblems, sourceExamplesOf } from './source-examples';
import { scratchArea, withJunction } from './testing/scratch';
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

describe('sourceExamplesOf: the files it reads', () => {
  const rootOf = (name: string): string => {
    const root = join(area.dir, name);
    mkdirSync(join(root, 'packages'), { recursive: true });
    return root;
  };

  it('does not read a symbolic link to a file', () => {
    const root = rootOf('link-file');
    writeFileSync(
      join(area.dir, 'outside.ts'),
      ['/**', ' * @example', ' * <Outside @click="x" />', ' */'].join(String.fromCharCode(10)),
    );
    try {
      symlinkSync(join(area.dir, 'outside.ts'), join(root, 'packages', 'linked.ts'), 'file');
    } catch {
      return;
    }
    expect([...sourceExamplesOf(root)]).toEqual([]);
  });

  it('fails when a folder to read leaves the workspace through a link', async () => {
    const root = rootOf('link-folder');
    await withJunction(join(root, 'packages', 'out'), () => {
      expect(() => sourceExamplesOf(root, join(root, 'packages', 'out'))).toThrow(/outside the workspace/);
      return Promise.resolve();
    });
  });

  it('reads a text with many comment openers and no end at once', () => {
    const root = rootOf('openers');
    // Each opener is followed by a letter, so no `*/` forms where two repeats meet and none of them is closed.
    const text = '/**x'.repeat(60000);
    expect(text).not.toContain('*/');
    writeFileSync(join(root, 'packages', 'a.ts'), text);
    const started = Date.now();
    expect([...sourceExamplesOf(root)]).toEqual([]);
    expect(Date.now() - started).toBeLessThan(1000);
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
    expect(exampleProblems(docWith(['<Button\n  @click="save">Save</Button>']), known)).toEqual([]);
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

describe('the check of a line that starts like a tag', () => {
  it('fails the run of a member whose text has a line that starts with a word that is no tag', () => {
    const problems: string[] = [];
    const raw = { name: 'size', type: 'string', required: true, description: 'Use it.\n@exmaple <Thing />', tags: [] };
    memberOf('button', raw, 'Button', problems);
    expect(problems).toContain(
      'Button.size: a line starts with "@exmaple", which is no TSDoc tag; write it in backticks or fix the tag name',
    );
  });
});
