import { resolve } from 'node:path';
import { readAngularTheme } from '../api-docs-angular/theme';
import { problemsError } from '../api-docs-common/run';
import { readBaseParts, themeDocsOf } from '../api-docs-common/theme';
import type { ApiDocJson } from '../api-docs-common/types';
import { readReactTheme } from '../api-docs-react/theme';
import { readVueTheme } from '../api-docs-vue/theme';

/**
 * The `ApiDoc` of every base component the theme package of a framework has a part for, from its TSDoc. The package is
 * flat (`src/index.ts`): each export is matched to the base part it owns, read from the base `ApiDoc` files in
 * `baseDir` ({@link readBaseParts}). Throws one error that lists every problem (an export with no owner, a missing
 * TSDoc) and writes nothing.
 *
 * @param theme - The theme name (`cocokits`).
 * @param baseDir - The absolute folder of the base `ApiDoc` files.
 */
export function extractThemeApiDocs(
  framework: 'angular' | 'react' | 'vue',
  theme: string,
  baseDir: string,
  root: string,
  projectRoot: string,
  tsConfig: string,
): ApiDocJson[] {
  const base = readBaseParts(resolve(root, baseDir));
  const problems: string[] = [];
  const read =
    framework === 'angular'
      ? readAngularTheme(root, projectRoot, tsConfig, base, problems)
      : framework === 'react'
        ? readReactTheme(projectRoot, tsConfig, base, problems)
        : readVueTheme(root, projectRoot, tsConfig, base, problems);
  const docs = themeDocsOf(read, theme, framework);
  if (problems.length > 0) throw problemsError(problems);
  return docs;
}
