import { Application, Reflection, PageEvent } from 'typedoc';
import { capitalizeWords, generateAnchorId, removeEscapesMarkdownText } from './utils.mjs';
import path from 'node:path';
import { workspaceRoot } from '@nx/devkit';


const STORYBOOK_GROUP_NAME = 'Utils';

/**
 * @param app {Application}
 * @param event {PageEvent<Reflection>}
 */
export function getStorybookPageContent(app, event) {

  const {contents, storybookDocPageImportPath, tocItems, title} = getContentData(app, event);

  return `
[//]: # (Do not edit directly)
[//]: # (Generated by the Cocokits TypeDoc custom theme)

import { Meta } from '@storybook/addon-docs';
import { MdxPage } from '@cocokits/storybook-addon-theme';

export const tocItems = ${JSON.stringify(tocItems)};

<Meta title='${STORYBOOK_GROUP_NAME}/${title}'/>
<MdxPage breadcrumb='${STORYBOOK_GROUP_NAME}' title='${title}' tocItems={tocItems} hideThemeSwitcher={true}>
<div>
${contents}
</div>
</MdxPage>
`

}

/**
 * @param app {Application}
 * @param event {PageEvent<Reflection>}
 */
function getContentData(app, event) {

  const contents = event.contents
    .replace(/<table>/g, '<div className="arg-type-table-wrapper">\n<table className="arg-type-table arg-type-table--full-width">')
    .replace(/<\/table>/g, '</table>\n</div>')
    .replace(
      /<th>([\s\n\r]*(Description|description)[\s\n\r]*)<\/th>/gi,
      '<th className="description-column">Description</th>'
    )
    .replace(/^## (.+)$/gm, (_match, headingText) => {
      return `</div><div id="selection_${generateAnchorId(headingText)}">\n## ${headingText}`;
    });

  // const storybookDocPageImportPath = path.join(
  //   path.relative(app.options.getValue('out'), workspaceRoot),
  //   'packages/internal/storybook-addon-theme/src/lib/features/mdx-page/mdx-page'
  // ).replace(/\\/g, '/');



  const tocItems = contents
    .split('\n')
    .filter(line => line.startsWith('## '))
    .map(line => line.replace('## ', '').trim())
    .map(lineWithoutHeader => ({ id: 'selection_' + generateAnchorId(lineWithoutHeader), name: removeEscapesMarkdownText(lineWithoutHeader) }))
    
  const title = capitalizeWords(event.url.replaceAll('-', ' ')).split('.')[0];

  return {
    contents,
    // storybookDocPageImportPath,
    tocItems,
    title,
  }
}