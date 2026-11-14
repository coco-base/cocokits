import { render } from '@testing-library/angular';
import { formFieldAnatomy, formFieldMeta } from '@cocokits/machines/form-field';
import { describe, expect, it } from 'vitest';
import { CckHintImports } from '../../hint';
import { CckLabelImports } from '../../label';
import { CckFormField, CckFormFieldImports } from '../index';

const imports = [...CckFormFieldImports, ...CckLabelImports, ...CckHintImports];

const classes = formFieldAnatomy.classes;

function root(container: HTMLElement): HTMLElement {
  const el = container.querySelector<HTMLElement>(`.${classes.root}`);
  if (!el) throw new Error('no field rendered');
  return el;
}

const classesOf = (el: Element): string[] => Array.from(el.children, (child) => child.className);

describe('CckFormField', () => {
  it('renders the label, wrapper > inputWrapper > control and feedbackWrapper > hint, in that order', async () => {
    const { container } = await render(
      `<cck-form-field>
         <label cckLabel for="a">Name</label>
         <input id="a" />
         <cck-hint>Help</cck-hint>
       </cck-form-field>`,
      { imports },
    );
    const field = root(container);
    expect(classesOf(field)).toEqual(['cck-label', classes.wrapper, classes.feedbackWrapper]);
    expect(
      container.querySelector(`.${classes.root} > .${classes.wrapper} > .${classes.inputWrapper} > input`),
    ).not.toBeNull();
    expect(container.querySelector(`.${classes.root} > .${classes.feedbackWrapper} > .cck-hint`)).not.toBeNull();
  });

  it('gives the same order when the author writes the Hint, the control and the Label in reverse', async () => {
    const { container } = await render(
      `<cck-form-field>
         <cck-hint>Help</cck-hint>
         <input id="a" />
         <label cckLabel for="a">Name</label>
       </cck-form-field>`,
      { imports },
    );
    const field = root(container);
    expect(classesOf(field)).toEqual(['cck-label', classes.wrapper, classes.feedbackWrapper]);
    expect(field.querySelector(`.${classes.inputWrapper} > input`)).not.toBeNull();
    expect(field.querySelector(`.${classes.feedbackWrapper} > .cck-hint`)).not.toBeNull();
  });

  it('keeps several hints in the feedback wrapper, in author order', async () => {
    const { container } = await render(
      `<cck-form-field><cck-hint id="h1">One</cck-hint><input /><cck-hint id="h2">Two</cck-hint></cck-form-field>`,
      { imports },
    );
    const ids = Array.from(container.querySelectorAll(`.${classes.feedbackWrapper} > .cck-hint`), (el) => el.id);
    expect(ids).toEqual(['h1', 'h2']);
  });

  it('renders an empty feedback wrapper when there is no hint', async () => {
    const { container } = await render(`<cck-form-field><label cckLabel>Name</label><input /></cck-form-field>`, {
      imports,
    });
    const feedback = container.querySelector<HTMLElement>(`.${classes.feedbackWrapper}`);
    expect(feedback).not.toBeNull();
    expect(feedback?.matches(':empty')).toBe(true);
  });

  it('renders the anatomy classes on the meta default elements, with no role, ARIA or style', async () => {
    const { container } = await render(`<cck-form-field><input /></cck-form-field>`, { imports });
    for (const [part, className] of Object.entries(classes)) {
      const el = container.querySelector(`.${className}`);
      expect(el?.tagName.toLowerCase(), className).toBe(
        part === 'root' ? 'cck-form-field' : formFieldMeta.defaultElements?.[part as keyof typeof classes],
      );
      const attrNames = Array.from(el?.attributes ?? [], (a) => a.name);
      expect(attrNames.filter((n) => n === 'role' || n === 'style' || n.startsWith('aria-'))).toEqual([]);
    }
  });

  it('renders on the cck-form-field tag', async () => {
    const { container } = await render(`<cck-form-field><input /></cck-form-field>`, { imports });
    expect(root(container).tagName).toBe('CCK-FORM-FIELD');
  });

  it('exports the component under the exportAs name', async () => {
    const { fixture } = await render(`<cck-form-field #f="cckFormField"></cck-form-field>`, { imports });
    expect(fixture.debugElement.children[0]?.injector.get(CckFormField)).toBeInstanceOf(CckFormField);
  });

  it('passes native attributes through to the root', async () => {
    const { container } = await render(`<cck-form-field id="f" data-x="1"><input /></cck-form-field>`, { imports });
    expect(root(container).id).toBe('f');
    expect(root(container).getAttribute('data-x')).toBe('1');
  });
});
