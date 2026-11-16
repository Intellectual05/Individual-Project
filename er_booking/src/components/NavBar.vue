<script setup lang="ts">
import { LoaderCircle, LogOut, Mail, RefreshCw, Stethoscope } from 'lucide-vue-next'
import type { HospitalStaff } from '@/types'

defineProps<{
  staff: HospitalStaff
  refreshing: boolean
}>()

const emit = defineEmits<{
  (e: 'refresh'): void
  (e: 'logout'): void
}>()

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}
</script>

<template>
  <header class="navbar">
    <div class="navbar-inner">
      <div class="navbar-brand">
        <span class="navbar-mark">
          <Stethoscope :size="20" />
        </span>
        <div class="navbar-titles">
          <h1 class="navbar-title">MediFlow ER</h1>
          <p class="navbar-subtitle">Patient Journey &amp; Room Allocation</p>
        </div>
      </div>

      <div class="navbar-actions">
        <div class="staff-badge">
          <span class="staff-avatar">{{ initials(staff.full_name) }}</span>
          <div class="staff-details">
            <span class="staff-name">{{ staff.full_name }}</span>
            <span class="staff-meta">
              {{ staff.role }} · {{ staff.staff_code }}
            </span>
            <span class="staff-email">
              <Mail :size="12" />
              {{ staff.email }}
            </span>
          </div>
        </div>

        <button
          class="btn btn-secondary"
          type="button"
          :disabled="refreshing"
          @click="emit('refresh')"
        >
          <LoaderCircle v-if="refreshing" :size="16" class="spin" />
          <RefreshCw v-else :size="16" />
          <span class="btn-label">Refresh Data</span>
        </button>

        <button class="btn btn-ghost" type="button" @click="emit('logout')">
          <LogOut :size="16" />
          <span class="btn-label">Switch Staff</span>
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: 20;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
}

.navbar-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.navbar-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: 11px;
  background: linear-gradient(135deg, var(--teal), var(--blue));
  color: #fff;
}

.navbar-titles {
  min-width: 0;
}

.navbar-title {
  margin: 0;
  font-size: 17px;
  font-weight: 800;
  letter-spacing: -0.01em;
  line-height: 1.2;
}

.navbar-subtitle {
  margin: 0;
  font-size: 12px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.staff-badge {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px 6px 8px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--surface);
}

.staff-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--blue-soft);
  color: var(--blue-dark);
  font-size: 12px;
  font-weight: 700;
  border: 1px solid #bae6fd;
  flex-shrink: 0;
}

.staff-details {
  display: flex;
  flex-direction: column;
  line-height: 1.25;
}

.staff-name {
  font-size: 13.5px;
  font-weight: 700;
}

.staff-meta {
  font-size: 12px;
  color: var(--text-muted);
}

.staff-email {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11.5px;
  color: var(--teal-dark);
}

@media (max-width: 860px) {
  .navbar-inner {
    flex-wrap: wrap;
  }

  .staff-details .staff-email {
    display: none;
  }
}

@media (max-width: 640px) {
  .btn-label {
    display: none;
  }

  .btn {
    padding: 9px 11px;
  }

  .staff-details .staff-meta {
    display: none;
  }
}
</style>
