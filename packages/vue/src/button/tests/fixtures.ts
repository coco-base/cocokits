import type { Component } from 'vue';
import { Button } from '../index';
import { defineThemeConfig, type ThemeConfig } from '@cocokits/shared';
import { linkForms as linkFormsOf } from '../../internal/tests/link-forms';

/** A small theme config with the three Button options of the cocokits theme. */
export const testThemeConfig: ThemeConfig = defineThemeConfig({
  name: 'test',
  components: {
    button: {
      variant: { attrName: 'variant', values: ['primary', 'ghost'], default: 'primary' },
      color: { attrName: 'cck-color', values: ['brand', 'danger'], default: 'brand' },
      size: { attrName: 'size', values: ['sm', 'md'], default: 'md' },
    },
  },
});

export { mountView, view } from '../../internal/tests/mount-helpers';

export { makeLink, type Extras, type Link } from '../../internal/tests/link-forms';

/** The four ways to render the Button as a link, each with the text "Go" and `href="#go"`. */
export const linkForms = (LinkStub: Component): ReturnType<typeof linkFormsOf> => linkFormsOf(LinkStub, Button);
