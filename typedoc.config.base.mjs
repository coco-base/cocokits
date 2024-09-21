import { workspaceRoot } from '@nx/devkit';
import path from 'node:path';

/**
 * @param packagePath {string}
 * @return {Partial<import('typedoc').TypeDocOptions>}
 */
export function getTypedocBaseConfig(packagePath)  {
  return {
    entryPointStrategy: 'expand',
    excludeExternals: true,
    exclude: [
      "**/*.spec.ts",
      "**/node_modules/**"
    ],
    externalPattern: [
      "**/node_modules/**",
      "**/*.spec.ts"
    ],
    plugin: [
      'typedoc-plugin-markdown',
      'typedoc-plugin-merge-modules',
      path.join(
        path.relative(packagePath, workspaceRoot),
        'tools/typedoc-storybook-plugin/index.mjs'
      )
    ],
    mergeModulesMergeMode: 'module-category',
    textContentMappings: {
      'title.memberPage': '{name}',
    },
    readme: 'none',
    entryFileName: '_index',
    outputFileStrategy: 'modules',
    sanitizeComments: true,
    flattenOutputFiles: true,
    fileExtension: '.mdx',
    hideGroupHeadings: true,
    useHTMLEncodedBrackets: false,
    hidePageHeader: true,
    hideBreadcrumbs: true,
    hidePageTitle: true,
    expandObjects: true,
    expandParameters: true,

    indexFormat: 'htmlTable',
    parametersFormat: 'htmlTable',
    interfacePropertiesFormat: 'htmlTable',
    classPropertiesFormat: 'htmlTable',
    enumMembersFormat: 'htmlTable',
    typeDeclarationFormat: 'htmlTable',
    propertyMembersFormat: 'htmlTable',
    propertiesFormat: 'htmlTable',

    excludeNotDocumented: true,
    excludeNotDocumentedKinds: ["ConstructorSignature"],

    useCodeBlocks: true,
    disableSources: true,
    useHTMLAnchors: false, // Will add 'a' tag for each group
    tableColumnSettings: {
      hideSources: true,
    },
    theme: 'storybook-markdown-theme',
  }
}