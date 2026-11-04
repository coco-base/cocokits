import { describe, expect, expectTypeOf, it } from 'vitest';
import {
  defineStories,
  defineStory,
  type ApiDoc,
  type StoriesConfig,
  type StoryArgsOf,
  type StoryDefinition,
  type StoryEntry,
  type StoryMeta,
  type StoryRegistry,
} from '../src/index';

describe('defineStory and defineStories', () => {
  it('return their argument, so the compiler reads the source and nothing runs at build', () => {
    const story: StoryDefinition = { title: 'Icon only', description: 'Needs an accessible name.', render: () => null };
    const storiesConfig: StoriesConfig = { sample: { children: 'Save changes' }, skip: ['disabled'] };
    expect(defineStory(story)).toBe(story);
    expect(defineStories(storiesConfig)).toBe(storiesConfig);
  });
});

describe('defineStory with args', () => {
  it('returns its argument and keeps the literals of args and argValues narrow', () => {
    const story = defineStory({
      title: 'Count',
      description: 'A story with args.',
      args: { maxLength: 80, size: 'md', loud: false },
      argValues: { size: ['sm', 'md', 'lg'] },
      render: ({ maxLength, size, loud }) => {
        expectTypeOf(maxLength).toEqualTypeOf<number>();
        expectTypeOf(size).toEqualTypeOf<'sm' | 'md' | 'lg'>();
        expectTypeOf(loud).toEqualTypeOf<boolean>();
        return null;
      },
    });
    expect(story.args.maxLength).toBe(80);
    expect(story.argValues?.size).toEqual(['sm', 'md', 'lg']);
    expectTypeOf(story.render)
      .parameter(0)
      .toEqualTypeOf<
        StoryArgsOf<
          { readonly maxLength: 80; readonly size: 'md'; readonly loud: false },
          { readonly size: readonly ['sm', 'md', 'lg'] }
        >
      >();
  });

  it('types an arg without argValues as its widened kind, and leaves a story without args unchanged', () => {
    const plain = defineStory({ title: 'Plain', description: 'No args.', render: () => null });
    expect(plain.render()).toBeNull();
    expectTypeOf(plain).toEqualTypeOf<StoryDefinition>();
    const withArg = defineStory({
      title: 'Arg',
      description: 'One arg.',
      args: { label: 'Save' },
      render: ({ label }) => label,
    });
    expectTypeOf(withArg.render).parameter(0).toEqualTypeOf<{ readonly label: string }>();
  });
});

describe('story types', () => {
  it('describe a registry as theme, component and story id', () => {
    expectTypeOf<StoryRegistry<string>>().toEqualTypeOf<
      Readonly<Record<string, Readonly<Record<string, Readonly<Record<string, StoryEntry<string>>>>>>>
    >();
  });

  it('keep the frameworks closed and the lists read-only', () => {
    expectTypeOf<StoryMeta['framework']>().toEqualTypeOf<'angular' | 'react' | 'vue'>();
    expectTypeOf<ApiDoc['framework']>().toEqualTypeOf<'angular' | 'react' | 'vue' | 'ts'>();
    expectTypeOf<readonly string[]>().toExtend<NonNullable<StoriesConfig['skip']>>();
    expectTypeOf<string[]>().not.toEqualTypeOf<NonNullable<StoriesConfig['skip']>>();
  });
});

describe('StoryArgsOf', () => {
  it('widens a number, a boolean and a string arg of a story without argValues', () => {
    defineStory({
      title: 'Kinds',
      description: 'Args of each kind.',
      args: { count: 80, loud: true, label: 'Save' },
      render: ({ count, loud, label }) => {
        expectTypeOf(count).toEqualTypeOf<number>();
        expectTypeOf(loud).toEqualTypeOf<boolean>();
        expectTypeOf(label).toEqualTypeOf<string>();
        return null;
      },
    });
  });
});
