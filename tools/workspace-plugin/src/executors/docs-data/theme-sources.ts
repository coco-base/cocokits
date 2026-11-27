import { existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

/** The frameworks a theme wraps; each has a sibling folder of the theme core (`<theme>/<framework>/src`). */
const FRAMEWORKS = ['angular', 'react', 'vue'] as const;

type Framework = (typeof FRAMEWORKS)[number];

/** The source file of each theme component of one theme, per framework: workspace-relative, `/`-separated paths. */
export type ThemeSourceFiles = Record<string, Partial<Record<Framework, string>>>;

const pascal = (name: string): string =>
  name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

/**
 * The file names a theme wrapper of `componentName` can have, most specific first (a compound component wraps its
 * root; one whose root is not themed exports the themed namespace from `<name>.ts` or wraps `<Name>Content.vue`).
 */
const CANDIDATES: Record<Framework, (componentName: string) => string[]> = {
  angular: (componentName) => [`${componentName}-theme.ts`],
  react: (componentName) => [`${componentName}.tsx`, `${componentName}-root.tsx`, `${componentName}.ts`],
  vue: (componentName) => [
    `${pascal(componentName)}.vue`,
    `${pascal(componentName)}Root.vue`,
    `${pascal(componentName)}Content.vue`,
  ],
};

/**
 * The source file of every theme component per framework, found in the framework folders next to the theme core.
 * A component the theme does not wrap in a framework (for example Avatar in frames-x) has no entry for it.
 *
 * @param root - The workspace root.
 * @param projectRoot - The absolute folder of the theme core package.
 * @param componentNames - The names of the components of the theme config.
 */
export function themeSourceFiles(root: string, projectRoot: string, componentNames: string[]): ThemeSourceFiles {
  const sources: ThemeSourceFiles = {};
  for (const componentName of componentNames) {
    const found: Partial<Record<Framework, string>> = {};
    for (const framework of FRAMEWORKS) {
      const folder = join(projectRoot, '..', framework, 'src');
      const file = CANDIDATES[framework](componentName)
        .map((name) => join(folder, name))
        .find((path) => existsSync(path));
      if (file !== undefined) found[framework] = relative(root, file).split(sep).join('/');
    }
    if (Object.keys(found).length > 0) sources[componentName] = found;
  }
  return sources;
}
