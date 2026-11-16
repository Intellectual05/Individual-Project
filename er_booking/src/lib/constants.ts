export const CARE_PATHWAYS = [
  'Urgent Appendectomy',
  'Acute Trauma Protocol',
  'Cardiac / Stroke Alert',
  'Post-Surgical Recovery',
  'General Admission',
] as const

export const ROOM_TYPES = [
  'ER Bay',
  'X-Ray / CT Scan',
  'Operating Theatre (OT)',
  'ICU',
  'General Ward',
] as const

export const URGENCY_LEVELS = [
  'Critical (Immediate)',
  'Urgent (<30m)',
  'Standard',
] as const

export type CarePathway = (typeof CARE_PATHWAYS)[number]
export type RoomType = (typeof ROOM_TYPES)[number]
export type UrgencyLevel = (typeof URGENCY_LEVELS)[number]

export interface JourneyTemplate {
  id: string
  label: string
  carePathway: CarePathway
  roomType: RoomType
  roomNumber: string
  urgencyLevel: UrgencyLevel
}

export const JOURNEY_TEMPLATES: JourneyTemplate[] = [
  {
    id: 'appendectomy',
    label: 'Urgent Appendectomy',
    carePathway: 'Urgent Appendectomy',
    roomType: 'X-Ray / CT Scan',
    roomNumber: 'RAD-02',
    urgencyLevel: 'Critical (Immediate)',
  },
  {
    id: 'trauma',
    label: 'Acute Trauma Triage',
    carePathway: 'Acute Trauma Protocol',
    roomType: 'ER Bay',
    roomNumber: 'ER-01',
    urgencyLevel: 'Critical (Immediate)',
  },
  {
    id: 'icu-transfer',
    label: 'Post-Op ICU Transfer',
    carePathway: 'Post-Surgical Recovery',
    roomType: 'ICU',
    roomNumber: 'ICU-04',
    urgencyLevel: 'Urgent (<30m)',
  },
]

export const FILTER_ROOM_TYPES: readonly string[] = ['All', ...ROOM_TYPES]
