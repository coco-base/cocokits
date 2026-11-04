import type { SnippetTemplate } from './snippet';
import type { StoryValue } from './story';

/** A framework a story is printed for. */
export type StoryFramework = 'angular' | 'react' | 'vue';

/** The control an arg gets. */
export type StoryControl = 'select' | 'switch' | 'text' | 'number';

/** One arg of a story: a prop or a theme option of the playground, or an arg a custom story declares, with a control. */
export interface StoryArg {
  /** The neutral name, the same in every framework. */
  readonly name: string;
  /** `theme` args are shown in the "Theme" group of the controls. */
  readonly group: 'props' | 'theme';
  /** The control kind. */
  readonly control: StoryControl;
  /** The choices of a `select` control. A `switch` has none: its choices are `true` and `false`. */
  readonly values?: readonly (string | boolean)[];
  /** The value the story starts with; `null` when there is none. */
  readonly default: StoryValue | null;
  /** Whether the arg is read once on mount (a `default*` name), so a change remounts the story. */
  readonly initial: boolean;
  /** One sentence for the controls panel; `''` when the source has none. */
  readonly description: string;
}

/** One code file of a story. */
export interface StoryFile {
  /** The file name, for example `playground.ts`. */
  readonly name: string;
  /** The code without the `GENERATED` header. For a story with args, the inline output for the default args. */
  readonly code: string;
  /** The template that follows the args; set for a story with args (the playground, or a custom story that declares args). */
  readonly snippet?: SnippetTemplate;
}

/** The metadata of one compiled story, written as `<id>.json` next to its code. */
export interface StoryMeta {
  /** The component, for example `button`. */
  readonly component: string;
  /** The story id in kebab case, for example `icon-only`. */
  readonly id: string;
  /** The theme the story is printed for. */
  readonly theme: string;
  /** The framework the story is printed for. */
  readonly framework: StoryFramework;
  /** The position among the stories of the component and theme. */
  readonly order: number;
  /** The title. */
  readonly title: string;
  /** The description; `''` when there is none. */
  readonly description: string;
  /** The reserved height of the preview in pixels. */
  readonly height?: number;
  /**
   * The semantic ids of the component events the story can report (`checkbox.checkedChange`), sorted. Absent when it has
   * none; the Events panel of the docs page exists only when this is not empty.
   */
  readonly events?: readonly string[];
  /** The args of the story; empty unless it is the playground or a custom story that declares args. */
  readonly args: readonly StoryArg[];
  /** The code files. */
  readonly files: readonly StoryFile[];
}

/** One entry of a preview app's registry: the story module and its args. */
export interface StoryEntry<C> {
  /** Loads the story module's component. */
  readonly load: () => Promise<C>;
  /** The args of the story. */
  readonly args: readonly StoryArg[];
}

/** The generated registry of a preview app: theme, then component, then story id. */
export type StoryRegistry<C> = Readonly<
  Record<string, Readonly<Record<string, Readonly<Record<string, StoryEntry<C>>>>>>
>;
