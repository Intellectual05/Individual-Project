<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { AlertTriangle, CheckCircle2, Inbox, LoaderCircle, ShieldAlert, Sparkles, Users, X } from 'lucide-vue-next'
import BookingCard from '@/components/BookingCard.vue'
import BookingForm from '@/components/BookingForm.vue'
import NavBar from '@/components/NavBar.vue'
import StaffSignIn from '@/components/StaffSignIn.vue'
import { FILTER_ROOM_TYPES } from '@/lib/constants'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import type { HospitalStaff, NewRoomBooking, RoomBooking } from '@/types'

const currentStaff = ref<HospitalStaff | null>(null)
const staffList = ref<HospitalStaff[]>([])
const bookings = ref<RoomBooking[]>([])

const loadingList = ref(false)
const signInLoading = ref(false)
const refreshing = ref(false)
const submitting = ref(false)
const syncingId = ref<string | null>(null)

const signInError = ref<string | null>(null)
const confirmation = ref<string | null>(null)
const bookingError = ref<string | null>(null)

const roomFilter = ref('All')
const formResetToken = ref(0)
const pendingTimers = ref<number[]>([])

const stats = computed(() => ({
  total: bookings.value.length,
  critical: bookings.value.filter((b) => b.urgency_level === 'Critical (Immediate)').length,
  aiSynced: bookings.value.filter((b) => b.journey_logs && b.journey_logs.length > 0).length,
}))

const filteredBookings = computed(() => {
  if (roomFilter.value === 'All') return bookings.value
  return bookings.value.filter((b) => b.room_type === roomFilter.value)
})

onMounted(() => {
  const stored = localStorage.getItem('mediflow_staff')
  if (stored) {
    try {
      currentStaff.value = JSON.parse(stored) as HospitalStaff
    } catch {
      currentStaff.value = null
    }
  }

  void fetchStaffList()
  if (currentStaff.value) {
    void fetchBookings()
  }
})

onUnmounted(() => {
  pendingTimers.value.forEach((id) => window.clearTimeout(id))
  pendingTimers.value = []
})

function persistStaff(staff: HospitalStaff) {
  localStorage.setItem('mediflow_staff', JSON.stringify(staff))
}

async function fetchStaffList() {
  if (!isSupabaseConfigured) return
  loadingList.value = true
  try {
    const { data, error } = await supabase.from('hospital_staff').select('*').order('full_name')
    if (!error) {
      staffList.value = (data as HospitalStaff[]) ?? []
    }
  } catch (err) {
    console.error('Failed to load staff directory:', err)
  } finally {
    loadingList.value = false
  }
}

async function fetchBookings(options?: { silent?: boolean }) {
  if (!isSupabaseConfigured || !currentStaff.value) return
  if (!options?.silent) {
    refreshing.value = true
  }
  try {
    const { data, error } = await supabase
      .from('room_bookings')
      .select('*, journey_logs(*), hospital_staff(full_name, role, email)')
      .order('created_at', { ascending: false })
    if (error) {
      console.error('Failed to load bookings:', error)
      return
    }
    bookings.value = (data as RoomBooking[]) ?? []
  } catch (err) {
    console.error('Failed to load bookings:', err)
  } finally {
    refreshing.value = false
  }
}

async function handleEmailSignIn(email: string) {
  if (!isSupabaseConfigured) return
  signInLoading.value = true
  signInError.value = null
  try {
    const { data, error } = await supabase
      .from('hospital_staff')
      .select('*')
      .eq('email', email)
      .single()

    if (error || !data) {
      signInError.value =
        'No staff member found with that email. Try one of the quick demo profiles below.'
      return
    }

    currentStaff.value = data as HospitalStaff
    persistStaff(data as HospitalStaff)
    void fetchBookings()
  } catch (err) {
    console.error('Sign-in failed:', err)
    signInError.value = 'Unable to sign in. Please check your connection and try again.'
  } finally {
    signInLoading.value = false
  }
}

function handleQuickLogin(staff: HospitalStaff) {
  signInError.value = null
  currentStaff.value = staff
  persistStaff(staff)
  void fetchBookings()
}

function handleLogout() {
  localStorage.removeItem('mediflow_staff')
  currentStaff.value = null
  bookings.value = []
  signInError.value = null
  confirmation.value = null
  bookingError.value = null
  roomFilter.value = 'All'
}

function scheduleRefetch(delay: number) {
  const id = window.setTimeout(() => {
    void fetchBookings({ silent: true })
  }, delay)
  pendingTimers.value.push(id)
}

async function handleSubmitBooking(payload: NewRoomBooking) {
  submitting.value = true
  bookingError.value = null
  confirmation.value = null
  try {
    const { error } = await supabase.from('room_bookings').insert(payload)
    if (error) {
      bookingError.value = `Room booking failed: ${error.message}`
      return
    }

    confirmation.value = `Room booked! Make.com AI Coordinator triggered — generating clinical handoff log and sending personalized care alert to ${
      currentStaff.value?.email ?? 'your email'
    }.`

    formResetToken.value += 1
    await fetchBookings({ silent: true })
    scheduleRefetch(4000)
    scheduleRefetch(8000)
  } catch (err) {
    bookingError.value = err instanceof Error ? err.message : 'Unexpected booking error.'
  } finally {
    submitting.value = false
  }
}

async function handleSyncNow(bookingId: string) {
  if (!isSupabaseConfigured) return
  syncingId.value = bookingId
  try {
    const { data, error } = await supabase
      .from('room_bookings')
      .select('*, journey_logs(*), hospital_staff(full_name, role, email)')
      .eq('id', bookingId)
      .single()

    if (error) {
      console.error('Manual sync failed:', error)
      return
    }

    const updated = data as RoomBooking
    const exists = bookings.value.some((b) => b.id === bookingId)
    bookings.value = exists
      ? bookings.value.map((b) => (b.id === bookingId ? updated : b))
      : [updated, ...bookings.value]
  } catch (err) {
    console.error('Manual sync failed:', err)
  } finally {
    syncingId.value = null
  }
}
</script>

<template>
  <StaffSignIn
    v-if="!currentStaff"
    :staff-list="staffList"
    :loading-list="loadingList"
    :sign-in-loading="signInLoading"
    :error="signInError"
    :configured="isSupabaseConfigured"
    @sign-in-by-email="handleEmailSignIn"
    @quick-login="handleQuickLogin"
  />

  <div v-else class="app-shell">
    <NavBar
      :staff="currentStaff"
      :refreshing="refreshing"
      @refresh="fetchBookings()"
      @logout="handleLogout"
    />

    <main class="dashboard">
      <transition name="banner">
        <div v-if="confirmation" class="banner banner-success" role="status">
          <CheckCircle2 :size="18" />
          <span>{{ confirmation }}</span>
          <button class="banner-close" type="button" aria-label="Dismiss" @click="confirmation = null">
            <X :size="16" />
          </button>
        </div>
      </transition>

      <transition name="banner">
        <div v-if="bookingError" class="banner banner-error" role="alert">
          <AlertTriangle :size="18" />
          <span>{{ bookingError }}</span>
          <button class="banner-close" type="button" aria-label="Dismiss" @click="bookingError = null">
            <X :size="16" />
          </button>
        </div>
      </transition>

      <div class="dashboard-grid">
        <aside class="col-form">
          <BookingForm
            :staff="currentStaff"
            :submitting="submitting"
            :reset-token="formResetToken"
            @submit="handleSubmitBooking"
          />
        </aside>

        <section class="col-board">
          <div class="stats">
            <div class="stat-pill">
              <span class="stat-icon stat-icon-blue"><Users :size="16" /></span>
              <div>
                <div class="stat-value">{{ stats.total }}</div>
                <div class="stat-label">Total Active Bookings</div>
              </div>
            </div>
            <div class="stat-pill">
              <span class="stat-icon stat-icon-red"><ShieldAlert :size="16" /></span>
              <div>
                <div class="stat-value">{{ stats.critical }}</div>
                <div class="stat-label">Critical Cases</div>
              </div>
            </div>
            <div class="stat-pill">
              <span class="stat-icon stat-icon-teal"><Sparkles :size="16" /></span>
              <div>
                <div class="stat-value">{{ stats.aiSynced }}</div>
                <div class="stat-label">AI Triage Logs Synced</div>
              </div>
            </div>
          </div>

          <div class="filters" role="tablist" aria-label="Filter bookings by room type">
            <button
              v-for="type in FILTER_ROOM_TYPES"
              :key="type"
              type="button"
              class="filter-tab"
              :class="{ 'is-active': roomFilter === type }"
              role="tab"
              :aria-selected="roomFilter === type"
              @click="roomFilter = type"
            >
              {{ type }}
              <span v-if="type === 'All'" class="filter-count">{{ bookings.length }}</span>
              <span v-else class="filter-count">
                {{ bookings.filter((b) => b.room_type === type).length }}
              </span>
            </button>
          </div>

          <div v-if="refreshing && bookings.length === 0" class="board-state">
            <LoaderCircle :size="22" class="spin" />
            <span>Loading room allocations…</span>
          </div>

          <div v-else-if="filteredBookings.length === 0" class="board-state">
            <Inbox :size="22" />
            <span>
              {{ bookings.length === 0 ? 'No room bookings yet. Create your first booking on the left.' : 'No bookings match this room type filter.' }}
            </span>
          </div>

          <div v-else class="cards-grid">
            <BookingCard
              v-for="booking in filteredBookings"
              :key="booking.id"
              :booking="booking"
              :fallback-email="currentStaff.email"
              :syncing="syncingId === booking.id"
              @sync="handleSyncNow"
            />
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
}

.dashboard {
  max-width: 1280px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 380px minmax(0, 1fr);
  gap: 20px;
  align-items: start;
}

.col-board {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
}

.banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: var(--radius-sm);
  border: 1px solid;
  font-size: 13.5px;
  line-height: 1.5;
}

.banner-success {
  background: var(--teal-soft);
  border-color: #99f6e4;
  color: #134e4a;
}

.banner-error {
  background: var(--red-soft);
  border-color: #fecaca;
  color: var(--red-dark);
}

.banner-close {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: inherit;
  cursor: pointer;
  padding: 2px;
  border-radius: 6px;
  flex-shrink: 0;
}

.banner-close:hover {
  background: rgba(0, 0, 0, 0.06);
}

.banner-enter-active,
.banner-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}

.banner-enter-from,
.banner-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.stats {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.stat-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 9px;
  flex-shrink: 0;
}

.stat-icon-blue {
  background: var(--blue-soft);
  color: var(--blue-dark);
  border: 1px solid #bae6fd;
}

.stat-icon-red {
  background: var(--red-soft);
  color: var(--red-dark);
  border: 1px solid #fecaca;
}

.stat-icon-teal {
  background: var(--teal-soft);
  color: var(--teal-dark);
  border: 1px solid #99f6e4;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 13px;
  border-radius: 999px;
  border: 1px solid var(--border-strong);
  background: var(--surface);
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease,
    color 0.15s ease;
}

.filter-tab:hover {
  border-color: var(--teal);
  color: var(--teal-dark);
}

.filter-tab.is-active {
  background: var(--teal);
  border-color: var(--teal);
  color: #fff;
}

.filter-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  background: rgba(15, 23, 42, 0.07);
}

.filter-tab.is-active .filter-count {
  background: rgba(255, 255, 255, 0.25);
}

.board-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 48px 24px;
  border: 1px dashed var(--border-strong);
  border-radius: var(--radius);
  background: var(--surface);
  color: var(--text-muted);
  font-size: 14px;
  text-align: center;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

@media (max-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .cards-grid {
    grid-template-columns: 1fr;
  }
}
</style>
