import { spawnSync } from 'child_process';

import { BuildTypedocExecutorSchema } from './schema';

export default async function runExecutor(options: BuildTypedocExecutorSchema) {
  try {
    const command = `pnpm typedoc --options ${options.typeDocConfig} 2>&1`;
    const result = spawnSync(command, { encoding: 'utf-8', shell: true });

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
