import { cssBuilder } from './css-builder';
import { ScssBuilderExecutorSchema } from './schema';
import { Logger } from '../../utils/logger';

export default async function runCssBuilderExecutor(options: ScssBuilderExecutorSchema) {
  try {
    if (!options.disableLog) {
      Logger.header('Style build has been started');
    }

    for (const { path, output, wrapWithWhereSudo } of options.files) {
      const builderResult = await cssBuilder(path, {
        outputStyle: 'expanded',
        sourceMap: false,
        outputPath: output,
        wrapWithWhereSudo,
      });

      Logger.success(`✔ [CREATED]: ${builderResult.cssPath}`);

      const builderMinResult = await cssBuilder(path, {
        outputStyle: 'compressed',
        sourceMap: false,
        outputPath: output,
        wrapWithWhereSudo,
      });

      Logger.success(`✔ [CREATED]: ${builderMinResult.cssPath}`);
    }

    if (!options.disableLog) {
      Logger.empty();
      Logger.header('Style build has been successfully completed');
    }
    return { success: true };
  } catch (e) {
    Logger.error(e);
    return { success: false };
  }
}
