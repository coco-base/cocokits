/** One TSDoc comment and what {@link readTsDoc} must read from it. */
export interface SourceRow {
  /** The row name. */
  readonly name: string;
  readonly comment: string;
  /** The whole text of the `@example` tag. */
  readonly example: string;
  /** The names of the tags after the example, in order. */
  readonly others: readonly string[];
}

/** A row copied from a file of `packages/`: its name is `file:line` of the `@example`, without `packages/` and `src/`. */
export interface PackageRow extends SourceRow {
  /** The file of the comment, from the workspace root. `at-sign-cases.spec.ts` checks the comment against it. */
  readonly file: string;
  /** The line of the `@example` tag in the file. */
  readonly line: number;
}

/** Every `@` in an `@example` of `packages/`: the comment and its whole example, copied from the source. */
export const SOURCE_ROWS: readonly PackageRow[] = [
  {
    name: 'vue/button/button.types.ts:12',
    file: 'packages/vue/src/button/button.types.ts',
    line: 12,
    comment:
      '/**\n * A button for actions. It renders a native `<button type="button">`. With an `as` other than `\'button\'`, or with\n * `asChild`, it renders a link (an `<a>`).\n *\n * Native button attributes and listeners fall through to the rendered element. A disabled link blocks its click in\n * the capture phase. So your `@click.capture` runs first and can stop the guard with `preventDefault()`.\n *\n * @example\n * <Button @click="save">Save</Button>\n *\n * @cckPart root\n */',
    example: '<Button @click="save">Save</Button>',
    others: ['cckPart'],
  },
  {
    name: 'vue/button/Button.vue:72',
    file: 'packages/vue/src/button/Button.vue',
    line: 72,
    comment:
      '/**\n * The DOM element of the Button: the `<button>`, the `<a>` or the element of the `as` component. It is `null`\n * before mount.\n *\n * @example\n * <Button ref="button" @click="save">Save</Button>\n * <!-- In the script: const button = useTemplateRef(\'button\'); then button.value?.element is the element. -->\n *\n * @cckSemantic none\n * @cckParity Templates reach the DOM node through the component ref.\n */',
    example:
      '<Button ref="button" @click="save">Save</Button>\n<!-- In the script: const button = useTemplateRef(\'button\'); then button.value?.element is the element. -->',
    others: ['cckSemantic', 'cckParity'],
  },
  {
    name: 'vue/dialog/dialog.types.ts:183',
    file: 'packages/vue/src/dialog/dialog.types.ts',
    line: 183,
    comment:
      '/**\n * Emits before Escape closes the dialog, with the keydown event. Call `preventDefault()` to keep the dialog open.\n *\n * @example\n * <DialogContent @escape-key-down="(event) => saving && event.preventDefault()">...</DialogContent>\n *\n * @cckSemantic none\n * @cckParity The Content part emits it.\n */',
    example: '<DialogContent @escape-key-down="(event) => saving && event.preventDefault()">...</DialogContent>',
    others: ['cckSemantic', 'cckParity'],
  },
  {
    name: 'vue/dialog/dialog.types.ts:196',
    file: 'packages/vue/src/dialog/dialog.types.ts',
    line: 196,
    comment:
      '/**\n * Emits before a press outside the dialog closes it. The `detail.originalEvent` of the event is the press. Call\n * `preventDefault()` to keep the dialog open.\n *\n * A modal dialog emits it for a press on the backdrop. A non-modal dialog emits it for a press anywhere outside.\n *\n * @example\n * <DialogContent @pointer-down-outside="(event) => event.preventDefault()">...</DialogContent>\n *\n * @cckSemantic none\n * @cckParity The Content part emits it.\n */',
    example: '<DialogContent @pointer-down-outside="(event) => event.preventDefault()">...</DialogContent>',
    others: ['cckSemantic', 'cckParity'],
  },
  {
    name: 'vue/dialog/dialog.types.ts:209',
    file: 'packages/vue/src/dialog/dialog.types.ts',
    line: 209,
    comment:
      '/**\n * Emits before the focus moving outside closes a dialog that is not `modal`. The `detail.originalEvent` of the\n * event is the focus event. Call `preventDefault()` to keep the dialog open.\n *\n * A modal dialog never emits it, because the focus never leaves it.\n *\n * @example\n * <DialogContent @focus-outside="(event) => event.preventDefault()">...</DialogContent>\n *\n * @cckSemantic none\n * @cckParity The Content part emits it.\n */',
    example: '<DialogContent @focus-outside="(event) => event.preventDefault()">...</DialogContent>',
    others: ['cckSemantic', 'cckParity'],
  },
  {
    name: 'vue/dialog/dialog.types.ts:220',
    file: 'packages/vue/src/dialog/dialog.types.ts',
    line: 220,
    comment:
      '/**\n * Emits after `pointerDownOutside` or `focusOutside`, with the same event, before the dialog closes. Call\n * `preventDefault()` to keep the dialog open.\n *\n * @example\n * <DialogContent @interact-outside="(event) => dirty && event.preventDefault()">...</DialogContent>\n *\n * @cckSemantic none\n * @cckParity The Content part emits it.\n */',
    example: '<DialogContent @interact-outside="(event) => dirty && event.preventDefault()">...</DialogContent>',
    others: ['cckSemantic', 'cckParity'],
  },
  {
    name: 'vue/dialog/dialog.types.ts:233',
    file: 'packages/vue/src/dialog/dialog.types.ts',
    line: 233,
    comment:
      '/**\n * Emits right after the dialog is shown, when the browser has moved the focus into it. Call `preventDefault()` to\n * keep the component from moving the focus again.\n *\n * The focus the browser moved stays. Move the focus in your listener to choose the element.\n *\n * @example\n * <DialogContent @open-auto-focus="(event) => { event.preventDefault(); nameInput?.focus(); }">...</DialogContent>\n *\n * @cckSemantic none\n * @cckParity The Content part emits it.\n */',
    example:
      '<DialogContent @open-auto-focus="(event) => { event.preventDefault(); nameInput?.focus(); }">...</DialogContent>',
    others: ['cckSemantic', 'cckParity'],
  },
  {
    name: 'vue/dialog/dialog.types.ts:244',
    file: 'packages/vue/src/dialog/dialog.types.ts',
    line: 244,
    comment:
      '/**\n * Emits before the focus returns to the element that had it when the dialog opened. That is the trigger, or the\n * opener of a dialog without a trigger. Call `preventDefault()` to skip the return and move the focus yourself.\n *\n * @example\n * <DialogContent @close-auto-focus="(event) => { event.preventDefault(); searchInput?.focus(); }">...</DialogContent>\n *\n * @cckSemantic none\n * @cckParity The Content part emits it.\n */',
    example:
      '<DialogContent @close-auto-focus="(event) => { event.preventDefault(); searchInput?.focus(); }">...</DialogContent>',
    others: ['cckSemantic', 'cckParity'],
  },
  {
    name: 'vue/dialog/DialogRoot.vue:25',
    file: 'packages/vue/src/dialog/DialogRoot.vue',
    line: 25,
    comment:
      '/**\n * The parts of the dialog: a trigger and the content. The slot gives you the open state and a close function. When\n * not set, the dialog has no parts.\n *\n * The root renders no element around them.\n *\n * @example\n * <DialogRoot #default="{ close }">\n *   <DialogTrigger>Delete project</DialogTrigger>\n *   <DialogContent>\n *     <DialogTitle>Delete project</DialogTitle>\n *     <button type="button" @click="remove(); close()">Delete</button>\n *   </DialogContent>\n * </DialogRoot>\n */',
    example:
      '<DialogRoot #default="{ close }">\n  <DialogTrigger>Delete project</DialogTrigger>\n  <DialogContent>\n    <DialogTitle>Delete project</DialogTitle>\n    <button type="button" @click="remove(); close()">Delete</button>\n  </DialogContent>\n</DialogRoot>',
    others: [],
  },
  {
    name: 'vue/popover/popover.types.ts:222',
    file: 'packages/vue/src/popover/popover.types.ts',
    line: 222,
    comment:
      '/**\n * Emits before Escape closes the popover, with the keydown event. Call `preventDefault()` to keep the popover open.\n *\n * @example\n * <PopoverContent @escape-key-down="(event) => saving && event.preventDefault()">...</PopoverContent>\n *\n * @cckSemantic none\n * @cckParity The Content part emits it.\n */',
    example: '<PopoverContent @escape-key-down="(event) => saving && event.preventDefault()">...</PopoverContent>',
    others: ['cckSemantic', 'cckParity'],
  },
  {
    name: 'vue/popover/popover.types.ts:233',
    file: 'packages/vue/src/popover/popover.types.ts',
    line: 233,
    comment:
      '/**\n * Emits before a press outside closes the popover. The `detail.originalEvent` of the event is the press. Call\n * `preventDefault()` to keep the popover open.\n *\n * @example\n * <PopoverContent @pointer-down-outside="(event) => event.preventDefault()">...</PopoverContent>\n *\n * @cckSemantic none\n * @cckParity The Content part emits it.\n */',
    example: '<PopoverContent @pointer-down-outside="(event) => event.preventDefault()">...</PopoverContent>',
    others: ['cckSemantic', 'cckParity'],
  },
  {
    name: 'vue/popover/popover.types.ts:244',
    file: 'packages/vue/src/popover/popover.types.ts',
    line: 244,
    comment:
      '/**\n * Emits before the focus moving outside closes the popover. The `detail.originalEvent` of the event is the focus\n * event. Call `preventDefault()` to keep the popover open.\n *\n * @example\n * <PopoverContent @focus-outside.prevent>...</PopoverContent>\n *\n * @cckSemantic none\n * @cckParity The Content part emits it.\n */',
    example: '<PopoverContent @focus-outside.prevent>...</PopoverContent>',
    others: ['cckSemantic', 'cckParity'],
  },
  {
    name: 'vue/popover/popover.types.ts:255',
    file: 'packages/vue/src/popover/popover.types.ts',
    line: 255,
    comment:
      '/**\n * Emits after `pointerDownOutside` or `focusOutside`, with the same event, before the popover closes. Call\n * `preventDefault()` to keep the popover open.\n *\n * @example\n * <PopoverContent @interact-outside="(event) => dirty && event.preventDefault()">...</PopoverContent>\n *\n * @cckSemantic none\n * @cckParity The Content part emits it.\n */',
    example: '<PopoverContent @interact-outside="(event) => dirty && event.preventDefault()">...</PopoverContent>',
    others: ['cckSemantic', 'cckParity'],
  },
  {
    name: 'vue/popover/popover.types.ts:266',
    file: 'packages/vue/src/popover/popover.types.ts',
    line: 266,
    comment:
      '/**\n * Emits before the focus moves into the popover on open. Call `preventDefault()` to keep the focus where it is,\n * or to move it yourself.\n *\n * @example\n * <PopoverContent @open-auto-focus="(event) => { event.preventDefault(); nameInput?.focus(); }">...</PopoverContent>\n *\n * @cckSemantic none\n * @cckParity The Content part emits it.\n */',
    example:
      '<PopoverContent @open-auto-focus="(event) => { event.preventDefault(); nameInput?.focus(); }">...</PopoverContent>',
    others: ['cckSemantic', 'cckParity'],
  },
  {
    name: 'vue/popover/popover.types.ts:277',
    file: 'packages/vue/src/popover/popover.types.ts',
    line: 277,
    comment:
      '/**\n * Emits before the focus returns to the trigger on close. Call `preventDefault()` to skip the return and move the\n * focus yourself.\n *\n * @example\n * <PopoverContent @close-auto-focus="(event) => { event.preventDefault(); search?.focus(); }">...</PopoverContent>\n *\n * @cckSemantic none\n * @cckParity The Content part emits it.\n */',
    example:
      '<PopoverContent @close-auto-focus="(event) => { event.preventDefault(); search?.focus(); }">...</PopoverContent>',
    others: ['cckSemantic', 'cckParity'],
  },
  {
    name: 'vue/popover/PopoverRoot.vue:20',
    file: 'packages/vue/src/popover/PopoverRoot.vue',
    line: 20,
    comment:
      '/**\n * The parts of the popover: a trigger, the content and a Close. The slot gives you the open state and a close function. When\n * not set, the popover has no parts.\n *\n * The root renders no element around them.\n *\n * @example\n * <PopoverRoot #default="{ close }">\n *   <PopoverTrigger>Share</PopoverTrigger>\n *   <PopoverContent aria-label="Share">\n *     <button type="button" @click="copyLink(); close()">Copy link</button>\n *   </PopoverContent>\n * </PopoverRoot>\n */',
    example:
      '<PopoverRoot #default="{ close }">\n  <PopoverTrigger>Share</PopoverTrigger>\n  <PopoverContent aria-label="Share">\n    <button type="button" @click="copyLink(); close()">Copy link</button>\n  </PopoverContent>\n</PopoverRoot>',
    others: [],
  },
  {
    name: 'vue/select/select-list.types.ts:87',
    file: 'packages/vue/src/select/select-list.types.ts',
    line: 87,
    comment:
      '/**\n * Emits when the user presses Escape with the list open, before it closes. The event is the keydown. Call `preventDefault()` to keep the list open.\n *\n * When not set, Escape closes the list.\n *\n * A Select that Escape cannot close is harder to leave with the keyboard. Keep the refusal short. A focus leave\n * always closes the list, and so does choosing an item in a single Select.\n *\n * @example\n * <SelectContent @escape-key-down="(event) => saving && event.preventDefault()">\n *   ...\n * </SelectContent>\n * @cckSemantic none\n * @cckParity The Content part emits it.\n */',
    example: '<SelectContent @escape-key-down="(event) => saving && event.preventDefault()">\n  ...\n</SelectContent>',
    others: ['cckSemantic', 'cckParity'],
  },
  {
    name: 'vue/select/select-list.types.ts:100',
    file: 'packages/vue/src/select/select-list.types.ts',
    line: 100,
    comment:
      '/**\n * Emits when the user presses outside the list and the trigger, before the list closes. The event is cancelable, and `detail.originalEvent` is the press. Call `preventDefault()` to keep the list open.\n *\n * The press then leaves the focus on the trigger.\n *\n * @example\n * <SelectContent @pointer-down-outside.prevent>\n *   ...\n * </SelectContent>\n * @cckSemantic none\n * @cckParity The Content part emits it.\n */',
    example: '<SelectContent @pointer-down-outside.prevent>\n  ...\n</SelectContent>',
    others: ['cckSemantic', 'cckParity'],
  },
  {
    name: 'vue/select/select-list.types.ts:180',
    file: 'packages/vue/src/select/select-list.types.ts',
    line: 180,
    comment:
      '/**\n * Emits before the user chooses the item with a click, Enter or Space, or when the focus leaves the trigger on the highlighted item. The event is cancelable, and its `detail` holds the `originalEvent` and the `value`. Call `preventDefault()` to stop the choice.\n *\n * The value stays, and a list opened by a click or a key stays open.\n *\n * @example\n * <SelectItem value="Cake" @select.prevent>\n *   ...\n * </SelectItem>\n * @cckSemantic none\n * @cckParity The Item part emits it.\n */',
    example: '<SelectItem value="Cake" @select.prevent>\n  ...\n</SelectItem>',
    others: ['cckSemantic', 'cckParity'],
  },
  {
    name: 'vue/select/select.types.ts:264',
    file: 'packages/vue/src/select/select.types.ts',
    line: 264,
    comment:
      '/**\n * Emits with the new value after the Select accepts a change. `v-model` listens to it. The value is one value or `null`, or a list with `multiple`.\n *\n * It carries the new value only, and no reason.\n *\n * @example\n * <SelectRoot :model-value="dish" @update:model-value="(value) => console.log(value)">\n *   ...\n * </SelectRoot>\n * @cckSemantic select.valueChange\n * @cckParity The `update:modelValue` event is the only change event; it carries no reason.\n */',
    example:
      '<SelectRoot :model-value="dish" @update:model-value="(value) => console.log(value)">\n  ...\n</SelectRoot>',
    others: ['cckSemantic', 'cckParity'],
  },
  {
    name: 'vue/tabs/tabs.types.ts:125',
    file: 'packages/vue/src/tabs/tabs.types.ts',
    line: 125,
    comment:
      '/**\n * Emits the new value for `v-model` after every selection the tabs accept. It carries the new value only, and no\n * reason.\n *\n * @example\n * <TabsRoot :model-value="tab" @update:model-value="(value) => (tab = value)">...</TabsRoot>\n *\n * @cckSemantic tabs.valueChange\n * @cckParity The `update:modelValue` event is the only change event; it carries no reason.\n */',
    example: '<TabsRoot :model-value="tab" @update:model-value="(value) => (tab = value)">...</TabsRoot>',
    others: ['cckSemantic', 'cckParity'],
  },
  {
    name: 'vue/tooltip/tooltip.types.ts:252',
    file: 'packages/vue/src/tooltip/tooltip.types.ts',
    line: 252,
    comment:
      '/**\n * Emits before Escape closes the tooltip, with the keydown event. Call `preventDefault()` to keep the tooltip\n * shown.\n *\n * A tooltip must stay dismissible, so refuse Escape rarely and only while another way hides it, such as moving the\n * pointer or the focus away.\n *\n * @example\n * <TooltipContent @escape-key-down="(event) => saving && event.preventDefault()">Copy link</TooltipContent>\n *\n * @cckSemantic none\n * @cckParity The Content part emits it.\n */',
    example:
      '<TooltipContent @escape-key-down="(event) => saving && event.preventDefault()">Copy link</TooltipContent>',
    others: ['cckSemantic', 'cckParity'],
  },
  {
    name: 'vue/tooltip/tooltip.types.ts:263',
    file: 'packages/vue/src/tooltip/tooltip.types.ts',
    line: 263,
    comment:
      '/**\n * Emits before a press outside closes the tooltip. The `detail.originalEvent` of the event is the press. Call\n * `preventDefault()` to keep the tooltip shown.\n *\n * @example\n * <TooltipContent @pointer-down-outside.prevent>Copy link</TooltipContent>\n *\n * @cckSemantic none\n * @cckParity The Content part emits it.\n */',
    example: '<TooltipContent @pointer-down-outside.prevent>Copy link</TooltipContent>',
    others: ['cckSemantic', 'cckParity'],
  },
  {
    name: 'angular/select/select-types.ts:91',
    file: 'packages/angular/select/select-types.ts',
    line: 91,
    comment:
      '/**\n * The default values for every Select below the provider. A value here replaces the built-in default. An input on a Select wins over it.\n * @example\n * @Component({\n *   providers: [{ provide: CCK_SELECT_CONFIG, useValue: { typeaheadDebounceInterval: 300 } }],\n * })\n * export class DishForm {}\n */',
    example:
      '@Component({\n  providers: [{ provide: CCK_SELECT_CONFIG, useValue: { typeaheadDebounceInterval: 300 } }],\n})\nexport class DishForm {}',
    others: [],
  },
  {
    name: 'angular/select/select.ts:183',
    file: 'packages/angular/select/select.ts',
    line: 183,
    comment:
      '/**\n * A function that tells whether an option value is the selected value. Use it when the option values are objects. When not set, the values are compared with `Object.is`.\n * @remarks Pair it with `itemToStringValue`, which turns an object into the text that a form sends.\n * @example\n * <cck-select [(value)]="dish" [compareWith]="sameDish" [itemToStringValue]="dishId" aria-label="Dish">\n *   @for (item of dishes; track item.id) {\n *     <cck-select-option [value]="item">{{ item.name }}</cck-select-option>\n *   }\n * </cck-select>\n * <!-- In the class: sameDish = (a: Dish, b: Dish) => a.id === b.id; dishId = (dish: Dish) => String(dish.id); -->\n * @cckSemantic select.isItemEqual\n * @defaultValue Object.is\n */',
    example:
      '<cck-select [(value)]="dish" [compareWith]="sameDish" [itemToStringValue]="dishId" aria-label="Dish">\n  @for (item of dishes; track item.id) {\n    <cck-select-option [value]="item">{{ item.name }}</cck-select-option>\n  }\n</cck-select>\n<!-- In the class: sameDish = (a: Dish, b: Dish) => a.id === b.id; dishId = (dish: Dish) => String(dish.id); -->',
    others: ['remarks', 'cckSemantic', 'defaultValue'],
  },
  {
    name: 'react/input/input.tsx:84',
    file: 'packages/react/src/input/input.tsx',
    line: 84,
    comment:
      '/**\n * A box for one line of text. It renders a native `<input>` of the type `text`, `email`, `password`, `search`, `tel`\n * or `url`. Native `input` props pass through, and `ref` reaches the element.\n *\n * It is a native form control. `FormData`, the native checks, the `form` prop, submit by Enter and a disabled\n * `fieldset` work. It works with react-hook-form `register()` and `Controller`.\n *\n * Control the text with `value` and `onValueChange`, or set `defaultValue` and let the DOM keep it. A change that\n * you do not take is undone.\n *\n * Inside a `FormField`, it gets the id `<fieldId>-control`, and the `Label` names it. The ids of the hints and\n * errors of the field describe it. An `id` or `aria-describedby` you write wins or comes first.\n *\n * The element has the state as `data-*` attributes. It gets `aria-invalid="true"` only while it is not valid and\n * the user has left it or tried to submit.\n *\n * @example\n * <label htmlFor="email">Email address</label>\n * <Input id="email" type="email" defaultValue="ana@example.com" />\n * @cckPart root\n * @param props - The Input props.\n * @returns The rendered input.\n */',
    example:
      '<label htmlFor="email">Email address</label>\n<Input id="email" type="email" defaultValue="ana@example.com" />',
    others: ['cckPart', 'param', 'returns'],
  },
  {
    name: 'react/leading/leading.tsx:46',
    file: 'packages/react/src/leading/leading.tsx',
    line: 46,
    comment:
      '/**\n * An icon or a short text before the box of a field, outside it.\n * It renders a `<div>`. Native `div` props pass through, and `ref` reaches the element.\n *\n * Pass it to the `leading` prop of a `FormField`, which puts it in its place. It also works outside a `FormField`.\n *\n * It adds no ARIA and links to nothing. Its text is not part of the name or the description of the control. Give\n * an icon `aria-hidden="true"`, and give a button its own accessible name.\n *\n * @example\n * <FormField label={<Label>Search</Label>} leading={<Leading aria-hidden="true">@</Leading>}>\n *   <Input type="search" />\n * </FormField>\n * @cckPart root\n * @param props - The Leading props.\n * @returns The rendered div.\n */',
    example:
      '<FormField label={<Label>Search</Label>} leading={<Leading aria-hidden="true">@</Leading>}>\n  <Input type="search" />\n</FormField>',
    others: ['cckPart', 'param', 'returns'],
  },
  {
    name: 'react/leading/leading.types.ts:23',
    file: 'packages/react/src/leading/leading.types.ts',
    line: 23,
    comment:
      '/**\n * The content of the Leading: an icon, a short text or a button. When not set, the Leading is empty.\n *\n * @example\n * <Leading aria-hidden="true">@</Leading>\n */',
    example: '<Leading aria-hidden="true">@</Leading>',
    others: [],
  },
];
