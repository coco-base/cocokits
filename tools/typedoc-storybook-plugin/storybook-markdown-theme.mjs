import { MarkdownTheme, MarkdownThemeContext } from 'typedoc-plugin-markdown';
import { wrapWithBacktick } from './utils.mjs';

export class StorybookMarkdownTheme extends MarkdownTheme {
  getRenderContext(page) {
    return new StorybookMarkdownThemeContext(this, page, this.application.options);
  }
}

class StorybookMarkdownThemeContext extends MarkdownThemeContext {

  /**
   *
   * @param theme {MarkdownTheme}
   * @param page {MarkdownPageEvent<import('typedoc').Reflection>}
   * @param options {import('typedoc').Options}
   */

  constructor(theme, page, options) {
    super(theme, page, options);

    this.partials = {
      ...this.partials,
      functionType: wrapWithBacktick(this.partials.functionType.bind(this)),
      arrayType: wrapWithBacktick(this.partials.arrayType.bind(this)),
      conditionalType: wrapWithBacktick(this.partials.conditionalType.bind(this)),
      indexAccessType: wrapWithBacktick(this.partials.indexAccessType.bind(this)),
      inferredType: wrapWithBacktick(this.partials.inferredType.bind(this)),
      intersectionType: wrapWithBacktick(this.partials.intersectionType.bind(this)),
      queryType: wrapWithBacktick(this.partials.queryType.bind(this)),
      referenceType: wrapWithBacktick(this.partials.referenceType.bind(this)),
      reflectionType: wrapWithBacktick(this.partials.reflectionType.bind(this)),
      typeOperatorType: wrapWithBacktick(this.partials.typeOperatorType.bind(this)),
      intrinsicType: wrapWithBacktick(this.partials.intrinsicType.bind(this)),
      tupleType: wrapWithBacktick(this.partials.tupleType.bind(this)),
      unionType: wrapWithBacktick(this.partials.unionType.bind(this)),
      unknownType: wrapWithBacktick(this.partials.unknownType.bind(this)),
      namedTupleType: wrapWithBacktick(this.partials.namedTupleType.bind(this)),
      someType: wrapWithBacktick(this.partials.someType.bind(this))
    };
  }
}
