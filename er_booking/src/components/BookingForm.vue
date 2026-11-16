<script setup lang="ts">
import { ref, watch } from 'vue'
import { CalendarClock, LoaderCircle, Sparkles, User, Wand2 } from 'lucide-vue-next'
import {
  CARE_PATHWAYS,
  JOURNEY_TEMPLATES,
  ROOM_TYPES,
  URGENCY_LEVELS,
} from '@/lib/constants'
import type { HospitalStaff, NewRoomBooking } from '@/types'

const props = defineProps<{
  staff: HospitalStaff
  submitting: boolean
  resetToken: number
}>()

const emit = defineEmits<{
  (e: 'submit', payload: NewRoomBooking): void
}>()

const patientId = ref('')
const patientName = ref('')
const carePathway = ref<string>('General Admission')
const roomType = ref<string>('ER Bay')
const roomNumber = ref('')
const urgencyLevel = ref<string>('Standard')
const bookingTime = ref(toLocalInputValue(new Date()))
const activeTemplateId = ref<string | null>(null)

watch(
  () => props.resetToken,
  () => {
    patientId.value = ''
    patientName.value = ''
    activeTemplateId.value = null
  },
)

function toLocalInputValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`
}

function applyTemplate(id: string) {
  const template = JOURNEY_TEMPLATES.find((item) => item.id === id)
  if (!template) return
  carePathway.value = template.carePathway
  roomType.value = template.roomType
  roomNumber.value = template.roomNumber
  urgencyLevel.value = template.urgencyLevel
  activeTemplateId.value = id
}

function submitForm() {
  if (!patientId.value.trim() || !patientName.value.trim() || !roomNumber.value.trim()) return

  emit('submit', {
    patient_id: patientId.value.trim(),
    patient_name: patientName.value.trim(),
    care_pathway: carePathway.value,
    room_type: roomType.value,
    room_number: roomNumber.value.trim(),
    urgency_level: urgencyLevel.value,
    booked_by: `${props.staff.full_name} (${props.staff.staff_code})`,
    staff_id: props.staff.id,
    booking_time: new Date(bookingTime.value).toISOString(),
    status: 'Confirmed',
  })
}
</script>

<template>
  <section class="booking-form card">
    <div class="form-heading">
      <span class="heading-icon"><Wand2 :size="18" /></span>
      <div>
        <h2 class="form-title">Patient Journey Room Booking</h2>
        <p class="form-subtitle">Allocate a care pathway and room for an incoming patient.</p>
      </div>
    </div>

    <div class="templates">
      <span class="templates-label">
        <Sparkles :size="13" />
        Quick-Select Patient Journey
      </span>
      <div class="chips">
        <button
          v-for="template in JOURNEY_TEMPLATES"
          :key="template.id"
          type="button"
          class="chip"
          :class="{ 'is-active': activeTemplateId === template.id }"
          @click="applyTemplate(template.id)"
        >
          {{ template.label }}
        </button>
      </div>
    </div>

    <form class="fields" @submit.prevent="submitForm">
      <div class="field">
        <label class="field-label" for="patient-id">Patient ID</label>
        <input
          id="patient-id"
          v-model="patientId"
          class="input"
          type="text"
          placeholder="e.g., HN-2026-4092"
          required
        />
      </div>

      <div class="field">
        <label class="field-label" for="patient-name">Patient Name</label>
        <input
          id="patient-name"
          v-model="patientName"
          class="input"
          type="text"
          placeholder="e.g., Somchai Jaidee"
          required
        />
      </div>

      <div class="field">
        <label class="field-label" for="care-pathway">Care Pathway</label>
        <select id="care-pathway" v-model="carePathway" class="select">
          <option v-for="pathway in CARE_PATHWAYS" :key="pathway" :value="pathway">
            {{ pathway }}
          </option>
        </select>
      </div>

      <div class="field">
        <label class="field-label" for="room-type">Room Type</label>
        <select id="room-type" v-model="roomType" class="select">
          <option v-for="type in ROOM_TYPES" :key="type" :value="type">{{ type }}</option>
        </select>
      </div>

      <div class="field">
        <label class="field-label" for="room-number">Room Number</label>
        <input
          id="room-number"
          v-model="roomNumber"
          class="input"
          type="text"
          placeholder="e.g., OT-01"
          required
        />
      </div>

      <div class="field">
        <label class="field-label" for="urgency-level">Urgency Level</label>
        <select id="urgency-level" v-model="urgencyLevel" class="select">
          <option v-for="level in URGENCY_LEVELS" :key="level" :value="level">
            {{ level }}
          </option>
        </select>
      </div>

      <div class="field">
        <label class="field-label" for="booking-time">Booking Time</label>
        <div class="datetime-wrap">
          <CalendarClock :size="16" class="datetime-icon" />
          <input
            id="booking-time"
            v-model="bookingTime"
            class="input"
            type="datetime-local"
            required
          />
        </div>
      </div>

      <div class="field field-wide">
        <span class="field-label">Booking Staff</span>
        <div class="staff-readonly">
          <User :size="15" />
          <span>{{ staff.full_name }} ({{ staff.staff_code }})</span>
        </div>
      </div>

      <button class="btn btn-primary submit-btn" type="submit" :disabled="submitting">
        <LoaderCircle v-if="submitting" :size="17" class="spin" />
        <span>{{ submitting ? 'Booking room…' : 'Book Room & Trigger AI Coordinator' }}</span>
      </button>
    </form>
  </section>
</template>

<style scoped>
.booking-form {
  padding: 22px;
  position: sticky;
  top: 80px;
}

.form-heading {
  display: flex;
  gap: 12px;
  margin-bottom: 18px;
}

.heading-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border-radius: 10px;
  background: var(--teal-soft);
  color: var(--teal-dark);
  border: 1px solid #99f6e4;
}

.form-title {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
}

.form-subtitle {
  margin: 2px 0 0;
  font-size: 13px;
  color: var(--text-muted);
}

.templates {
  margin-bottom: 18px;
  padding: 12px 14px;
  background: var(--slate-soft);
  border: 1px dashed var(--border-strong);
  border-radius: var(--radius-sm);
}

.templates-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 8px;
}

.templates-label svg {
  color: var(--teal);
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.field-wide {
  grid-column: 1 / -1;
}

.staff-readonly {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--blue-soft);
  color: var(--blue-dark);
  font-size: 13.5px;
  font-weight: 600;
}

.datetime-wrap {
  position: relative;
}

.datetime-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  pointer-events: none;
}

.datetime-wrap .input {
  padding-left: 36px;
}

.submit-btn {
  grid-column: 1 / -1;
  width: 100%;
  padding: 12px 16px;
  font-size: 15px;
}

@media (max-width: 1024px) {
  .booking-form {
    position: static;
  }
}

@media (max-width: 520px) {
  .fields {
    grid-template-columns: 1fr;
  }
}
</style>
