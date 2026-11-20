// A Server Component module. Run with `node --conditions react-server --import ./register.mjs server-page.mjs <theme
// entry>`: React has no hooks or context there, so any client module that runs on the server fails at import.
import { Writable } from 'node:stream';
import { pathToFileURL } from 'node:url';
import { renderToPipeableStream } from 'react-server-dom-webpack/server';
import { jsx, jsxs } from 'react/jsx-runtime';
import { Select as BaseSelect } from '@cocokits/react/select';
import { TabNav as BaseTabNav } from '@cocokits/react/tab-nav';
import { Tabs as BaseTabs } from '@cocokits/react/tabs';

const { Select, Tabs, TabNav } = await import(pathToFileURL(process.argv[2]).href);

function page(Parts) {
  const { Select: S, Tabs: T, TabNav: N } = Parts;
  return jsxs('main', {
    children: [
      jsxs(S.Root, {
        children: [
          jsxs(S.Trigger, {
            'aria-label': 'Dish',
            children: [jsx(S.Value, { placeholder: 'Choose' }), jsx(S.Icon, {})],
          }),
          jsx(S.Content, {
            children: jsxs(S.Item, {
              value: 'Cake',
              children: [jsx(S.ItemIndicator, {}), jsx(S.ItemText, { children: 'Cake' })],
            }),
          }),
        ],
      }),
      jsxs(T.Root, {
        defaultValue: 'a',
        children: [
          jsxs(T.List, {
            'aria-label': 'Tabs',
            children: [jsx(T.Trigger, { value: 'a', children: 'A' }), jsx(T.Indicator, {})],
          }),
          jsx(T.Content, { value: 'a', children: 'Panel' }),
        ],
      }),
      jsxs(N.Root, {
        'aria-label': 'Nav',
        tabPanel: 'nav-panel',
        children: [
          jsxs(N.List, { children: [jsx(N.Link, { href: '#a', active: true, children: 'A' }), jsx(N.Indicator, {})] }),
          jsx(N.Panel, { id: 'nav-panel', children: 'Routed' }),
        ],
      }),
    ],
  });
}

// Every client reference becomes a module row of the Flight payload; the bundler map answers for any of them.
const bundlerMap = new Proxy({}, { get: (_target, key) => ({ id: String(key), chunks: [], name: '*' }) });

function flight(tree) {
  return new Promise((resolve, reject) => {
    let payload = '';
    const sink = new Writable({
      write(chunk, _encoding, done) {
        payload += chunk.toString();
        done();
      },
    });
    sink.on('finish', () => {
      resolve(payload);
    });
    const stream = renderToPipeableStream(tree, bundlerMap, { onError: reject });
    stream.pipe(sink);
  });
}

const result = {};
for (const [name, Parts] of [
  ['base', { Select: BaseSelect, Tabs: BaseTabs, TabNav: BaseTabNav }],
  ['theme', { Select, Tabs, TabNav }],
]) {
  const payload = await flight(page(Parts));
  result[name] = {
    moduleRows: payload.split(String.fromCharCode(10)).filter((line) => /^[0-9a-f]+:I\[/.test(line)).length,
  };
}
process.stdout.write(JSON.stringify(result));
