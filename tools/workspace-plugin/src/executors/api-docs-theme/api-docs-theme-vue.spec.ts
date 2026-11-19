import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { REPO, scratchArea } from '../api-docs-common/testing/scratch';
import type { ApiDocJson } from '../api-docs-common/types';
import { baseDocFiles, type FixturePart } from './testing/base-docs';
import { extractThemeApiDocs } from './extract';

const area = scratchArea('api-docs-theme-vue');

const TSCONFIG = {
  compilerOptions: { strict: true, types: [], noEmit: true, paths: { '@cocokits/vue/*': ['../base/*'] } },
  include: ['**/*.ts', '**/*.vue'],
};

const BASE: FixturePart[] = [
  { id: 'dialog.root' },
  { id: 'dialog.content' },
  { id: 'dialog.trigger' },
  { id: 'button.root' },
];

const BASE_DIALOG = `
/** Props of the dialog root. */
export interface DialogRootProps {
  /** Whether the dialog is open. */
  readonly open?: boolean;
}
/** Props of the dialog content. */
export interface DialogContentProps {
  /** The accessible label. */
  readonly label?: string;
}
export const DialogTrigger = {};
`;

const VUE = (
  props: string,
  imports = `import type { ${props} as BaseProps } from '@cocokits/vue/dialog';`,
): string => `<script setup lang="ts">
${imports}
import type { ${props} } from './dialog.types';

defineProps<${props}>();
</script>

<template>
  <div />
</template>
`;

const TYPES = `
import type { DialogContentProps as BaseDialogContentProps, DialogRootProps as BaseDialogRootProps } from '@cocokits/vue/dialog';

/** The size values. */
export type DialogSize = 'sm' | 'lg';

/**
 * Props of the themed root.
 *
 * @cckPart root
 */
export interface DialogRootProps extends BaseDialogRootProps {
  /** Width of the window. */
  readonly size?: DialogSize | null | undefined;
}

/**
 * Props of the themed content, which has no option of its own.
 *
 * @cckPart content
 */
export type DialogContentProps = BaseDialogContentProps;
`;

const INDEX = `
export { default as DialogRoot } from './DialogRoot.vue';
export { default as DialogContent } from './DialogContent.vue';
export { DialogTrigger } from '@cocokits/vue/dialog';
export type { DialogContentProps, DialogRootProps, DialogSize } from './dialog.types';
`;

const FILES: Record<string, string> = {
  '../base/dialog.ts': BASE_DIALOG,
  '../base/button.ts': 'export const Button = {};\n',
  'src/dialog.types.ts': TYPES,
  'src/DialogRoot.vue': VUE('DialogRootProps'),
  'src/DialogContent.vue': VUE('DialogContentProps'),
  'src/index.ts': INDEX,
};

function extract(name: string, files: Record<string, string> = {}): ApiDocJson[] {
  const { project, tsConfig } = area.create(name, { ...FILES, ...baseDocFiles(BASE), ...files }, TSCONFIG);
  return extractThemeApiDocs('vue', 'acme', join(project, '..', 'base'), REPO, project, tsConfig);
}

afterEach(() => {
  area.clean();
});

describe('extractThemeApiDocs, Vue', () => {
  it('writes one doc with the theme and the exports, a re-exported base part included', () => {
    const [doc, ...more] = extract('doc');
    expect(more).toEqual([]);
    expect(doc).toMatchObject({
      component: 'dialog',
      framework: 'vue',
      theme: 'acme',
      exports: ['DialogContent', 'DialogRoot', 'DialogTrigger'],
    });
    expect(doc?.parts.map((part) => part.name)).toEqual(['DialogContent', 'DialogRoot']);
  });

  it('reads the props type of a types file: the inherited base props are declaredIn base', () => {
    const root = extract('root')[0]?.parts.find((part) => part.name === 'DialogRoot');
    expect(root).toMatchObject({ semanticId: 'dialog.root' });
    expect(root?.props.map((prop) => [prop.name, prop.declaredIn]).sort()).toEqual([
      ['open', 'base'],
      ['size', 'theme'],
    ]);
  });

  it('keeps the content a part that declares no member itself', () => {
    const content = extract('content')[0]?.parts.find((part) => part.name === 'DialogContent');
    expect(content).toMatchObject({ semanticId: 'dialog.content' });
    expect(content?.props.every((prop) => prop.declaredIn === 'base')).toBe(true);
  });

  it.each([
    [
      'a file that imports no base component',
      { 'src/DialogContent.vue': VUE('DialogContentProps', '') },
      'DialogContent: its file imports 0 base components',
    ],
    [
      'a file that imports two base components',
      {
        'src/DialogContent.vue': VUE(
          'DialogContentProps',
          `import { Button } from '@cocokits/vue/button';\nimport type { DialogContentProps as Base } from '@cocokits/vue/dialog';`,
        ),
      },
      'DialogContent: its file imports 2 base components (button, dialog)',
    ],
    [
      'a part that the base component has no part for',
      { 'src/dialog.types.ts': TYPES.replace('@cckPart content', '@cckPart footer') },
      'DialogContent: no base part "dialog.footer" in the component "dialog"',
    ],
  ])('fails for %s, with the name of the export', (name, files, message) => {
    expect(() => extract(`fail-${name.replaceAll(' ', '-')}`, files)).toThrow(message);
  });
});
