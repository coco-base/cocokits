import fs from 'fs';
import path from 'path';

import { CSS_FOLDER_NAME } from './builder.config';
import { getDefaultFileHeader } from './utils';
import { TokenGeneratorExecutorSchema } from '../schema';
import runCssBuilderExecutor from '../../scss-builder/executor';
import { Logger } from '../../../utils/logger';

/**
 * Builds CSS variables from the compiler result and save them.
 */
export async function buildCss(options: TokenGeneratorExecutorSchema) {
  const cssDir = path.join(options.outputDir, CSS_FOLDER_NAME);

  // Generate header and @mixin for each modes
  const fileContent = `
    ${getDefaultFileHeader()}
    @use "../core" as cck-tokens;

    @include cck-tokens.use_all;
  `;

  // Save files
  const filePath = path.join(cssDir, 'tokens.scss');
  fs.mkdirSync(cssDir, { recursive: true });
  fs.writeFileSync(filePath, fileContent);
  Logger.success(`✔ [CREATED]: ${filePath}`);

  await runCssBuilderExecutor({
    files: [
      {
        path: filePath,
        output: cssDir,
      },
    ],
    disableLog: true,
  });
}
