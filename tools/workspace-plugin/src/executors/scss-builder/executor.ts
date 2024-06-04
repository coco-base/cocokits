import { cleanOutputPath } from './clean';
import { cssBuilder } from './css-builder';
import { ScssBuilderExecutorSchema } from './schema';
import { Logger } from '../../utils/logger';

export default async function runExecutor(options: ScssBuilderExecutorSchema) {
  try {
    let generatedFileCounter = 1;
    Logger.header('Style build has been started');

    cleanOutputPath(options.outputPath);

    Logger.divider('CSS');
    for (const path of options.css) {
      const output = await cssBuilder(path, {
        outputStyle: 'expanded',
        sourceMap: options.sourceMap,
        outputPath: options.outputPath,
      });

      Logger.success(`✔ ${generatedFileCounter++}- [CREATED]: ${output.cssPath}`);

      if (output.sourceMapPath) {
        Logger.success(`✔ ${generatedFileCounter++}- [CREATED]: ${output.sourceMapPath}`);
      }
    }
    Logger.empty();

    Logger.divider('MINIFY');
    for (const path of options.min) {
      const output = await cssBuilder(path, {
        outputStyle: 'compressed',
        sourceMap: options.sourceMap,
        outputPath: options.outputPath,
      });

      Logger.success(`✔ ${generatedFileCounter++}- [CREATED]: ${output.cssPath}`);

      if (output.sourceMapPath) {
        Logger.success(`✔ ${generatedFileCounter++}- [CREATED]: ${output.sourceMapPath}`);
      }
    }

    Logger.header('Style build has been successfully completed');
    return { success: true };
  } catch (e) {
    Logger.error(e);
    return { success: false };
  }
}
