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

          // Create deep clone of ENTIRE selector
          const selectorClone = selector.clone();

          // Wrap the complete selector in :where()
          const wrapped = selectorParser.pseudo({
            value: ':where',
            nodes: [selectorClone],
          });

          selector.replaceWith(wrapped);
        });
      }).processSync(rule.selector);
    },
  };
};

whereSelectorPlugin.postcss = true;
