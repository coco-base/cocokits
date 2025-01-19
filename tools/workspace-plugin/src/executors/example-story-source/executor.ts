import { PromiseExecutor } from '@nx/devkit';
import fastGlob from 'fast-glob';
import path from 'path';

import { CONFIG_FILENAME } from './executor.config';
import { ExampleStorySourceExecutorSchema } from './schema';
import { generateFilesContent } from './utils/generate-content';
import { generateSourceFiles } from './utils/generate-source-files';
import { Logger } from '../../utils/logger';
import { runPrettier } from '../token-generator/utils/prettier';

const runExecutor: PromiseExecutor<ExampleStorySourceExecutorSchema> = async (options) => {
  const storySourceFiles = await fastGlob(`${options.rootDir}/**/_story.config.ts`);
  const targetFolders = storySourceFiles.map((file) => path.dirname(file));

  const generatedFiles = await Promise.all(
    targetFolders.map(async (folder) => {
      const fileNames = fastGlob.sync('**/[^_]*', { cwd: folder });
      const filesPath = fileNames.map((file) => path.join(folder, file));
      const configFilePath = path.join(folder, CONFIG_FILENAME);

      const source = await generateFilesContent(filesPath, configFilePath);
      const generatedFile = generateSourceFiles(folder, source);
      return generatedFile;
    })
  );

  runPrettier(...generatedFiles);
  Logger.header('Successfully generated example story source files');
  generatedFiles.forEach((file) => Logger.success(`- ${file}`));

  return {
    success: true,
  };
};

export default runExecutor;
