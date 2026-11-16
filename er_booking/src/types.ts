export interface HospitalStaff {
  id: string
  staff_code: string
  full_name: string
  role: string
  department: string
  email: string
}

export interface JourneyLog {
  id: string
  created_at: string
  booking_id: string
  department_notified: string
  action_taken: string
  next_recommended_room: string
}

export interface RoomBooking {
  id: string
  created_at: string
  patient_id: string
  patient_name: string
  care_pathway: string
  room_type: string
  room_number: string
  urgency_level: string
  booked_by: string
  staff_id: string
  booking_time: string
  status: string
  journey_logs: JourneyLog[]
  hospital_staff: {
    full_name: string
    role: string
    email: string
  } | null
}

export interface NewRoomBooking {
  patient_id: string
  patient_name: string
  care_pathway: string
  room_type: string
  room_number: string
  urgency_level: string
  booked_by: string
  staff_id: string
  booking_time: string
  status: string
}
