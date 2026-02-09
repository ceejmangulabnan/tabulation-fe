// shared/types/strapi-data.ts

// --- Generic Helpers ---

// Basic collection get response
export interface StrapiPopulatedItem {
  id: number
  documentId: string
  createdAt: string
  updatedAt: string
  publishedAt: string | null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

// The generic wrapper for a list response
export interface StrapiListResponse<T> {
  data: T[]
  meta: {
    pagination: {
      page: number
      pageSize: number
      pageCount: number
      total: number
    }
  }
}

// --- Specific Types for Relationships ---
export interface EventData extends StrapiPopulatedItem {
  name: string
  description: string | null
  event_status: 'draft' | 'active' | 'inactive' | 'finished'
  // Relationships
  judges: JudgeData[]
  segments: SegmentData[]
  participants: ParticipantData[]
  scores: ScoreData[]
  judge_requests: JudgeRequestData[]
}

export interface DepartmentData extends StrapiPopulatedItem {
  name: string
}

export interface CategoryData extends StrapiPopulatedItem {
  name: string
  event: EventData
  scores: ScoreData[]
  weight: number
  active: boolean
  locked: boolean
  active_judges: JudgeData[]
  segment: SegmentData
}

export interface ScoreData extends StrapiPopulatedItem {
  value: number
  event: EventData
  category: CategoryData
  participant: ParticipantData
  judge: JudgeData
  segment: SegmentData
}

export interface HeadshotFormat {
  ext: string
  url: string
  size: number
  width: number
  height: number
}

export interface HeadshotData extends StrapiPopulatedItem {
  name: string
  alternativeText: string | null
  caption: string | null
  width: number
  height: number
  formats: {
    large: HeadshotFormat
    small: HeadshotFormat
    medium: HeadshotFormat
    thumbnail: HeadshotFormat
  }
  url: string
}

export interface JudgeData extends StrapiPopulatedItem {
  name: string
  event: EventData
  judging_categories: CategoryData[]
  users_permissions_user: {
    id: number
    username: string
    email: string
  }
}

export interface JudgeRequestData extends StrapiPopulatedItem {
  event: EventData
  judge: JudgeData
  request_status: 'approved' | 'pending' | 'rejected'
}

// --- Participant Types ---
export interface StrapiMinimalParticipant extends StrapiPopulatedItem {
  name: string
}

export interface ParticipantData extends StrapiPopulatedItem {
  name: string
  number: number
  participant_status: 'active' | 'eliminated'
  gender: 'male' | 'female'
  event: EventData
  department: DepartmentData
  headshot: HeadshotData
  scores: ScoreData[]
  eliminated_at_segment: SegmentData
  notes: string
}

export interface SegmentData extends StrapiPopulatedItem {
  name: string
  order: number
  weight: number
  segment_status: 'draft' | 'inactive' | 'active' | 'closed'
  event: EventData
  categories: CategoryData[]
  scores: ScoreData[]
  eliminated_participants: ParticipantData[]
  advancement_type: 'all' | 'top_n' | 'threshold' | 'manual'
  advancement_value: number | null
  scoring_mode: 'normalized' | 'raw_category'
}
