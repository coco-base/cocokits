import * as fs from 'fs';
import path from 'path';

export async function generateHtml({ filePath }: { filePath: string }) {
  const htmlRaw = await fs.readFileSync(filePath, { encoding: 'utf-8' });

  const htmlEjs = htmlRaw
    // ANGULAR: replace cckArgs(). with ejs syntax
    .replace(/cckArgs\(\)\.(\w+)/g, "'<%=$1%>'")
    // REACT: replace cckArgs. with ejs syntax
    .replace(/cckArgs\.(\w+)/g, "'<%=$1%>'");

  return `{
    language: 'html',
    filename: '${path.basename(filePath)}',
    code: \`
${htmlEjs.replaceAll('`', '\\`')}\`
  },
  `;
}
