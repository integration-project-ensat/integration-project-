<template>
  <input
    :type="type"
    :placeholder="placeholder"
    :value="modelValue"
    @input="$emit('update:modelValue', $event.target.value)"
    class="input"
  />
</template>

<script setup>
defineProps(['modelValue', 'placeholder', 'type'])
defineEmits(['update:modelValue'])
</script>

<style scoped>
.input {
  width: 100%;
  padding: 12px;
  border-radius: 20px;
  border: none;
  background: #eee;
  margin: 8px 0;
}
</style>