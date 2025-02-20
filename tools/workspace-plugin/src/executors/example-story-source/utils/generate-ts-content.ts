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
    .replace(/props:\s*{\s*cckExampleArgs:\s.*ExampleArgs\s.*}/g, '')

    // Angular: import { ExampleArgs } from '@cocokits/common-kits-doc/...'; -> ''
    .replace(/import.*ExampleArgs.*@cocokits\/common-kits-doc.*/g, '')

    // Angular: public cckExampleArgs = input.required<ExampleArgs>(); -> ''
    .replace(/.*input.*ExampleArgs.*();/g, '')

    // Angular: replace {{ cckExampleArgs(). }} with ejs syntax
    .replace(/{{\s*cckExampleArgs\(\)\.(\w+)\s*}}/g, '{{ <%=$1%> }}')

    // Angular: replace cckExampleArgs(). with ejs syntax
    .replace(/cckExampleArgs\(\)\.(\w+)/g, "'<%=$1%>'")

    // React: replace cckExampleArgs. with ejs syntax
    .replace(/cckExampleArgs\.(\w+)/g, "'<%=$1%>'");

  const language = path.extname(filePath) === '.tsx' ? 'tsx' : 'angular-ts';

  return `{
    language: '${language}',
    filename: '${path.basename(filePath)}',
    code: \`
${tsEjs.replaceAll('`', '\\`')}\`
  },
  `;
}
