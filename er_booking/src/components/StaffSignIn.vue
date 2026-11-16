<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Building2,
  HeartPulse,
  Hospital,
  LoaderCircle,
  Mail,
  Stethoscope,
  UserRound,
} from 'lucide-vue-next'
import type { HospitalStaff, NewHospitalStaff } from '@/types'

defineProps<{
  staffList: HospitalStaff[]
  loadingList: boolean
  signInLoading: boolean
  registerLoading: boolean
  error: string | null
  registerError: string | null
  configured: boolean
}>()

const emit = defineEmits<{
  (e: 'sign-in-by-email', email: string): void
  (e: 'quick-login', staff: HospitalStaff): void
  (e: 'register', payload: NewHospitalStaff): void
  (e: 'clear-errors'): void
}>()

const mode = ref<'signin' | 'register'>('signin')
const email = ref('')

const regFullName = ref('')
const regStaffCode = ref('')
const regRole = ref('')
const regDepartment = ref('')
const regEmail = ref('')

const canRegister = computed(() => {
  const filled = [
    regFullName.value,
    regStaffCode.value,
    regRole.value,
    regDepartment.value,
    regEmail.value,
  ].every((value) => value.trim().length > 0)
  return filled && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail.value.trim())
})

function switchMode(next: 'signin' | 'register') {
  if (mode.value === next) return
  mode.value = next
  emit('clear-errors')
}

function submitEmail() {
  const value = email.value.trim()
  if (!value) return
  emit('sign-in-by-email', value)
}

function submitRegistration() {
  if (!canRegister.value) return
  emit('register', {
    staff_code: regStaffCode.value.trim(),
    full_name: regFullName.value.trim(),
    role: regRole.value.trim(),
    department: regDepartment.value.trim(),
    email: regEmail.value.trim(),
  })
}

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
  <div class="signin">
    <div class="brand">
      <span class="brand-mark">
        <Hospital :size="30" />
      </span>
      <h1 class="brand-title">MediFlow ER</h1>
      <p class="brand-subtitle">
        <HeartPulse :size="14" class="brand-subtitle-icon" />
        Patient Journey &amp; Room Allocation
      </p>
    </div>

    <section class="signin-card card">
      <div v-if="!configured" class="config-notice">
        <AlertTriangle :size="16" />
        <span>
          Supabase is not configured yet. Add
          <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to a
          <code>.env</code> file (see <code>.env.example</code>).
        </span>
      </div>

      <template v-if="mode === 'signin'">
        <h2 class="signin-heading">Hospital Staff Sign-In</h2>
        <p class="signin-hint">
          Enter your hospital email, or pick a quick demo profile below to begin.
        </p>

        <form class="email-form" @submit.prevent="submitEmail">
          <label class="field-label" for="staff-email">Hospital Email</label>
          <div class="email-row">
            <div class="email-input-wrap">
              <Mail :size="16" class="email-icon" />
              <input
                id="staff-email"
                v-model="email"
                class="input"
                type="email"
                autocomplete="email"
                placeholder="e.g., nurse.aya@mediflow.health"
                :disabled="!configured || signInLoading"
              />
            </div>
            <button
              class="btn btn-primary"
              type="submit"
              :disabled="!configured || signInLoading || !email.trim()"
            >
              <LoaderCircle v-if="signInLoading" :size="16" class="spin" />
              <ArrowRight v-else :size="16" />
              <span>Sign In</span>
            </button>
          </div>
        </form>

        <p v-if="error" class="signin-error" role="alert">
          <AlertTriangle :size="15" />
          {{ error }}
        </p>

        <div class="divider"><span>or</span></div>

        <div class="demo-heading">
          <span>Quick Staff Demo Login</span>
          <span class="demo-count">{{ staffList.length }}</span>
        </div>

        <div v-if="loadingList" class="demo-loading">
          <LoaderCircle :size="18" class="spin" />
          <span>Loading staff directory…</span>
        </div>

        <div v-else class="demo-list">
          <button
            v-for="staff in staffList"
            :key="staff.id"
            class="staff-row"
            type="button"
            :disabled="!configured"
            @click="emit('quick-login', staff)"
          >
            <span class="avatar">{{ initials(staff.full_name) }}</span>
            <span class="staff-info">
              <span class="staff-name">{{ staff.full_name }}</span>
              <span class="staff-meta">{{ staff.role }} · {{ staff.staff_code }}</span>
            </span>
            <ArrowRight :size="16" class="staff-arrow" />
          </button>
          <p v-if="staffList.length === 0" class="demo-empty">
            No staff profiles found in the <code>hospital_staff</code> table yet.
          </p>
        </div>

        <div class="mode-switch">
          <span>New to MediFlow ER?</span>
          <button class="mode-link" type="button" @click="switchMode('register')">
            <UserRound :size="14" />
            Register as Hospital Staff
          </button>
        </div>
      </template>

      <template v-else>
        <h2 class="signin-heading">Hospital Staff Registration</h2>
        <p class="signin-hint">
          Create a staff profile. Your record will be saved to the
          <code>hospital_staff</code> database.
        </p>

        <form class="register-form" @submit.prevent="submitRegistration">
          <div class="field">
            <label class="field-label" for="reg-full-name">Full Name</label>
            <div class="register-input-wrap">
              <UserRound :size="16" class="register-input-icon" />
              <input
                id="reg-full-name"
                v-model="regFullName"
                class="input"
                type="text"
                autocomplete="name"
                placeholder="e.g., Aya Nakamura"
                :disabled="!configured || registerLoading"
                required
              />
            </div>
          </div>

          <div class="field">
            <label class="field-label" for="reg-staff-code">Staff Code</label>
            <div class="register-input-wrap">
              <BadgeCheck :size="16" class="register-input-icon" />
              <input
                id="reg-staff-code"
                v-model="regStaffCode"
                class="input"
                type="text"
                placeholder="e.g., RN-204"
                :disabled="!configured || registerLoading"
                required
              />
            </div>
          </div>

          <div class="field">
            <label class="field-label" for="reg-role">Role</label>
            <div class="register-input-wrap">
              <Stethoscope :size="16" class="register-input-icon" />
              <input
                id="reg-role"
                v-model="regRole"
                class="input"
                type="text"
                placeholder="e.g., Registered Nurse"
                :disabled="!configured || registerLoading"
                required
              />
            </div>
          </div>

          <div class="field">
            <label class="field-label" for="reg-department">Department</label>
            <div class="register-input-wrap">
              <Building2 :size="16" class="register-input-icon" />
              <input
                id="reg-department"
                v-model="regDepartment"
                class="input"
                type="text"
                placeholder="e.g., Emergency"
                :disabled="!configured || registerLoading"
                required
              />
            </div>
          </div>

          <div class="field">
            <label class="field-label" for="reg-email">Hospital Email</label>
            <div class="register-input-wrap">
              <Mail :size="16" class="register-input-icon" />
              <input
                id="reg-email"
                v-model="regEmail"
                class="input"
                type="email"
                autocomplete="email"
                placeholder="e.g., nurse.aya@mediflow.health"
                :disabled="!configured || registerLoading"
                required
              />
            </div>
          </div>

          <p v-if="registerError" class="signin-error" role="alert">
            <AlertTriangle :size="15" />
            {{ registerError }}
          </p>

          <button
            class="btn btn-primary register-btn"
            type="submit"
            :disabled="!configured || registerLoading || !canRegister"
          >
            <LoaderCircle v-if="registerLoading" :size="16" class="spin" />
            <UserRound v-else :size="16" />
            <span>{{ registerLoading ? 'Creating profile…' : 'Create Staff Account' }}</span>
          </button>
        </form>

        <div class="mode-switch">
          <span>Already registered?</span>
          <button class="mode-link" type="button" @click="switchMode('signin')">
            <ArrowRight :size="14" />
            Back to Staff Sign-In
          </button>
        </div>
      </template>
    </section>
  </div>
</template>

<style scoped>
.signin {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 28px;
  padding: 32px 16px;
  background:
    radial-gradient(1000px 420px at 50% -80px, rgba(13, 148, 136, 0.12), transparent 60%),
    var(--bg);
}

.brand {
  text-align: center;
}

.brand-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 58px;
  height: 58px;
  border-radius: 16px;
  background: linear-gradient(135deg, var(--teal), var(--blue));
  color: #fff;
  box-shadow: 0 8px 20px rgba(13, 148, 136, 0.28);
}

.brand-title {
  margin: 14px 0 2px;
  font-size: 30px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--text);
}

.brand-subtitle {
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--text-muted);
}

.brand-subtitle-icon {
  color: var(--teal);
}

.signin-card {
  width: 100%;
  max-width: 520px;
  padding: 28px;
}

.signin-heading {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
}

.signin-hint {
  margin: 6px 0 20px;
  font-size: 14px;
  color: var(--text-muted);
}

.config-notice {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 12px 14px;
  margin-bottom: 18px;
  border: 1px solid #fde68a;
  border-radius: var(--radius-sm);
  background: var(--amber-soft);
  color: #92400e;
  font-size: 13px;
  line-height: 1.5;
}

.config-notice code {
  background: rgba(0, 0, 0, 0.06);
  padding: 1px 5px;
  border-radius: 4px;
  font-size: 12px;
}

.email-form {
  margin-bottom: 14px;
}

.email-row {
  display: flex;
  gap: 10px;
  margin-top: 6px;
}

.email-input-wrap {
  position: relative;
  flex: 1;
}

.email-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  pointer-events: none;
}

.email-input-wrap .input {
  padding-left: 36px;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.register-input-wrap {
  position: relative;
}

.register-input-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  pointer-events: none;
}

.register-input-wrap .input {
  padding-left: 36px;
}

.register-btn {
  width: 100%;
  padding: 12px 16px;
  font-size: 15px;
}

.mode-switch {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
  font-size: 13px;
  color: var(--text-muted);
}

.mode-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: none;
  background: transparent;
  color: var(--teal-dark);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  padding: 0;
}

.mode-link:hover {
  color: var(--teal);
  text-decoration: underline;
}

.signin-error {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 14px;
  padding: 10px 12px;
  border: 1px solid #fecaca;
  border-radius: var(--radius-sm);
  background: var(--red-soft);
  color: var(--red-dark);
  font-size: 13px;
}

.divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 18px 0 14px;
  color: var(--text-muted);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border);
}

.demo-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 8px;
}

.demo-count {
  font-size: 11px;
  font-weight: 700;
  color: var(--teal-dark);
  background: var(--teal-soft);
  border: 1px solid #99f6e4;
  padding: 1px 8px;
  border-radius: 999px;
}

.demo-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 22px 0;
  color: var(--text-muted);
  font-size: 14px;
}

.demo-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
}

.staff-row {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 12px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  text-align: left;
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease;
}

.staff-row:hover:not(:disabled) {
  border-color: var(--teal);
  background: var(--teal-soft);
}

.staff-row:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  border-radius: 50%;
  background: var(--blue-soft);
  color: var(--blue-dark);
  font-size: 13px;
  font-weight: 700;
  border: 1px solid #bae6fd;
}

.staff-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

.staff-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}

.staff-meta {
  font-size: 12.5px;
  color: var(--text-muted);
}

.staff-arrow {
  color: var(--text-muted);
  flex-shrink: 0;
}

.demo-empty {
  margin: 0;
  padding: 14px;
  border: 1px dashed var(--border-strong);
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  font-size: 13px;
  text-align: center;
}

@media (max-width: 560px) {
  .email-row {
    flex-direction: column;
  }

  .email-row .btn {
    width: 100%;
  }
}
</style>
