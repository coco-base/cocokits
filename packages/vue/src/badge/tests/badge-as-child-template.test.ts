// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/vue';
import { h, ref } from 'vue';
import { afterEach, describe, expect, it } from 'vitest';
import AsChildTemplate from './AsChildTemplate.vue';
import { mountView, pick } from './fixtures';

afterEach(cleanup);

describe('Badge asChild with a compiled template child', () => {
  it('keeps v-show, a custom directive and the template ref, and puts the parts inside', () => {
    const { container } = render(AsChildTemplate, { props: { show: false } });
    const badge = pick(container, '.cck-badge');
    expect(badge.tagName).toBe('EM');
    expect(badge.style.display).toBe('none');
    expect(badge.hasAttribute('data-marked')).toBe(true);
    expect(badge.textContent).toBe('99+');
  });

  it('shows the child when v-show is true, and the template ref reaches it', () => {
    const view = ref<{ child: HTMLElement | null } | null>(null);
    const { container } = mountView(() => h(AsChildTemplate, { ref: view, show: true }));
    expect(pick(container, '.cck-badge').style.display).toBe('');
    expect(view.value?.child).toBe(pick(container, '.cck-badge'));
  });

  it("keeps the child's own id over the Badge's", () => {
    const { container } = render(AsChildTemplate, { props: { show: true } });
    expect(pick(container, '.cck-badge').id).toBe('inner');
  });
});
