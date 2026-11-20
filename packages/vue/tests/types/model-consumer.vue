<script setup lang="ts">
// A type test: `pnpm nx run <project>:typecheck` fails when a `v-model` below does not compile.
import { ref } from 'vue';
import { Checkbox } from '../../src/checkbox';
import { Radio } from '../../src/radio';
import { Switch } from '../../src/switch';
import { Textarea } from '../../src/textarea';
import { Input } from '../../src/input';
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
  <Input v-model="text" />
  <Input v-model="nullableText" />
  <Input v-model.trim="text" />
  <Input :model-value="null" @update:model-value="onText" />
  <Input />
</template>
