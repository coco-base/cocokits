import { cssBuilder } from './css-builder';
import { ScssBuilderExecutorSchema } from './schema';
import { Logger } from '../../utils/logger';

export default async function runExecutor(options: ScssBuilderExecutorSchema) {
  try {
    let generatedFileCounter = 1;
    Logger.header('Style build has been started');

    for (const { path, output } of options.files) {
      const builderResult = await cssBuilder(path, {
        outputStyle: 'expanded',
        sourceMap: false,
        outputPath: output,
      });
      Logger.success(`✔ ${generatedFileCounter++}- [CREATED]: ${builderResult.cssPath}`);

      const builderMinResult = await cssBuilder(path, {
        outputStyle: 'compressed',
        sourceMap: false,
        outputPath: output,
      });
      Logger.success(`✔ ${generatedFileCounter++}- [CREATED]: ${builderMinResult.cssPath}`);
    }
    Logger.empty();

    Logger.header('Style build has been successfully completed');
    return { success: true };
  } catch (e) {
    Logger.error(e);
    return { success: false };
  }
}
