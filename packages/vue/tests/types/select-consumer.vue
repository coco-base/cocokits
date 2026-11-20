<script setup lang="ts">
// A type test: `pnpm nx run vue:typecheck` fails when a `v-model` below does not compile, or when a
// `@vue-expect-error` line compiles.
import { ref } from 'vue';
import { SelectContent, SelectItem, SelectRoot, SelectTrigger, SelectValue } from '../../src/select';
const dish = ref<string | null>(null);
const dishes = ref<readonly string[]>([]);
const onDish = (value: string | null): string | null => value;
const onDishes = (value: readonly string[]): readonly string[] => value;
</script>

<template>
  <SelectRoot v-model="dish" @update:model-value="onDish">
    <SelectTrigger><SelectValue /></SelectTrigger>
    <SelectContent><SelectItem value="Cake">Cake</SelectItem></SelectContent>
  </SelectRoot>
  <SelectRoot v-model="dishes" multiple @update:model-value="onDishes">
    <SelectTrigger><SelectValue /></SelectTrigger>
  </SelectRoot>
  <SelectRoot :multiple="true" :default-value="['Cake']" />
  <!-- @vue-expect-error a single value bound to a multiple Select -->
  <SelectRoot v-model="dish" multiple />
  <!-- @vue-expect-error a list bound to a single Select -->
  <SelectRoot v-model="dishes" />
</template>
