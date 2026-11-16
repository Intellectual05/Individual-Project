<script setup lang="ts">
import {
  ArrowRight,
  BadgeCheck,
  BedDouble,
  Building2,
  CalendarClock,
  ClipboardList,
  HeartPulse,
  LoaderCircle,
  Sparkles,
  UserRound,
} from 'lucide-vue-next'
import type { RoomBooking } from '@/types'

defineProps<{
  booking: RoomBooking
  fallbackEmail: string
  syncing: boolean
}>()

const emit = defineEmits<{
  (e: 'sync', bookingId: string): void
}>()

function urgencyBadgeClass(level: string) {
  if (level === 'Critical (Immediate)') return 'badge-red'
  if (level === 'Urgent (<30m)') return 'badge-amber'
  return 'badge-blue'
}

function formatDateTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <article class="booking-card card">
    <header class="card-head">
      <div class="patient-block">
        <h3 class="patient-name">{{ booking.patient_name }}</h3>
        <span class="hn-id">HN {{ booking.patient_id }}</span>
      </div>
      <span class="badge" :class="urgencyBadgeClass(booking.urgency_level)">
        {{ booking.urgency_level }}
      </span>
    </header>

    <div class="room-strip">
      <span class="room-badge">
        <BedDouble :size="15" />
        {{ booking.room_type }}
      </span>
      <span class="room-number">
        <Building2 :size="15" />
        {{ booking.room_number }}
      </span>
    </div>

    <dl class="meta">
      <div class="meta-row">
        <dt><ClipboardList :size="14" /> Care Pathway</dt>
        <dd>{{ booking.care_pathway }}</dd>
      </div>
      <div class="meta-row">
        <dt><CalendarClock :size="14" /> Booking Time</dt>
        <dd>{{ formatDateTime(booking.booking_time) }}</dd>
      </div>
      <div class="meta-row">
        <dt><UserRound :size="14" /> Booked By</dt>
        <dd>{{ booking.booked_by }}</dd>
      </div>
    </dl>

    <div v-if="booking.journey_logs && booking.journey_logs.length > 0" class="ai-box">
      <div class="ai-box-head">
        <span class="ai-box-icon"><Sparkles :size="15" /></span>
        <span class="ai-box-title">AI Clinical Coordinator Handoff</span>
        <span class="badge badge-teal">
          <BadgeCheck :size="12" />
          Synced
        </span>
      </div>

      <div class="ai-fields">
        <div class="ai-field">
          <span class="ai-field-label">Department Notified</span>
          <span class="ai-field-value">{{ booking.journey_logs[0]?.department_notified || '—' }}</span>
        </div>
        <div class="ai-field">
          <span class="ai-field-label">AI Prep &amp; Action Taken</span>
          <span class="ai-field-value">{{ booking.journey_logs[0]?.action_taken || '—' }}</span>
        </div>
        <div class="ai-field">
          <span class="ai-field-label">Next Recommended Room</span>
          <span class="ai-field-value ai-next">
            <ArrowRight :size="14" />
            {{ booking.journey_logs[0]?.next_recommended_room || '—' }}
          </span>
        </div>
      </div>

      <p class="ai-alert">
        <HeartPulse :size="13" />
        Personalized care alert emailed to
        <strong>{{ booking.hospital_staff?.email || fallbackEmail }}</strong>
      </p>
    </div>

    <div v-else class="awaiting-box pulse-box">
      <span class="awaiting-dot pulse-dot"></span>
      <span class="awaiting-text">Awaiting Make.com AI Triage sync…</span>
      <button
        class="btn btn-blue awaiting-btn"
        type="button"
        :disabled="syncing"
        @click="emit('sync', booking.id)"
      >
        <LoaderCircle v-if="syncing" :size="14" class="spin" />
        <span>{{ syncing ? 'Syncing…' : 'Sync Now' }}</span>
      </button>
    </div>
  </article>
</template>

<style scoped>
.booking-card {
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  transition: box-shadow 0.15s ease;
}

.booking-card:hover {
  box-shadow: var(--shadow-md);
}

.card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.patient-block {
  min-width: 0;
}

.patient-name {
  margin: 0;
  font-size: 16.5px;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.hn-id {
  display: inline-block;
  margin-top: 3px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  background: var(--slate-soft);
  border: 1px solid var(--border);
  padding: 1px 8px;
  border-radius: 6px;
}

.room-strip {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.room-badge,
.room-number {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 700;
  padding: 6px 10px;
  border-radius: var(--radius-sm);
}

.room-badge {
  background: var(--blue-soft);
  color: var(--blue-dark);
  border: 1px solid #bae6fd;
}

.room-number {
  background: var(--slate-soft);
  color: var(--text);
  border: 1px solid var(--border-strong);
}

.meta {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: #fbfdff;
}

.meta-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.meta-row dt {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--text-muted);
  flex-shrink: 0;
}

.meta-row dd {
  margin: 0;
  font-size: 13.5px;
  font-weight: 600;
  text-align: right;
  word-break: break-word;
}

.ai-box {
  border: 1px solid #99f6e4;
  border-radius: var(--radius-sm);
  background: linear-gradient(180deg, var(--teal-soft), #ffffff);
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ai-box-head {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ai-box-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 8px;
  background: var(--teal);
  color: #fff;
}

.ai-box-title {
  font-size: 13.5px;
  font-weight: 700;
  flex: 1;
  color: var(--teal-dark);
}

.ai-fields {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ai-field {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ai-field-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-muted);
}

.ai-field-value {
  font-size: 13.5px;
  color: var(--text);
}

.ai-next {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 700;
  color: var(--teal-dark);
}

.ai-alert {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  font-size: 12.5px;
  color: var(--text-muted);
  border-top: 1px dashed #99f6e4;
  padding-top: 10px;
}

.ai-alert svg {
  color: var(--red);
}

.ai-alert strong {
  color: var(--teal-dark);
}

.awaiting-box {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--slate-soft);
}

.awaiting-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--blue);
  flex-shrink: 0;
}

.awaiting-text {
  flex: 1;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
}

.awaiting-btn {
  padding: 7px 12px;
  font-size: 12.5px;
}
</style>
