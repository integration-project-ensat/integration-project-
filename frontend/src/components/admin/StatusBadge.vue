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
  background: #fff7ed;
  color: #ea580c;
}
.status-badge.completed {
  background: #ecfdf5;
  color: #16a34a;
}
.status-badge.cancelled {
  background: #fef2f2;
  color: #dc2626;
}
.status-badge.verified {
  background: #eff6ff;
  color: #2563eb;
}
</style>