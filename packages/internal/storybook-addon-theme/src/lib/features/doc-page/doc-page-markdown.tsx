import { HighlighterGeneric } from '@shikijs/core/types';
import { fromHighlighter } from '@shikijs/markdown-it';
import MarkdownIt from 'markdown-it';
import  { ReactNode, useEffect, useState } from 'react';
import { getSingletonHighlighterCore } from 'shiki/core';
import shikiJavascript from 'shiki/langs/javascript.mjs';
import shikiShell from 'shiki/langs/shell.mjs';
import shikiTypescript from 'shiki/langs/typescript.mjs';
import shikiLightPlus from'shiki/themes/light-plus.mjs';
import shikiMaterialThemeOcean from'shiki/themes/material-theme-ocean.mjs';
import shikiWasm from 'shiki/wasm';


interface DocPageMarkdownProps {
  children: ReactNode;
}

// TODO: Check this component and make sure it's work's in light and dark mode 
export const DocPageMarkdown = ({children}: DocPageMarkdownProps) => {
  const [html, setHtml] = useState('');

  useEffect(() => {
    async function renderMarkdown() {
      const highlighter = await getSingletonHighlighterCore({
        themes: [ shikiLightPlus, shikiMaterialThemeOcean],
        langs: [shikiJavascript, shikiTypescript, shikiShell],
        loadWasm: shikiWasm
      }) as unknown as HighlighterGeneric<any, any>;

      const md = new MarkdownIt();
      md.use(fromHighlighter(highlighter, {
        themes: {
          light: 'light-plus',
          dark: 'material-theme-ocean'
        }
      }));

      const result = md.render(String(children));
      setHtml(result);
    }

    renderMarkdown().then();
  }, [children]);

  return (
    <div dangerouslySetInnerHTML={{ __html: html }}/>
  );
};
