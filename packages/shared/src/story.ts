/** A literal value of a story: a prop, a theme option or a sample. */
export type StoryValue = string | number | boolean;

/** A custom story: one `<id>.story.tsx` file with a default export of this shape. */
export interface StoryDefinition {
  /** The title shown above the story. */
  readonly title: string;
  /** One or two sentences on what the story shows. */
  readonly description: string;
  /** The reserved height of the preview in pixels; the page default when absent. */
  readonly height?: number;
  /**
   * The rules of the native container elements the story writes, so that a layout such as a clipped box is shown in
   * the copied code: one class per rule, layout properties only, with no colour or font (the theme owns them). The
   * compiler reads a string or a template literal with no substitution and prints it as Angular `styles`, a React
   * `.css` file or a Vue `<style scoped>`. The rules: `docs/style-guides/docs/story-language.md`.
   *
   * @example
   * styles: `.clip-box { overflow: hidden; width: 240px; height: 72px; }`
   */
  readonly styles?: string;
  /**
   * The story markup in the story language (a static TSX subset). The compiler reads the source and never
   * runs this function.
   */
  readonly render: () => unknown;
}

/** The kind of a literal as a type: `80` becomes `number`, `'a'` becomes `string`, `false` becomes `boolean`. */
type Widen<T> = T extends string ? string : T extends number ? number : T extends boolean ? boolean : T;

/**
 * The values of the list of an arg: their union when the list holds literals, `never` for no list (or a list of wide
 * `string`s, which is what a story without `argValues` is inferred as).
 */
type Listed<L> = L extends readonly string[] ? (string extends L[number] ? never : L[number]) : never;

/**
 * The parameter of the `render` of a story with args. An arg listed in `argValues` has the union of its list
 * (`'sm' | 'md' | 'lg'`), so it can be passed to the union prop of a component; any other arg has the widened kind of
 * its literal (`80` becomes `number`).
 *
 * @typeParam A - The `args` of the story, by name.
 * @typeParam V - The `argValues` of the story, by name.
 */
export type StoryArgsOf<
  A extends Readonly<Record<string, StoryValue>>,
  V extends { readonly [K in keyof A]?: readonly string[] },
> = {
  readonly [K in keyof A]: [Listed<V[K & keyof V]>] extends [never] ? Widen<A[K]> : Listed<V[K & keyof V]>;
};

/**
 * A custom story with args: the shape of `StoryDefinition` without its `render`, plus the args and the `render` that
 * takes them. The compiler reads `args` and `argValues` as object literals of literals.
 *
 * @typeParam A - The `args` of the story, by name: a string, number or boolean literal each, which is the default.
 * @typeParam V - The `argValues` of the story: the list of values of each string arg that gets a select control.
 */
export interface StoryWithArgs<
  A extends Readonly<Record<string, StoryValue>>,
  V extends { readonly [K in keyof A]?: readonly string[] },
> extends Omit<StoryDefinition, 'render'> {
  /**
   * The args of the story and their defaults. The control comes from the literal: a boolean gives a switch, a string a
   * text field and a number a number field. A name that starts with `default` and an upper-case letter is an initial
   * arg: a change remounts the story.
   */
  readonly args: A;
  /** The values of a string arg that gets a select control; the default of that arg is one of them. */
  readonly argValues?: V;
  /**
   * The story markup. Its only parameter is the destructured args (`({ maxLength }) => …`); the compiler reads the
   * source and never runs this function.
   */
  readonly render: (args: StoryArgsOf<A, V>) => unknown;
}

/**
 * Declares a custom story with args. The args keep their literal types, so the `render` parameter is typed from them.
 *
 * @param story - The story, with its `args` and optionally the `argValues` of its select args.
 * @returns The same object.
 */
export function defineStory<
  const A extends Readonly<Record<string, StoryValue>>,
  const V extends { readonly [K in keyof A]?: readonly string[] } = Partial<Record<keyof A, undefined>>,
>(story: StoryWithArgs<A, V>): StoryWithArgs<A, V>;
/**
 * Declares a custom story. It returns its argument; the story compiler reads the file, it does not run it.
 *
 * @param story - The story.
 * @returns The same object.
 */
export function defineStory(story: StoryDefinition): StoryDefinition;
export function defineStory<
  const A extends Readonly<Record<string, StoryValue>>,
  const V extends { readonly [K in keyof A]?: readonly string[] },
>(story: StoryDefinition | StoryWithArgs<A, V>): StoryDefinition | StoryWithArgs<A, V> {
  return story;
}

/**
 * Story markup in a config: a component, an element or a fragment of the story language. Only `sample.children`
 * takes it, and only a `stories.config.tsx` file can hold markup. The compiler reads it and never runs it.
 */
export type StoryMarkup = object;

/** The story config of a component (`stories.config.ts` or `stories.config.tsx`) or of one of its themes. */
export interface StoriesConfig {
  /**
   * The sample content, for the component only. `children` is the content: text, story markup (components and
   * elements, in a `.tsx` config) or `false` for a component that renders its own content (a Badge: no child is
   * generated; `true` is an error). Every other key is a prop or attribute that each generated instance gets.
   *
   * @example
   * // A Badge shows its `content` prop and takes no children.
   * defineStories({ sample: { content: 5, children: false } });
   */
  readonly sample?: Readonly<Record<string, StoryValue | StoryMarkup>>;
  /**
   * The reserved height in pixels of every generated story of the component (a positive whole number). A custom
   * story keeps the `height` of its own `defineStory`. Set it for an overlay, whose playground needs room in the frame.
   */
  readonly height?: number;
  /** The ids of stories to skip. `playground` cannot be skipped. */
  readonly skip?: readonly string[];
  /** The names of props and theme options that get no control. */
  readonly hideControls?: readonly string[];
  /** Ids that come first, in this order; the other stories follow in the default order. */
  readonly order?: readonly string[];
}

/**
 * Declares the story config of a component or theme. It returns its argument. The story compiler reads the
 * call, so it must be an object literal of literals. The only other value is story markup (JSX) in `sample.children`
 * of a `stories.config.tsx`.
 *
 * @param storiesConfig - The story config.
 * @returns The same object.
 */
export function defineStories(storiesConfig: StoriesConfig): StoriesConfig {
  return storiesConfig;
}
