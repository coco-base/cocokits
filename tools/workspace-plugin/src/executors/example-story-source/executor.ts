import fastGlob from 'fast-glob';
import path from 'path';

import { EXAMPLE_CONFIG_FOLDER, EXAMPLE_STORY_FILE_NAME } from './executor.config';
import { ExampleStorySourceExecutorSchema } from './schema';
import { generateFilesContent } from './utils/generate-content';
import { generateSourceFiles } from './utils/generate-source-files';
import { Logger } from '../../utils/logger';
import { runPrettier } from '../token-generator/utils/prettier';

export default async function runExecutor(options: ExampleStorySourceExecutorSchema) {
  console.log('1');

  const storySourceFiles = await fastGlob(`${options.rootDir}/**/${EXAMPLE_STORY_FILE_NAME}`);
  console.log('2');
  const targetFolders = storySourceFiles.map((file) => path.dirname(file));

  console.log('3');
  const generatedFiles = await Promise.all(
    targetFolders.map(async (folder) => {
      console.log('4');
      const fileNames = fastGlob.sync(['**/[^_]*', '!**/*.stories.ts', '!**/*.stories.tsx'], { cwd: folder });
      console.log('5');
      const filesPath = fileNames.map((file) => path.join(folder, file));

      const configFilePattern = `${EXAMPLE_CONFIG_FOLDER}/**/${path.basename(folder)}.config.ts`;
      console.log('6');
      const configFilePaths = await fastGlob(configFilePattern);
      console.log('7');

      if (configFilePaths.length !== 1) {
        throw new Error(`Config file not found or multi config has founded for this pattern: ${configFilePattern}`);
      }

      console.log('8');
      const configFilePath = configFilePaths[0];

      console.log('9');

      const source = await generateFilesContent(filesPath, configFilePath);
      console.log('10');
      const generatedFile = generateSourceFiles(folder, source);
      console.log('11');
      return generatedFile;
    })
  );

  runPrettier(...generatedFiles);
  Logger.header('Successfully generated example story source files');
  generatedFiles.forEach((file) => Logger.success(`- ${file}`));

  return {
    success: true,
  };
}
