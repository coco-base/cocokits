import * as fs from 'fs';
import path from 'path';

export async function generateTs({ filePath }: { filePath: string }) {
  const tsRaw = await fs.readFileSync(filePath, { encoding: 'utf-8' });

  const tsEjs = tsRaw

    // React: <SvgIcon size={props.cckExampleArgs.volumeIconSize} /> -> <SvgIcon size='<%= volumeIconSize %>'/>
    .replace(/=\s*{props\.cckExampleArgs\.(\w+)}/g, "='<%= $1 %>'")

    // React: <span>{props.cckExampleArgs.name}</span> -> <span><%= name %></span>
    .replace(/{props\.cckExampleArgs\.(\w+)}/g, '<%= $1 %>')

    // React: function Component(props: {cckExampleArgs: ExampleArgs}) -> function Component()
    .replace(/props: {cckExampleArgs: ExampleArgs}/g, '')

    // Angular: Any line that includes 'ExampleArgs'. For example:
    // public cckExampleArgs = input.required<ExampleArgs>();
    // import { ExampleArgs } from './_story.config';
    .split('\n')
    .filter((line) => !line.includes('ExampleArgs'))
    .join('\n');

  const language = path.extname(filePath) === '.tsx' ? 'tsx' : 'angular-ts';

  return `{
    language: '${language}',
    filename: '${path.basename(filePath)}',
    code: \`
${tsEjs.replaceAll('`', '\\`')}\`
  },
  `;
}
