<template>
  <span
    data-cy="status-badge"
    :class="['status-badge', `status-${status}`]"
    :style="{ color: colorMap[status] ?? 'gray' }"
  >
    {{ label }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: String,
    required: true
  }
})

const labelMap = {
  pending:  'En attente',
  approved: 'Approuvé',
  rejected: 'Rejeté'
}

const colorMap = {
  pending:  'orange',
  approved: 'green',
  rejected: 'red'
}

const label = computed(() => labelMap[props.status] ?? props.status)
</script>

<style scoped>
.status-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 0.85em;
  font-weight: 600;
}
.status-pending  { background: #fff3e0; color: orange; }
.status-approved { background: #e8f5e9; color: green;  }
.status-rejected { background: #ffebee; color: red;    }
</style>
