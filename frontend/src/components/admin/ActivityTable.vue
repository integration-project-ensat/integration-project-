<template>
  <div class="activity-card">
    <div class="activity-header">
      <div>
        <h3 class="section-title">Activité récente</h3>
        <p class="section-sub">Dernières actions et soumissions sur la plateforme</p>
      </div>
      <div class="header-actions">
        <button class="btn-outline" @click="showAllActivities = !showAllActivities">
  {{ showAllActivities ? 'Réduire' : 'Voir tout' }}
</button>

<button class="btn-outline" @click="goToHistory">
  <Clock :size="14" />
  Historique
</button>
      </div>
    </div>
 
    <table class="activity-table">
      <thead>
        <tr>
          <th>Utilisateur</th>
          <th>Action</th>
          <th>Date</th>
          <th>Statut</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in displayedActivities" :key="item.id" class="activity-row">
          <td>
            <div class="user-cell">
              <div class="avatar" :style="{ background: item.avatarColor }">
                {{ initials(item.name) }}
              </div>
              <div>
                <p class="user-name">{{ item.name }}</p>
                <p class="user-email">{{ item.email }}</p>
              </div>
            </div>
          </td>
          <td class="action-cell">{{ item.action }}</td>
          <td class="date-cell">{{ item.date }}</td>
          <td>
            <StatusBadge :status="item.status" />
          </td>
          <td>
            <button class="action-btn">
              <MoreHorizontal :size="16" />
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
 
<script setup>
import { ref, computed } from 'vue'
import { Clock, MoreHorizontal } from 'lucide-vue-next'
import StatusBadge from './StatusBadge.vue'

const props = defineProps({
  activities: {
    type: Array,
    default: () => []
  }
})

const showAllActivities = ref(false)

const displayedActivities = computed(() =>
  showAllActivities.value
    ? props.activities
    : props.activities.slice(0, 5)
)

const goToHistory = () => {
  document
    .getElementById('connexion-history')
    ?.scrollIntoView({ behavior: 'smooth' })
}

const initials = (name) =>
  name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
</script>
 
<style scoped>
.activity-card {
  background: #fff;
  border: 1px solid #e8eaf0;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  padding: 24px;
}
 
.activity-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
  gap: 12px;
  flex-wrap: wrap;
}
 
.section-title {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 2px;
}
.section-sub {
  font-size: 12.5px;
  color: #94a3b8;
  margin: 0;
}
 
.header-actions {
  display: flex;
  gap: 8px;
}
 
.btn-outline {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 7px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: transparent;
  font-size: 12.5px;
  font-weight: 500;
  color: #475569;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-outline:hover {
  background: #f8fafc;
}
 
.activity-table {
  width: 100%;
  border-collapse: collapse;
}
 
.activity-table thead tr {
  border-bottom: 1px solid #f1f5f9;
}
 
.activity-table th {
  text-align: left;
  padding: 10px 12px;
  font-size: 11.5px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
 
.activity-row {
  border-bottom: 1px solid #f8fafc;
  transition: background 0.15s;
}
.activity-row:last-child {
  border-bottom: none;
}
.activity-row:hover {
  background: #fafbff;
}
 
.activity-table td {
  padding: 14px 12px;
  vertical-align: middle;
}
 
.user-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}
 
.avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: #334155;
  flex-shrink: 0;
}
 
.user-name {
  font-size: 13.5px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 2px;
}
.user-email {
  font-size: 11.5px;
  color: #94a3b8;
  margin: 0;
}
 
.action-cell {
  font-size: 13px;
  color: #475569;
}
 
.date-cell {
  font-size: 12.5px;
  color: #94a3b8;
  white-space: nowrap;
}
 
.action-btn {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  transition: background 0.15s, color 0.15s;
}
.action-btn:hover {
  background: #f1f5f9;
  color: #475569;
}
</style>