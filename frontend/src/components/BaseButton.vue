<template>
  <button class="btn">
    <slot />
  </button>
</template>

<style scoped>
.btn {
  width: 100%;
  padding: 12px;
  border-radius: 20px;
  border: none;
  color: var(--white);
  cursor: pointer;
}
</style>