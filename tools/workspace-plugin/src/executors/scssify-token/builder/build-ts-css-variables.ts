import fs from 'fs';
import _ from 'lodash';
import path from 'path';

import { deepMerge } from '@cocokits/common-utils';

import {
  buildTsVariableMap,
  clearDir,
  sanitizeCSSVariableName,
  sanitizeTsStringVariableName,
  TS_CSS_VARIABLES_FOLDER_NAME,
} from './builder.util';
import { logEndParsing, logFileHasGenerated, logStartParsing } from './logger';
import { Logger } from '../../../utils/logger';
import { ScssifyTokenExecutorSchema } from '../schema';
import {
  CollectionName,
  CollectionWithModeName,
  CompilerResult,
  CSSVariableName,
  ModeName,
  TokenDefinitionMap,
  TransformedDesignTokenCollectionMap,
  TsStringVariableName,
  TsVariableMap,
  TsVariableNamesWithModeAndValueMap,
} from '../token.model';
import { recordForEach } from '../utils/record-for-each';
import { recordReduceDeepMerge } from '../utils/reduce-merge';

/**
 * Builds SCSS variables from the compiler result and save them.
 *
 * @param compilerResult The result from the CSS compiler.
 */
export function buildTsCssVariables(compilerResult: CompilerResult, options: ScssifyTokenExecutorSchema) {
  logStartParsing('Ts-CSS-Variables');

  const tsVariablesDir = path.join(options.outputDir, TS_CSS_VARIABLES_FOLDER_NAME);
  clearDir(tsVariablesDir);

  const collectionMap = getCollectionMap(compilerResult.transformedTokens);

  recordForEach(collectionMap, (collectionWithModeNames, collectionName) => {
    const variableNamesWithCollectionModeMap = getVariableNamePathsWithModesAndValueMap(
      collectionWithModeNames,
      compilerResult.transformedTokens,
      options.prefix
    );
    const tsVariablesContent = getTsVariablesContent(collectionWithModeNames, variableNamesWithCollectionModeMap);
    const content = getFileContent(tsVariablesContent, collectionName);
    const filePath = writeContentToFile(content, collectionName, tsVariablesDir);
    logFileHasGenerated(filePath);
  });

  const indexFilePath = generateIndexFile(collectionMap, tsVariablesDir);
  logFileHasGenerated(indexFilePath);

  logEndParsing('Ts-CSS-Variables');
}

function generateIndexFile(collectionMap: TokenDefinitionMap, tsVariablesDir: string) {
  let content = `
/* eslint-disable max-lines */

 /**
 * Do not edit directly
 * Generated by cocokits scssify-token executor on ${new Date()}
 */
 
  `;
  recordForEach(collectionMap, (_collectionWithModeNames, collectionName) => {
    content += `export * from './${collectionName}';`;
  });

  const indexFilePath = path.join(tsVariablesDir, `index.ts`);
  fs.writeFileSync(indexFilePath, content);

  return indexFilePath;
}

function getFileContent(scssVariables: string, collectionName: string) {
  return `
/* eslint-disable max-lines */

/**
 * Do not edit directly
 * Generated by cocokits scssify-token executor on ${new Date()}
 */

export const ${_.camelCase(collectionName)} = ${scssVariables};
`;
}

function getTsVariablesContent(
  collectionWithModeNames: CollectionWithModeName[],
  variableNamesWithModeAndValueMap: TsVariableNamesWithModeAndValueMap
): string {
  let tsVariablesMap: TsVariableMap = {};

  variableNamesWithModeAndValueMap.forEach(({ modes: modesNameSet, value }, tsStringVariableName) => {
    const tokenModes: string[] = Array.from(modesNameSet.values());
    const totalCollectionModes = collectionWithModeNames.length;

    if (tokenModes.length > 0 && tokenModes.length !== totalCollectionModes) {
      Logger.warning(
        `\n- WARNING: Skip scss variable: '${tsStringVariableName}' must be included in '${collectionWithModeNames.join(
          ', '
        )}' modes, but it's only included in '${tokenModes.join(',')}' mode.\n`
      );
      return;
    }

    const taNamePath = tsStringVariableName.split('.');
    const currentTsVariableMap = buildTsVariableMap(taNamePath, value);
    tsVariablesMap = deepMerge(tsVariablesMap, currentTsVariableMap);
  });

  return JSON.stringify(tsVariablesMap, null, 2);
}

function getCollectionMap(transformedTokens: TransformedDesignTokenCollectionMap): TokenDefinitionMap {
  const collectionMap = recordReduceDeepMerge(transformedTokens, (__, collectionWithModeName) => {
    const [collection] = collectionWithModeName.split('.');
    return { [collection]: [collectionWithModeName] };
  });

  return collectionMap;
}

function getVariableNamePathsWithModesAndValueMap(
  collectionWithModeNames: CollectionWithModeName[],
  transformedTokens: TransformedDesignTokenCollectionMap,
  prefix: string
): TsVariableNamesWithModeAndValueMap {
  const variableNamesPathsWithModeAndValue = new Map<TsStringVariableName, { modes: Set<ModeName>; value: string }>();

  collectionWithModeNames.forEach((collectionWithModeName) => {
    const tokens = transformedTokens[collectionWithModeName];

    tokens.forEach((token) => {
      const modeName: ModeName = collectionWithModeName.split('.')[1];
      const tsStringVariableName: TsStringVariableName = sanitizeTsStringVariableName(token.namePath);
      const cssVariableName: CSSVariableName = sanitizeCSSVariableName(token.namePath);

      const modesSet: Set<ModeName> = variableNamesPathsWithModeAndValue.has(tsStringVariableName)
        ? variableNamesPathsWithModeAndValue.get(tsStringVariableName).modes
        : new Set();

      modesSet.add(modeName);

      variableNamesPathsWithModeAndValue.set(tsStringVariableName, {
        modes: modesSet,
        value: `var(--${prefix}${cssVariableName})`,
      });
    });
  });

  return variableNamesPathsWithModeAndValue;
}

function writeContentToFile(content: string, collectionName: CollectionName, tsVariablesDir: string) {
  const filePath = path.join(tsVariablesDir, `${collectionName}.ts`);
  fs.mkdirSync(tsVariablesDir, { recursive: true });
  fs.writeFileSync(filePath, content);

  return filePath;
}
