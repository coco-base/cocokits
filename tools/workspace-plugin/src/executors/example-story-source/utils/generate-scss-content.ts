import * as fs from 'fs';
import path from 'path';

export async function generateScss({ filePath }: { filePath: string }) {
  const scssRaw = await fs.readFileSync(filePath, { encoding: 'utf-8' });

  return `{
    language: 'scss',
    filename: '${path.basename(filePath)}',
    code: \`
${scssRaw.replaceAll('`', '\\`')}\`
  },
  `;
}
