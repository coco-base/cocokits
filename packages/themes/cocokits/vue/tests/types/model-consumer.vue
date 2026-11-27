<script setup lang="ts">
// A type test: `pnpm nx run <project>:typecheck` fails when a `v-model` below does not compile.
import { ref } from 'vue';
import { Checkbox, Radio, Switch, Textarea } from '../../src/index';
const text = ref('');
const nullableText = ref<string | null>(null);
const checked = ref(false);
const nullableChecked = ref<boolean | null>(null);

const onText = (value: string): string => value;
const onChecked = (value: boolean): boolean => value;
</script>

<template>
  <Textarea v-model="text" />
  <Textarea v-model="nullableText" />
  <Textarea v-model.trim="text" />
  <Textarea :model-value="null" @update:model-value="onText" />
  <Textarea />
  <Checkbox v-model="checked" />
  <Checkbox v-model="nullableChecked" />
  <Checkbox :model-value="null" @update:model-value="onChecked" />
  <Checkbox />
  <Radio v-model="checked" />
  <Radio v-model="nullableChecked" />
  <Radio :model-value="null" @update:model-value="onChecked" />
  <Radio />
  <Switch v-model="checked" />
  <Switch v-model="nullableChecked" />
  <Switch :model-value="null" @update:model-value="onChecked" />
  <Switch />
</template>
