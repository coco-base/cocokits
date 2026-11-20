// @vitest-environment jsdom
import { createApp, createSSRApp, defineComponent, h, nextTick, ref, type App, type Ref } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useFormParticipation, type FormParticipationBinding } from '../src/index';

function must<T>(value: T | null | undefined): T {
  if (value === null || value === undefined) throw new Error('Expected the element to exist.');
  return value;
}

const nextTask = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

let apps: App[] = [];
afterEach(() => {
  vi.restoreAllMocks();
  for (const app of apps) app.unmount();
  apps = [];
  document.body.innerHTML = '';
});

interface Mounted {
  readonly state: FormParticipationBinding;
  readonly show: Ref<boolean>;
  readonly app: App;
  /** Stays in the document when the app unmounts or the input goes away. */
  readonly form: HTMLFormElement;
  readonly fieldset: HTMLFieldSetElement;
}

function mountProbe(options: { model: () => string; onReset?: (event: Event) => void }): Mounted {
  const form = document.createElement('form');
  const fieldset = document.createElement('fieldset');
  form.append(fieldset);
  document.body.append(form);
  const show = ref(true);
  let state: FormParticipationBinding | undefined;
  const Control = defineComponent({
    setup() {
      const element = ref<HTMLInputElement | null>(null);
      state = useFormParticipation({ elementRef: element, getValue: options.model, onReset: options.onReset });
      return () => h('input', { ref: element, value: 'start' });
    },
  });
  const app = createApp({ render: () => (show.value ? h(Control) : null) });
  app.mount(fieldset);
  apps.push(app);
  return { state: state as unknown as FormParticipationBinding, show, app, form, fieldset };
}

describe('useFormParticipation (vue)', () => {
  it('starts false and follows the fieldset', async () => {
    const { state, fieldset } = mountProbe({ model: () => 'm' });
    await nextTick();
    expect(state.fieldsetDisabled.value).toBe(false);
    fieldset.disabled = true;
    await nextTask();
    expect(state.fieldsetDisabled.value).toBe(true);
    fieldset.disabled = false;
    await nextTask();
    expect(state.fieldsetDisabled.value).toBe(false);
  });

  it('syncValue writes the model value', async () => {
    let model = 'one';
    const { state, form } = mountProbe({ model: () => model });
    await nextTick();
    const input = must(form.querySelector('input'));
    state.syncValue();
    expect(input.value).toBe('one');
    model = 'two';
    state.syncValue();
    expect(input.value).toBe('two');
  });

  it('reports a submit, and a reset calls onReset once, syncs and clears submitted', async () => {
    const onReset = vi.fn();
    const { state, form } = mountProbe({ model: () => 'm', onReset });
    await nextTick();
    form.addEventListener('submit', (event) => {
      event.preventDefault();
    });
    form.requestSubmit();
    expect(state.submitted.value).toBe(true);
    const input = must(form.querySelector('input'));
    input.value = 'typed';
    form.reset();
    await nextTask();
    expect(onReset).toHaveBeenCalledTimes(1);
    expect(input.value).toBe('m');
    expect(state.submitted.value).toBe(false);
  });

  it('cleans up when the input goes away, with the form staying in the document', async () => {
    const onReset = vi.fn();
    const { state, show, form } = mountProbe({ model: () => 'm', onReset });
    await nextTick();
    const removed = vi.spyOn(document, 'removeEventListener');
    show.value = false;
    await nextTick();
    expect(removed.mock.calls.map(([type]) => type)).toEqual(expect.arrayContaining(['reset', 'submit']));
    expect(form.isConnected).toBe(true);
    expect(form.querySelector('input')).toBeNull();
    form.reset();
    await nextTask();
    expect(onReset).not.toHaveBeenCalled();
    expect(() => {
      state.syncValue();
    }).not.toThrow();
  });

  it('cleans up when the app unmounts, with the form outside the app', async () => {
    const onReset = vi.fn();
    const { app, form } = mountProbe({ model: () => 'm', onReset });
    await nextTick();
    const removed = vi.spyOn(document, 'removeEventListener');
    app.unmount();
    apps = [];
    expect(removed.mock.calls.map(([type]) => type)).toEqual(expect.arrayContaining(['reset', 'submit']));
    expect(form.isConnected).toBe(true);
    form.reset();
    await nextTask();
    expect(onReset).not.toHaveBeenCalled();
  });

  it('runs nothing on the server', async () => {
    const onReset = vi.fn();
    const Probe = defineComponent({
      setup() {
        const element = ref<HTMLInputElement | null>(null);
        const state = useFormParticipation({ elementRef: element, getValue: () => 'm', onReset });
        return () => h('input', { ref: element, 'data-disabled': state.fieldsetDisabled.value ? '' : null });
      },
    });
    const html = await renderToString(createSSRApp(Probe));
    expect(html).toBe('<input>');
  });

  describe('checked mode', () => {
    interface CheckedMounted {
      readonly state: FormParticipationBinding;
      readonly form: HTMLFormElement;
      readonly inputs: HTMLInputElement[];
    }

    /** Two radios of one group in a form, each bound by its own composable. */
    function mountRadios(options: {
      checked: () => boolean;
      onReset?: (event: Event) => void;
      onUncheckedByGroup?: (event: Event) => void;
    }): CheckedMounted {
      const form = document.createElement('form');
      document.body.append(form);
      let state: FormParticipationBinding | undefined;
      const Radio = defineComponent({
        props: { first: Boolean },
        setup(props) {
          const element = ref<HTMLInputElement | null>(null);
          const binding = useFormParticipation({
            elementRef: element,
            getChecked: props.first ? options.checked : () => false,
            onReset: props.first ? options.onReset : undefined,
            onUncheckedByGroup: props.first ? options.onUncheckedByGroup : undefined,
          });
          if (props.first) state = binding;
          return () => h('input', { ref: element, type: 'radio', name: 'g' });
        },
      });
      const app = createApp({ render: () => [h(Radio, { first: true }), h(Radio)] });
      app.mount(form);
      apps.push(app);
      return { state: state as unknown as FormParticipationBinding, form, inputs: [...form.querySelectorAll('input')] };
    }

    it('syncValue writes the checked state', async () => {
      let checked = true;
      const { state, inputs } = mountRadios({ checked: () => checked });
      await nextTick();
      state.syncValue();
      expect(inputs[0]?.checked).toBe(true);
      checked = false;
      state.syncValue();
      expect(inputs[0]?.checked).toBe(false);
    });

    it('reports the radio that another radio of the group unchecked, once, with the event', async () => {
      const onUncheckedByGroup = vi.fn();
      const { inputs } = mountRadios({ checked: () => true, onUncheckedByGroup });
      await nextTick();
      must(inputs[0]).checked = true;
      must(inputs[1]).click();
      expect(onUncheckedByGroup).toHaveBeenCalledTimes(1);
      expect(onUncheckedByGroup.mock.calls[0]?.[0]).toBeInstanceOf(Event);
    });

    it('calls onReset once after an uncanceled reset and restores the model', async () => {
      const onReset = vi.fn();
      const { form, inputs } = mountRadios({ checked: () => true, onReset });
      await nextTick();
      form.reset();
      await nextTask();
      expect(onReset).toHaveBeenCalledTimes(1);
      expect(inputs[0]?.checked).toBe(true);
    });
  });
});
