import type { ExecutorContext } from '@nx/devkit';
import { runApiDocs } from '../api-docs-common/run';
import type { ApiDocsSchema } from '../api-docs-common/schema';
import { extractVueApiDocs } from './extract';

/**
 * Writes `<component>.json` (`ApiDoc`) for every Vue entry point of the project into its own
 * `dist/api-docs/<project>` folder. The API comes from `vue-component-meta` and TSDoc only, and the target fails,
 * writing nothing, when a part or a public member has no TSDoc.
 */
export default function apiDocsVueExecutor(
  options: ApiDocsSchema,
  context: ExecutorContext,
): Promise<{ success: boolean }> {
  return runApiDocs(options, context, extractVueApiDocs);
}
