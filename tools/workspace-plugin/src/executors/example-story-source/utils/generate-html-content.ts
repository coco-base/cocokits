import * as fs from 'fs';
import path from 'path';

export async function generateHtml({ filePath }: { filePath: string }) {
  const htmlRaw = await fs.readFileSync(filePath, { encoding: 'utf-8' });

  const htmlEjs = htmlRaw
    // Angular: replace {{ cckExampleArgs(). }} with ejs syntax
    .replace(/{{\s*cckExampleArgs\(\)\.(\w+)\s*}}/g, '{{ <%=$1%> }}')
    // Angular: replace cckExampleArgs(). with ejs syntax
    .replace(/cckExampleArgs\(\)\.(\w+)/g, "'<%=$1%>'")
    // React: replace cckExampleArgs. with ejs syntax
    .replace(/cckExampleArgs\.(\w+)/g, "'<%=$1%>'");

  return `{
    language: 'html',
    filename: '${path.basename(filePath)}',
    code: \`
${htmlEjs.replaceAll('`', '\\`')}\`
  },
  `;
}
