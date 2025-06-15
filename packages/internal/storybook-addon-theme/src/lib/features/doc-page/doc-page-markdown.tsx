// import { HighlighterGeneric } from '@shikijs/core/types';
// import { fromHighlighter } from '@shikijs/markdown-it';
// import MarkdownIt from 'markdown-it';
// import { getSingletonHighlighterCore } from 'shiki/core';
// import shikiJavascript from 'shiki/langs/javascript.mjs';
// import shikiShell from 'shiki/langs/shell.mjs';
// import shikiTypescript from 'shiki/langs/typescript.mjs';
// import shikiHTML from 'shiki/langs/html.mjs';
// import shikiLightPlus from'shiki/themes/light-plus.mjs';
// import shikiMaterialThemeOcean from'shiki/themes/material-theme-ocean.mjs';
// import shikiWasm from 'shiki/wasm';
import { Markdown } from '@storybook/blocks';
import { ReactNode, useLayoutEffect,useRef } from 'react';

interface DocPageMarkdownProps {
  children: ReactNode;
}

// TODO: The custom highlighter is not working on dark mode. fix it and replace the default one with our custom one
export const DocPageMarkdown = ({ children }: DocPageMarkdownProps) => {
  const contentRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    // Ensure the content is rendered after the component mounts
    if (contentRef.current) {
      contentRef.current.querySelectorAll('table').forEach((table) => {
        table.classList.add('arg-type-table', 'arg-type-table--full-width');
      });
    }
  }, [children]);
  // const [html, setHtml] = useState('');

  // useEffect(() => {
  //   async function renderMarkdown() {
  //     const highlighter = await getSingletonHighlighterCore({
  //       themes: [ shikiLightPlus, shikiMaterialThemeOcean],
  //       langs: [shikiJavascript, shikiTypescript, shikiShell, ],
  //       loadWasm: shikiWasm
  //     }) as unknown as HighlighterGeneric<any, any>;

  //     const md = new MarkdownIt();
  //     md.use(fromHighlighter(highlighter, {
  //       themes: {
  //         light: 'light-plus',
  //         dark: 'material-theme-ocean'
  //       }
  //     }));

  //     const result = md.render(String(children));
  //     setHtml(result);
  //   }

  //   renderMarkdown().then();
  // }, [children]);

  // return (
  //   <div dangerouslySetInnerHTML={{ __html: html }}/>
  // );

  return (
    <div ref={contentRef} className="theme-addon-mdx-page">
      <Markdown>{children as string}</Markdown>
    </div>
  );
};
