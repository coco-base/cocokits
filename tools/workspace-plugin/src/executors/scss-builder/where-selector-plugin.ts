/* eslint-disable max-statements */
import { PluginCreator } from 'postcss';
import selectorParser from 'postcss-selector-parser';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface PluginOptions {
  // Add options here if needed (e.g., exclude patterns)
}

export const whereSelectorPlugin: PluginCreator<PluginOptions> = () => {
  return {
    postcssPlugin: 'where-selector',
    Rule(rule) {
      // Skip @rules and existing :where()
      if (rule.parent?.type === 'atrule' || rule.selector.includes(':where(')) {
        return;
      }

      rule.selector = selectorParser((selectors) => {
        selectors.each((selector) => {
          // Skip if already wrapped
          if (selector.nodes.some((node) => node.type === 'pseudo' && node.value === ':where')) {
            return;
          }

          // Extract terminal pseudo-classes
          const terminalPseudos = [];

          // Find the last compound selector by getting the nodes after the last combinator
          const selectorNodes = selector.nodes;
          let lastCompoundNodes = [];

          // If there are no combinators, all nodes are in the only compound selector
          // Otherwise, get all nodes after the last combinator
          let lastCombinatorIndex = -1;
          for (let i = 0; i < selectorNodes.length; i++) {
            if (selectorNodes[i].type === 'combinator') {
              lastCombinatorIndex = i;
            }
          }

          if (lastCombinatorIndex >= 0) {
            lastCompoundNodes = selectorNodes.slice(lastCombinatorIndex + 1);
          } else {
            lastCompoundNodes = [...selectorNodes];
          }

          // Extract pseudo-classes from the last compound selector
          const pseudosToExtract = [];

          for (let i = 0; i < lastCompoundNodes.length; i++) {
            const node = lastCompoundNodes[i];
            if (node.type === 'pseudo' && !node.value.includes('::')) {
              pseudosToExtract.push(node);
            }
          }

          // Remove and store the terminal pseudos
          for (const pseudo of pseudosToExtract) {
            terminalPseudos.push(pseudo.clone());
            pseudo.remove();
          }

          // Create deep clone of the selector without terminal pseudos
          const selectorClone = selector.clone();

          // Create a :where() wrapper around the selector without pseudos
          const whereWrapper = selectorParser.pseudo({
            value: ':where',
            nodes: [selectorClone],
          });

          // Replace the original selector with the wrapper
          selector.nodes = [whereWrapper];

          // Append all the terminal pseudo-classes to the selector (outside the :where())
          for (const pseudo of terminalPseudos) {
            selector.append(pseudo);
          }
        });
      }).processSync(rule.selector);
    },
  };
};

whereSelectorPlugin.postcss = true;
