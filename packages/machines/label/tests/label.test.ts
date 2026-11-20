import { describe, expect, it } from 'vitest';
import { getLabelProps, labelAnatomy, labelMeta } from '../index';

describe('getLabelProps', () => {
  it('has the block class on the anatomy root and the element class on the marker', () => {
    expect(labelAnatomy.classes).toEqual({ root: 'cck-label', requiredMarker: 'cck-label__required-marker' });
  });

  it('returns the class of the root and no marker without input', () => {
    expect(getLabelProps()).toEqual({ root: { class: 'cck-label' }, requiredMarker: null });
  });

  it('describes the root without naming an element', () => {
    expect(labelAnatomy.parts.root.description).toBe('The visible label of a control. It holds the label text.');
  });

  it('declares no data attribute, role or keyboard, and a native label with a span marker', () => {
    expect(labelMeta.dataAttrs).toEqual({ root: [], requiredMarker: [] });
    expect(labelMeta.roles).toEqual({ root: null, requiredMarker: null });
    expect(labelMeta.keyboard).toEqual([]);
    expect(labelMeta.defaultElements).toEqual({ root: 'label', requiredMarker: 'span' });
  });

  it('has a meta entry for every anatomy part', () => {
    expect(Object.keys(labelMeta.dataAttrs)).toEqual(Object.keys(labelAnatomy.parts));
  });

  describe('id', () => {
    it('renders the given id on the root and none without it', () => {
      expect(getLabelProps({ id: 'f1-label' }).root).toEqual({ class: 'cck-label', id: 'f1-label' });
      expect(getLabelProps({ for: 'c' }).root).not.toHaveProperty('id');
    });
  });

  describe('for', () => {
    it('renders the given for on the root', () => {
      expect(getLabelProps({ for: 'email-control' }).root).toEqual({ class: 'cck-label', for: 'email-control' });
    });

    it('renders no for when none is given or it is empty', () => {
      expect(getLabelProps({}).root).toEqual({ class: 'cck-label' });
      expect(getLabelProps({ for: '' }).root).toEqual({ class: 'cck-label' });
    });
  });

  describe('required marker', () => {
    it('is an aria-hidden star while required', () => {
      expect(getLabelProps({ required: true }).requiredMarker).toEqual({
        class: 'cck-label__required-marker',
        'aria-hidden': 'true',
        text: '*',
      });
    });

    it.each([
      ['not required', { required: false }],
      ['required unset', {}],
      ['hidden by hideRequiredMarker', { required: true, hideRequiredMarker: true }],
    ])('is absent when %s', (_label, input) => {
      expect(getLabelProps(input).requiredMarker).toBeNull();
    });
  });
});
