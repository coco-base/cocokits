import { ScssifyTokenExecutorSchema } from '../schema';
import {
  CollectionWithModeName,
  CompilerResult,
  DesignToken,
  DesignTokenDependencyMap,
  ParserResult,
  TransformedDesignTokenCollectionMap,
} from '../token.model';
import { transformTokenValue } from '../transform/tranform';
import { recordReduceDeepMerge, reduceDeepMerge } from '../utils/reduce-merge';

/**
 * Compiles design tokens map from the parser result into a format suitable for generating CSS files.
 * This function also converts token values to CSS values and returns a dependency graph to analyze dependencies between token collections.
 */
export function compileDesignToken(parserResult: ParserResult, options: ScssifyTokenExecutorSchema): CompilerResult {
  const compilerResult: CompilerResult = recordReduceDeepMerge(
    parserResult.designTokenCollections,
    (tokens, collectionWithModeName) => {
      return transformTokens(tokens, collectionWithModeName, options);
    }
  );

  return compilerResult;
}

/**
 * Compiles a single design token from the parser result into a format suitable for generating CSS files.
 * This function also converts token values to CSS values and returns a dependency graph to analyze dependencies between token collections.
 */
function transformTokens(
  tokens: DesignToken[],
  collectionWithModeName: CollectionWithModeName,
  options: ScssifyTokenExecutorSchema
) {
  const initializeTransformant: CompilerResult = {
    transformedTokens: {},
    newDependencies: {},
  };

  return reduceDeepMerge(
    tokens,
    (token) => {
      const transformedValue = transformTokenValue(token, options);
      if (!transformedValue) {
        return null;
      }

      const transformedTokens: TransformedDesignTokenCollectionMap = {
        [collectionWithModeName]: [
          { ...token, value: transformedValue.value, isAlias: transformedValue.dependOn.length > 0 },
        ],
      };

      const newDependencies: DesignTokenDependencyMap =
        transformedValue.dependOn.length > 0
          ? { [collectionWithModeName]: [{ source: token.namePath, dependOn: transformedValue.dependOn }] }
          : {};

      return { transformedTokens, newDependencies };
    },
    initializeTransformant
  );
}
