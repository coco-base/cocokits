// @vitest-environment jsdom
import { cleanup } from '@testing-library/vue';
import { Comment, h, ref } from 'vue';
import { afterEach, describe, expect, it } from 'vitest';
import { Tag } from '../index';
import { mountView, pick } from './fixtures';

afterEach(cleanup);

describe('Tag as, asChild and the exposed element', () => {
  it('renders the tag given to as, with the class', () => {
    const { container } = mountView(() => h(Tag, { as: 'strong' }, () => 'Paid'));
    const root = pick(container, '.cck-tag');
    expect(root.tagName).toBe('STRONG');
    expect(root.textContent).toBe('Paid');
  });

  it('asChild merges the class and attributes onto the child and keeps its content', () => {
    const { container } = mountView(() =>
      h(Tag, { asChild: true, id: 't', class: 'mine' }, () => h('strong', { id: 'own' }, 'Paid')),
    );
    const root = pick(container, '.cck-tag');
    expect(root.tagName).toBe('STRONG');
    expect(root.id).toBe('own');
    expect(root.classList.contains('mine')).toBe(true);
    expect(root.textContent).toBe('Paid');
  });

  it('as="template" means asChild', () => {
    const { container } = mountView(() => h(Tag, { as: 'template' }, () => h('strong', 'Paid')));
    expect(pick(container, '.cck-tag').tagName).toBe('STRONG');
  });

  it('asChild keeps the child ref', () => {
    const child = ref<HTMLElement | null>(null);
    const { container } = mountView(() => h(Tag, { asChild: true }, () => h('strong', { ref: child }, 'Paid')));
    expect(child.value).toBe(pick(container, '.cck-tag'));
  });

  it('exposes the root element, also for asChild next to a comment', () => {
    const plain = ref<{ element: Element | null } | null>(null);
    const merged = ref<{ element: Element | null } | null>(null);
    const { container } = mountView(() => [
      h(Tag, { ref: plain, id: 'plain' }),
      h(Tag, { ref: merged, asChild: true, id: 'merged' }, () => [h(Comment, 'note'), h('strong')]),
    ]);
    expect(plain.value?.element).toBe(pick(container, '#plain'));
    expect(merged.value?.element).toBe(pick(container, '#merged'));
  });
});
