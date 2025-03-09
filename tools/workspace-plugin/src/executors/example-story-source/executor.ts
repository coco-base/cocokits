import { PromiseExecutor } from '@nx/devkit';
import fastGlob from 'fast-glob';
import path from 'path';

import { EXAMPLE_CONFIG_FOLDER, EXAMPLE_STORY_FILE_NAME } from './executor.config';
import { ExampleStorySourceExecutorSchema } from './schema';
import { generateFilesContent } from './utils/generate-content';
import { generateSourceFiles } from './utils/generate-source-files';
import { Logger } from '../../utils/logger';
import { runPrettier } from '../token-generator/utils/prettier';

const runExecutor: PromiseExecutor<ExampleStorySourceExecutorSchema> = async (options) => {
  const storySourceFiles = await fastGlob(`${options.rootDir}/**/${EXAMPLE_STORY_FILE_NAME}`);
  const targetFolders = storySourceFiles.map((file) => path.dirname(file));

  const generatedFiles = await Promise.all(
    targetFolders.map(async (folder) => {
      const fileNames = fastGlob.sync(['**/[^_]*', '!**/*.stories.ts', '!**/*.stories.tsx'], { cwd: folder });
      const filesPath = fileNames.map((file) => path.join(folder, file));

      const configFilePattern = `${EXAMPLE_CONFIG_FOLDER}/**/${path.basename(folder)}.config.ts`;
      const configFilePaths = await fastGlob(configFilePattern);

      if (configFilePaths.length !== 1) {
        throw new Error(`Config file not found or multi config has founded for this pattern: ${configFilePattern}`);
      }

      const configFilePath = configFilePaths[0];

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
