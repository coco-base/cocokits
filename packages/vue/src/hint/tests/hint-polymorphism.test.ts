// @vitest-environment jsdom
import { cleanup } from '@testing-library/vue';
import { Comment, h, ref } from 'vue';
import { afterEach, describe, expect, it } from 'vitest';
import { Hint } from '../index';
import { mountView, pick } from '../../internal/tests/mount-helpers';

afterEach(cleanup);

describe('Hint as, asChild and the exposed element', () => {
  it('renders the tag given to as, with the class', () => {
    const { container } = mountView(() => h(Hint, { as: 'p' }, () => 'Help'));
    const root = pick(container, '.cck-hint');
    expect(root.tagName).toBe('P');
    expect(root.textContent).toBe('Help');
  });

  it('asChild merges the class and attributes onto the child and keeps its content', () => {
    const { container } = mountView(() =>
      h(Hint, { asChild: true, id: 'h', class: 'mine' }, () => h('small', { id: 'own' }, 'Help')),
    );
    const root = pick(container, '.cck-hint');
    expect(root.tagName).toBe('SMALL');
    expect(root.id).toBe('own');
    expect(root.classList.contains('mine')).toBe(true);
    expect(root.textContent).toBe('Help');
  });

  it('as="template" means asChild', () => {
    const { container } = mountView(() => h(Hint, { as: 'template' }, () => h('small', 'Help')));
    expect(pick(container, '.cck-hint').tagName).toBe('SMALL');
  });

  it('exposes the root element, also for asChild next to a comment', () => {
    const plain = ref<{ element: Element | null } | null>(null);
    const merged = ref<{ element: Element | null } | null>(null);
    const { container } = mountView(() => [
      h(Hint, { ref: plain, id: 'plain' }),
      h(Hint, { ref: merged, asChild: true, id: 'merged' }, () => [h(Comment, 'note'), h('small')]),
    ]);
    expect(plain.value?.element).toBe(pick(container, '#plain'));
    expect(merged.value?.element).toBe(pick(container, '#merged'));
  });
});
