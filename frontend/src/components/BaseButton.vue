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
  /* background: linear-gradient(to right, #5f5fff, #7b5cff); */
  color: white;
  cursor: pointer;
}
</style>