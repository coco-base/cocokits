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

/** The file names a theme wrapper of `component` can have, most specific first (a compound component wraps its root). */
const CANDIDATES: Record<Framework, (component: string) => string[]> = {
  angular: (component) => [`${component}-theme.ts`],
  react: (component) => [`${component}.tsx`, `${component}-root.tsx`],
  vue: (component) => [`${pascal(component)}.vue`, `${pascal(component)}Root.vue`],
};

/**
 * The source file of every theme component per framework, found in the framework folders next to the theme core.
 * A component the theme does not wrap in a framework (for example Avatar in frames-x) has no entry for it.
 *
 * @param root - The workspace root.
 * @param projectRoot - The absolute folder of the theme core package.
 * @param components - The component names of the theme config.
 */
export function themeSourceFiles(root: string, projectRoot: string, components: string[]): ThemeSourceFiles {
  const sources: ThemeSourceFiles = {};
  for (const component of components) {
    const found: Partial<Record<Framework, string>> = {};
    for (const framework of FRAMEWORKS) {
      const folder = join(projectRoot, '..', framework, 'src');
      const file = CANDIDATES[framework](component)
        .map((name) => join(folder, name))
        .find((path) => existsSync(path));
      if (file !== undefined) found[framework] = relative(root, file).split(sep).join('/');
    }
    if (Object.keys(found).length > 0) sources[component] = found;
  }
  return sources;
}
