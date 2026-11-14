<script setup lang="ts">
import { ref, type Directive } from 'vue';
import { Badge } from '../index';

defineProps<{ show: boolean }>();

const child = ref<HTMLElement | null>(null);
const vMark: Directive<HTMLElement> = {
  mounted(element) {
    element.setAttribute('data-marked', '');
  },
};

defineExpose({ child });
</script>

<template>
  <Badge as-child :content="120" :max="99" id="outer">
    <em id="inner" ref="child" v-show="show" v-mark>own</em>
  </Badge>
</template>
