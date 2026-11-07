// @vitest-environment node
import { createSSRApp, h, type Component } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { describe, expect, it } from 'vitest';
import { Checkbox } from '../src/checkbox';
import { Input } from '../src/input';
import { Radio } from '../src/radio';
import { Switch } from '../src/switch';
import { Textarea } from '../src/textarea';

describe.each([
  ['Input', Input, ''],
  ['Textarea', Textarea, ''],
  ['Checkbox', Checkbox, false],
  ['Radio', Radio, false],
  ['Switch', Switch, false],
] as [string, Component, unknown][])('%s on the server with v-model.trim', (_name, component, modelValue) => {
  it('renders no modelModifiers attribute', async () => {
    const html = await renderToString(
      createSSRApp({ render: () => h(component, { modelValue, modelModifiers: { trim: true } }) }),
    );
    expect(html.toLowerCase()).not.toContain('modelmodifiers');
  });
});
