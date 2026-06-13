<template>
  <span class="status-badge" :class="status">
    {{ labels[status] }}
  </span>
</template>
 
<script setup>
defineProps({
  status: {
    type: String,
    required: true,
    validator: (v) => ['pending', 'completed', 'cancelled', 'verified'].includes(v),
  },
})
 
const labels = {
  pending: 'En attente',
  completed: 'Complété',
  cancelled: 'Annulé',
  verified: 'Vérifié',
}
</script>
 
<style scoped>
.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 11.5px;
  font-weight: 600;
  white-space: nowrap;
}
.status-badge.pending {
  background: var(--warning-bg);
  color: var(--warning-strong);
}
.status-badge.completed {
  background: var(--success-bg);
  color: var(--success);
}
.status-badge.cancelled {
  background: var(--danger-bg);
  color: var(--danger);
}
.status-badge.verified {
  background: #eff6ff;
  color: var(--blue);
}
</style>