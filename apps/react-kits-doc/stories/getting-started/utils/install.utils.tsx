import { ThemeChangeEvent } from '@cocokits/storybook-addon-theme';

import { backtick, code } from './markdown.util';

export const tocItems = [
  { id: 'step-1-install-packages', name: 'Step 1' },
  { id: 'step-2-provide-theme-configuration', name: 'Step 2' },
  { id: 'step-3-add-component-styles', name: 'Step 3' },
  { id: 'step-4-apply-theme-modes', name: 'Step 4' },
  { id: 'step-5-basic-usage-of-components', name: 'Step 5' },
  { id: 'step-6-use-tokens-in-your-component-styles', name: 'Step 6' },
];

export function getStep4IndexHtmlCssSelector(theme: ThemeChangeEvent) {
  const selectors = Object.entries(theme.selectedModes)
    .map(([collection, mode]) => `cck-theme-${theme.id}__${collection}--${mode}`)
    .join(' ');

  const html = `html
<html class="${selectors}">
...
</html>
  `;

  return code(html);
}

export function getStep4IndexHtmlAttrSelector(theme: ThemeChangeEvent) {
  const selectors = Object.entries(theme.selectedModes)
    .map(([collection, mode]) => `${theme.id}__${collection}--${mode}`)
    .join(' ');

  const html = `html
<html data-cck-theme="${selectors}">
...
</html>
  `;

  return code(html);
}

export function getStep4IndexHtmlSelectorExample(theme: ThemeChangeEvent) {
  const collection = theme.id === 'frames-x' ? 'sizing' : 'brand-color-1';
  const firstMode = theme.selectedModes[collection];

  return `
For example, to set the ${backtick(firstMode)} mode from ${backtick(collection)}:
  - **Collection Name:** ${backtick(collection)}
  - **Mode Name:** ${backtick(firstMode)}
  - **CSS Class:** ${backtick(`cck-theme-${theme.id}__${collection}--${firstMode}`)}
    `;
}

export function getStep4CollectionModesTable(theme: ThemeChangeEvent) {
  const table = (
    <table className="collection-modes-selector-table">
      <tbody>
        <tr>
          <th>Collection Name</th>
          <th>Mode Names</th>
          <th>Selectors</th>
        </tr>

        {Object.entries(theme.tokenDictionary.collectionModeNames).map(([collection, modes]) =>
          modes.map((mode, index) => (
            <tr key={`${collection}-${mode.name}`}>
              {index === 0 && (
                <td rowSpan={modes.length} className="collection-modes-selector-table__header-cell">
                  {collection}
                </td>
              )}
              <td>{mode.name}</td>
              <td>
                <ul>
                  <li>
                    <code>
                      .cck-theme-{theme.id}__{collection}--{mode.name}
                    </code>
                  </li>
                  <li>
                    <code>
                      [data-cck-theme*='{theme.id}__{collection}--{mode.name}']
                    </code>
                  </li>
                </ul>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );

  return table;
}
