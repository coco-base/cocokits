import { generateLayoutClassNameFromElement } from './class-names';
import { LayoutClassNamesConfig, ThemeConfig, UIBaseComponentProps } from '../model/theme-config.model';
import { validateUiBaseComponentProps } from '../ui-component-props/ui-component-props';

export const tableLayoutClassNamesConfig = {
  componentName: 'table',
  baseSelectorStructure: { block: 'table' },
  elements: {
    // Elements
    host: {
      name: 'Host Element',
      selectorStructure: [],
      description: 'It will add to the host element of `Table` component.',
    },
    table: {
      name: 'Table Element',
      selectorStructure: [{ element: 'table' }],
      description: 'It will add to the table tag of `Table` component.',
    },

    // GridLine Modifiers
    gridFull: {
      name: 'Table Element',
      selectorStructure: [{ modifier: 'grid-full' }],
      description: `It will add to the table element of \`Table\` component when gridLine set to full.`,
    },
    gridTable: {
      name: 'Table Element',
      selectorStructure: [{ modifier: 'grid-table' }],
      description: `It will add to the table element of \`Table\` component when gridLine set to table.`,
    },
    gridRows: {
      name: 'Table Element',
      selectorStructure: [{ modifier: 'grid-rows' }],
      description: `It will add to the table element of \`Table\` component when gridLine set to rows.`,
    },
    gridTableRows: {
      name: 'Table Element',
      selectorStructure: [{ modifier: 'grid-table-rows' }],
      description: `It will add to the table element of \`Table\` component when gridLine set to table-rows.`,
    },
    gridColumn: {
      name: 'Table Element',
      selectorStructure: [{ modifier: 'grid-column' }],
      description: `It will add to the table element of \`Table\` component when gridLine set to column.`,
    },
    gridTableColumn: {
      name: 'Table Element',
      selectorStructure: [{ modifier: 'grid-table-column' }],
      description: `It will add to the table element of \`Table\` component when gridLine set to table-column.`,
    },
    gridHeader: {
      name: 'Table Element',
      selectorStructure: [{ modifier: 'grid-header' }],
      description: `It will add to the table element of \`Table\` component when gridLine set to header.`,
    },

    // Other Modifiers
    withStripedRows: {
      name: 'Table Element',
      selectorStructure: [{ modifier: 'with-striped-rows' }],
      description: `It will add to the table element of \`Table\` component when stripedRows set to true.`,
    },
    withHoverEffect: {
      name: 'Table Element',
      selectorStructure: [{ modifier: 'with-hover-effect' }],
      description: `It will add to the table element of \`Table\` component when hoverEffect set to true.`,
    },
  },
} satisfies LayoutClassNamesConfig;

export function getTableClassNames(
  componentProps: UIBaseComponentProps,
  themeConfig: ThemeConfig
): Record<keyof typeof tableLayoutClassNamesConfig.elements, string> {
  validateUiBaseComponentProps(tableLayoutClassNamesConfig.componentName, componentProps, themeConfig);

  return {
    // Elements
    host: generateLayoutClassNameFromElement(tableLayoutClassNamesConfig, 'host', themeConfig, componentProps),
    table: generateLayoutClassNameFromElement(tableLayoutClassNamesConfig, 'table', themeConfig),

    // GridLine Modifiers
    gridFull: generateLayoutClassNameFromElement(tableLayoutClassNamesConfig, 'gridFull', themeConfig),
    gridTable: generateLayoutClassNameFromElement(tableLayoutClassNamesConfig, 'gridTable', themeConfig),
    gridRows: generateLayoutClassNameFromElement(tableLayoutClassNamesConfig, 'gridRows', themeConfig),
    gridTableRows: generateLayoutClassNameFromElement(tableLayoutClassNamesConfig, 'gridTableRows', themeConfig),
    gridColumn: generateLayoutClassNameFromElement(tableLayoutClassNamesConfig, 'gridColumn', themeConfig),
    gridTableColumn: generateLayoutClassNameFromElement(tableLayoutClassNamesConfig, 'gridTableColumn', themeConfig),
    gridHeader: generateLayoutClassNameFromElement(tableLayoutClassNamesConfig, 'gridHeader', themeConfig),

    // Other Modifiers
    withStripedRows: generateLayoutClassNameFromElement(tableLayoutClassNamesConfig, 'withStripedRows', themeConfig),
    withHoverEffect: generateLayoutClassNameFromElement(tableLayoutClassNamesConfig, 'withHoverEffect', themeConfig),
  };
}
