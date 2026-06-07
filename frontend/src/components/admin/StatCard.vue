<template>
  <div class="stat-card">
    <div class="stat-header">
      <div class="stat-icon">
        <component :is="icon" :size="20" />
      </div>
      <span class="stat-badge" :class="trend >= 0 ? 'positive' : 'negative'">
        <component :is="trend >= 0 ? TrendingUp : TrendingDown" :size="12" />
        {{ trend >= 0 ? '+' : '' }}{{ trend }}%
      </span>
    </div>
    <div class="stat-body">
      <p class="stat-label">{{ label }}</p>
      <p class="stat-value">{{ formattedValue }}</p>
    </div>
  </div>
</template>
 
<script setup>
import { computed } from 'vue'
import { TrendingUp, TrendingDown } from 'lucide-vue-next'
 
const props = defineProps({
  label: { type: String, required: true },
  value: { type: Number, required: true },
  trend: { type: Number, default: 0 },
  icon: { type: [Object, Function], required: true },
})
 
const formattedValue = computed(() =>
  props.value.toLocaleString('fr-FR')
)
</script>
 
<style scoped>
.stat-card {
  background: #fff;
  border: 1px solid #e8eaf0;
  border-radius: 14px;
  padding: 20px 22px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  flex: 1;
  min-width: 0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  transition: box-shadow 0.2s, transform 0.2s;
}
.stat-card:hover {
 box-shadow: 0 4px 20px rgba(99,102,241,0.12), 0 1px 4px rgba(0,0,0,0.06);
 transform: translateY(-1px);
}
 
.stat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
 
.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #f0f1ff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6366f1;
}
 
.stat-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 20px;
}
.stat-badge.positive {
  background: #ecfdf5;
  color: #16a34a;
}
.stat-badge.negative {
  background: #fef2f2;
  color: #dc2626;
}
 
.stat-label {
  font-size: 12.5px;
  color: #94a3b8;
  font-weight: 500;
  margin: 0 0 4px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.5px;
}
</style>