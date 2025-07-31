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

    // GridLine Modifiers
    gridFull: {
      name: 'Host Element',
      selectorStructure: [{ modifier: 'grid-full' }],
      description: `It will add to the host element of \`Table\` component when gridLine set to full.`,
    },
    gridTable: {
      name: 'Host Element',
      selectorStructure: [{ modifier: 'grid-table' }],
      description: `It will add to the host element of \`Table\` component when gridLine set to table.`,
    },
    gridRows: {
      name: 'Host Element',
      selectorStructure: [{ modifier: 'grid-rows' }],
      description: `It will add to the host element of \`Table\` component when gridLine set to rows.`,
    },
    gridTableRows: {
      name: 'Host Element',
      selectorStructure: [{ modifier: 'grid-table-rows' }],
      description: `It will add to the host element of \`Table\` component when gridLine set to table-rows.`,
    },
    gridColumn: {
      name: 'Host Element',
      selectorStructure: [{ modifier: 'grid-column' }],
      description: `It will add to the host element of \`Table\` component when gridLine set to column.`,
    },
    gridTableColumn: {
      name: 'Host Element',
      selectorStructure: [{ modifier: 'grid-table-column' }],
      description: `It will add to the host element of \`Table\` component when gridLine set to table-column.`,
    },
    gridHeader: {
      name: 'Host Element',
      selectorStructure: [{ modifier: 'grid-header' }],
      description: `It will add to the host element of \`Table\` component when gridLine set to header.`,
    },

    // Other Modifiers
    gridWithStripedRows: {
      name: 'Host Element',
      selectorStructure: [{ modifier: 'with-striped-rows' }],
      description: `It will add to the host element of \`Table\` component when stripedRows set to true.`,
    },
    gridWithHover: {
      name: 'Host Element',
      selectorStructure: [{ modifier: 'with-hover' }],
      description: `It will add to the host element of \`Table\` component when hover set to true.`,
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

    // GridLine Modifiers
    gridFull: generateLayoutClassNameFromElement(tableLayoutClassNamesConfig, 'gridFull', themeConfig),
    gridTable: generateLayoutClassNameFromElement(tableLayoutClassNamesConfig, 'gridTable', themeConfig),
    gridRows: generateLayoutClassNameFromElement(tableLayoutClassNamesConfig, 'gridRows', themeConfig),
    gridTableRows: generateLayoutClassNameFromElement(tableLayoutClassNamesConfig, 'gridTableRows', themeConfig),
    gridColumn: generateLayoutClassNameFromElement(tableLayoutClassNamesConfig, 'gridColumn', themeConfig),
    gridTableColumn: generateLayoutClassNameFromElement(tableLayoutClassNamesConfig, 'gridTableColumn', themeConfig),
    gridHeader: generateLayoutClassNameFromElement(tableLayoutClassNamesConfig, 'gridHeader', themeConfig),

    // Other Modifiers
    gridWithStripedRows: generateLayoutClassNameFromElement(
      tableLayoutClassNamesConfig,
      'gridWithStripedRows',
      themeConfig
    ),
    gridWithHover: generateLayoutClassNameFromElement(tableLayoutClassNamesConfig, 'gridWithHover', themeConfig),
  };
}
