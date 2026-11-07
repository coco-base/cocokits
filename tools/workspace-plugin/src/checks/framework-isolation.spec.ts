import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ESLint, type Linter } from 'eslint';
import vueParser from 'vue-eslint-parser';
import { beforeAll, describe, expect, it } from 'vitest';

/**
 * The `cocokits/framework-isolation` rule (tools/eslint/isolation-rules.mjs), run through the real file groups of
 * `createIsolationConfig`. The sample texts name frameworks on purpose: they are the rule's own test data.
 */
const REPO = resolve(import.meta.dirname, '..', '..', '..', '..');

interface IsolationModule {
  createIsolationConfig: (options: { rootDir: string }) => Linter.Config[];
}
interface FileSizeModule {
  createFileSizeConfig: () => Linter.Config[];
}

let eslint: ESLint;

beforeAll(async () => {
  const load = async <T>(file: string): Promise<T> =>
    (await import(pathToFileURL(resolve(REPO, 'tools', 'eslint', file)).href)) as T;
  const { createIsolationConfig } = await load<IsolationModule>('isolation-rules.mjs');
  const { createFileSizeConfig } = await load<FileSizeModule>('file-size.mjs');
  eslint = new ESLint({
    cwd: REPO,
    overrideConfigFile: true,
    overrideConfig: [
      { files: ['**/*.vue'], languageOptions: { parser: vueParser } },
      // The plain-text parser that lets the rule read .scss and .md files.
      ...createFileSizeConfig().filter((config) => config.languageOptions),
      ...createIsolationConfig({ rootDir: REPO }),
    ],
  });
});

/** The words the rule reports for a text linted as the file at `path`. */
async function reported(path: string, text: string): Promise<string[]> {
  const [result] = await eslint.lintText(text, { filePath: resolve(REPO, path) });
  return (result?.messages ?? [])
    .filter((message) => message.ruleId === 'cocokits/framework-isolation')
    .map((message) => message.message.split(' ')[0] ?? '');
}

const ANGULAR = 'packages/angular/button/button.ts';
const REACT = 'packages/react/src/button/button.types.ts';
const VUE = 'packages/vue/src/button/Button.vue';
const VUE_TS = 'packages/vue/src/button/button.types.ts';
const FREE = 'packages/cdk/src/focus/focus-visible.ts';

describe('framework isolation rule', () => {
  it('flags the other two frameworks in an Angular file and allows its own words', async () => {
    expect(await reported(ANGULAR, '// React and Vue take the native `name`.\n')).toEqual(['React', 'Vue']);
    expect(await reported(ANGULAR, '// useState, onValueChange and update:open.\n')).toEqual([
      'useState',
      'onValueChange',
      'update:',
    ]);
    expect(await reported(ANGULAR, '// Angular Signal Forms, NgZone, ControlValueAccessor, forwardRef.\n')).toEqual([]);
  });

  it('flags Angular and Vue in a React file and allows its own words', async () => {
    expect(await reported(REACT, '// Angular puts the directive on the element; Vue uses `asChild`.\n')).toEqual([
      'Angular',
      'Vue',
      'asChild',
    ]);
    expect(await reported(REACT, '// Next.js, JSX, useState, forwardRef and onOpenChange.\n')).toEqual([]);
  });

  it('flags Angular and React in a Vue file, in the script and in the template', async () => {
    expect(await reported(VUE_TS, '// React calls onValueChange; Angular emits a TemplateRef.\n')).toEqual([
      'React',
      'onValueChange',
      'Angular',
      'TemplateRef',
    ]);
    const sfc =
      '<template>\n  <!-- React renders this -->\n  <slot />\n</template>\n<script setup lang="ts">\n</script>\n';
    expect(await reported(VUE, sfc)).toEqual(['React']);
  });

  it('allows the Vue words of Vue files, and useTemplateRef and useId', async () => {
    const own =
      '// v-model, modelValue, update:modelValue, defineProps, <script setup, asChild, useTemplateRef, useId.\n';
    expect(await reported(VUE_TS, own)).toEqual([]);
  });

  it('flags forwardRef in Vue and in the framework-free layers only', async () => {
    expect(await reported(VUE_TS, '// forwardRef\n')).toEqual(['forwardRef']);
    expect(await reported(FREE, '// forwardRef\n')).toEqual(['forwardRef']);
    expect(await reported(ANGULAR, '// forwardRef\n')).toEqual([]);
  });

  it('flags every framework in a framework-free file, in .ts, .scss and .md files', async () => {
    expect(await reported(FREE, '// Angular, React and Vue.\n')).toEqual(['Angular', 'React', 'Vue']);
    const scss = 'packages/themes/cocokits/core/src/styles/components/_popover.scss';
    expect(await reported(scss, '// a `sideOffset` on the React content overrides it.\n')).toEqual(['React']);
    expect(await reported('packages/machines/popover/README.md', 'The Vue content.\n')).toEqual(['Vue']);
    expect(await reported('packages/shared/src/note.md', 'Nothing named here.\n')).toEqual([]);
  });

  it('flags the packages of another framework, and every framework package in a free layer', async () => {
    expect(await reported(ANGULAR, "// import '@cocokits/react';\n")).toEqual(['@cocokits/react']);
    expect(await reported(REACT, "// import '@cocokits/theme-cocokits-vue';\n")).toEqual([
      '@cocokits/theme-cocokits-vue',
    ]);
    expect(await reported(VUE_TS, "// import '@cocokits/angular/button';\n")).toEqual(['@cocokits/angular']);
    expect(await reported(FREE, "// import '@cocokits/vue';\n")).toEqual(['@cocokits/vue']);
    expect(await reported(ANGULAR, "// import '@cocokits/angular/button', '@cocokits/cdk';\n")).toEqual([]);
  });

  it('allows the lowercase framework names, a parameter named update, the DOM slot and file extensions', async () => {
    const machines = 'packages/machines/popover/popover.meta.ts';
    expect(await reported(machines, "export const frameworks = ['react', 'vue'];\n")).toEqual([]);
    expect(await reported(FREE, '// floating.autoUpdate(el, { update: () => void }) and the <slot> element\n')).toEqual(
      [],
    );
    expect(await reported(FREE, '// files end in .ts, .tsx or .vue; *.test.tsx\n')).toEqual([]);
  });

  it('does not read tools, the root files or other packages than the groups', async () => {
    expect(await reported('tools/workspace-plugin/src/executors/x.ts', '// Angular, React and Vue.\n')).toEqual([]);
    expect(await reported('CONTRIBUTING.md', 'Angular, React and Vue.\n')).toEqual([]);
  });

  it('does not read a generated changelog', async () => {
    expect(await reported('packages/react/CHANGELOG.md', 'Angular and Vue.\n')).toEqual([]);
    expect(await reported('packages/cdk/CHANGELOG.md', 'Angular and Vue.\n')).toEqual([]);
  });

  it('reports the line and column with the owner in the message', async () => {
    const [result] = await eslint.lintText('const a = 1;\n// uses React here\n', { filePath: resolve(REPO, ANGULAR) });
    expect(result?.messages).toHaveLength(1);
    expect(result?.messages[0]).toMatchObject({ line: 2, column: 9, ruleId: 'cocokits/framework-isolation' });
    expect(result?.messages[0]?.message).toContain('React in an Angular file');
  });
});
