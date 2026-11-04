// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { trackLabelActivation, type LabelActivation } from '../index';
import { must, nextTask } from './helpers';

let host: HTMLElement;
let tracker: LabelActivation | undefined;

beforeEach(() => {
  host = document.createElement('div');
  host.innerHTML = '<label for="c"><b>Pick</b></label><button id="c" type="button">Control</button><p>Other</p>';
  document.body.append(host);
});

afterEach(() => {
  tracker?.destroy();
  tracker = undefined;
  host.remove();
});

/** Counts the answers `consume()` gives while a click on `target` reaches the control. */
function clicksOn(selector: string): boolean[] {
  const control = must(host.querySelector<HTMLElement>('button'));
  const created = trackLabelActivation(control);
  tracker = created;
  const answers: boolean[] = [];
  control.addEventListener('click', () => answers.push(created.consume()));
  must(host.querySelector<HTMLElement>(selector)).click();
  return answers;
}

describe('trackLabelActivation', () => {
  it('answers true for the click a label forwards to its control', () => {
    expect(clicksOn('label')).toEqual([true]);
  });

  it('answers true when the label click started on a child of the label', () => {
    expect(clicksOn('b')).toEqual([true]);
  });

  it('answers false for a click on the control itself', () => {
    expect(clicksOn('button')).toEqual([false]);
  });

  it('answers true only once per label click', () => {
    const control = must(host.querySelector<HTMLElement>('button'));
    const created = trackLabelActivation(control);
    tracker = created;
    const answers: boolean[] = [];
    control.addEventListener('click', () => answers.push(created.consume(), created.consume()));
    must(host.querySelector<HTMLElement>('label')).click();
    expect(answers).toEqual([true, false]);
  });

  it('forgets a label click that forwarded nothing after the task', async () => {
    const control = must(host.querySelector<HTMLElement>('button'));
    control.setAttribute('disabled', '');
    tracker = trackLabelActivation(control);
    must(host.querySelector<HTMLElement>('label')).click();
    await nextTask();
    control.removeAttribute('disabled');
    expect(tracker.consume()).toBe(false);
  });

  it('ignores a label of another control', () => {
    host.innerHTML = '<label for="o">Other</label><input id="o" /><button type="button">Control</button>';
    const control = must(host.querySelector<HTMLElement>('button'));
    tracker = trackLabelActivation(control);
    must(host.querySelector<HTMLElement>('label')).click();
    expect(tracker.consume()).toBe(false);
  });

  it('stops listening after destroy', () => {
    const control = must(host.querySelector<HTMLElement>('button'));
    const created = trackLabelActivation(control);
    created.destroy();
    must(host.querySelector<HTMLElement>('label')).click();
    expect(created.consume()).toBe(false);
  });
});
