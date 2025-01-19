import path from 'path';

import { generateGlobalScss } from './generate-global-scss-content';
import { generateHtml } from './generate-html-content';
import { generateScss } from './generate-scss-content';
import { generateTs } from './generate-ts-content';

const GENERATORS_FNS = {
  html: generateHtml,
  ts: generateTs,
  tsx: generateTs,
  scss: generateScss,
};

export async function generateFilesContent(filesPath: string[], configFilePath: string) {
  // Mock the global document object to import the ThemeId enum from '@cocokits/storybook-addon-theme'.
  // This package relies on the document object and isn't optimized for Node environments.
  // Without mocking, importing it directly causes errors like 'Cannot read property ... of undefined'.
  // By mocking the global document and loading ThemeId lazily, we avoid these issues.
  global.document = { body: null } as Document;
  const { ThemeId } = await import('@cocokits/storybook-addon-theme');

  try {
    let source = '';
    const publicFilesSource = await Promise.all<string>(
      filesPath.map(async (filePath) => {
        const ext = path.extname(filePath).replace('.', '');
        return (await GENERATORS_FNS[ext]?.({ filePath })) ?? '';
      })
    );

    source += publicFilesSource.join('');

    const { CSS_VARIABLES } = await import(configFilePath);
    source += generateGlobalScss({ ThemeId, CSS_VARIABLES });

    return source;
  } catch (error) {
    console.error('Error:', error);
  }
}
