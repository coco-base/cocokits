import { spawnSync } from 'child_process';
import fs from 'fs';
import path, { join } from 'path';

import { BuildTypedocExecutorSchema } from './schema';

export default async function runExecutor(options: BuildTypedocExecutorSchema) {
  try {
    const command = `pnpm typedoc --options ${options.typeDocConfig} 2>&1`;
    const result = spawnSync(command, { encoding: 'utf-8', shell: true });

    const typedocConfig = await import(options.typeDocConfig);
    const outputFolder = join(path.dirname(options.typeDocConfig), typedocConfig.default.out);

    const shouldRemovedFiles = [join(outputFolder, '_index.mdx')];

    shouldRemovedFiles.forEach((file) => {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    });

    if (result.stdout) {
      console.log(result.stdout);
      const hasError = result.stdout.toLowerCase().includes('[error] ');
      return { success: !hasError };
    }

    if (result.error) {
      console.error(result.error);
      return { success: false };
    }
  } catch (e) {
    console.error(e.message);
    return { success: false };
  }

  return {
    success: true,
  };
}
