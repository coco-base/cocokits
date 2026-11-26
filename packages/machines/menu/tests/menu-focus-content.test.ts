// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { menuAnatomy, resolveMenuFocusContent } from '../index';

const { classes } = menuAnatomy;

/** A menu content with a sub-trigger that controls a submenu outside it, as a portal puts it. */
function mount(): { content: HTMLElement; sub: HTMLElement; subItem: HTMLElement; outside: HTMLElement } {
  document.body.innerHTML = `
    <div class="${classes.content}" tabindex="-1">
      <div class="${classes.item}" tabindex="-1">Edit</div>
      <div class="${classes.subTrigger}" aria-controls="share" tabindex="-1">Share</div>
    </div>
    <div id="share" class="${classes.subContent}"><div id="email" class="${classes.item}" tabindex="-1">Email</div></div>
    <button id="outside">Outside</button>
  `;
  const get = (selector: string): HTMLElement => {
    const element = document.querySelector<HTMLElement>(selector);
    if (!element) throw new Error(`no ${selector}`);
    return element;
  };
  return {
    content: get(`.${classes.content}`),
    sub: get('#share'),
    subItem: get('#email'),
    outside: get('#outside'),
  };
}

afterEach(() => {
  document.body.innerHTML = '';
});

describe('resolveMenuFocusContent', () => {
  it('is null without a content', () => {
    expect(resolveMenuFocusContent(null)).toBeNull();
  });

  it('is the focused item of a submenu the content opened', () => {
    const { content, subItem } = mount();
    subItem.focus();
    expect(resolveMenuFocusContent(content)).toBe(subItem);
  });

  it('is the content when the focus is in it, outside the menu or nowhere', () => {
    const { content, outside } = mount();
    content.querySelector<HTMLElement>(`.${classes.item}`)?.focus();
    expect(resolveMenuFocusContent(content)?.contains(document.activeElement)).toBe(true);
    outside.focus();
    expect(resolveMenuFocusContent(content)).toBe(content);
    outside.blur();
    expect(resolveMenuFocusContent(content)).toBe(content);
  });

  it('follows a submenu only while its sub-trigger controls it', () => {
    const { content, subItem } = mount();
    content.querySelector(`.${classes.subTrigger}`)?.removeAttribute('aria-controls');
    subItem.focus();
    expect(resolveMenuFocusContent(content)).toBe(content);
  });
});
