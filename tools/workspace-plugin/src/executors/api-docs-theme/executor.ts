import type { ExecutorContext } from '@nx/devkit';
import { runApiDocs } from '../api-docs-common/run';
import { expandOption } from '../options';
import { extractThemeApiDocs } from './extract';
import type { ApiDocsThemeSchema } from './schema';

/**
 * Writes `<component>.json` (`ApiDoc`, with `theme`, `exports` and `declaredIn`) for every base component the theme
 * package of one framework has a part for, into `dist/api-docs/theme-<theme>/<framework>`. The theme is the project
 * name without `theme-` and `-<framework>`. The base `ApiDoc` files must exist: the target runs after the base
 * package's `api-docs`.
 */
export default function apiDocsThemeExecutor(
  options: ApiDocsThemeSchema,
  context: ExecutorContext,
): Promise<{ success: boolean }> {
  const { framework } = options;
  const project = context.projectName ?? '';
  const theme = new RegExp(`^theme-(.+)-${framework}$`).exec(project)?.[1];
  if (theme === undefined) {
    console.error(`api-docs: the project "${project}" is not a theme-<theme>-${framework} package`);
    return Promise.resolve({ success: false });
  }
  const baseDir = expandOption(options.baseDir ?? '{workspaceRoot}/dist/api-docs/{framework}', context).replace(
    '{framework}',
    framework,
  );
  return runApiDocs(
    {
      outputDir: options.outputDir ?? `{workspaceRoot}/dist/api-docs/theme-${theme}/${framework}`,
      ...(options.tsConfig === undefined ? {} : { tsConfig: options.tsConfig }),
    },
    context,
    (root, projectRoot, tsConfig) => extractThemeApiDocs(framework, theme, baseDir, root, projectRoot, tsConfig),
  );
}
