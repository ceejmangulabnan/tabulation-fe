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
}

export interface DepartmentData extends StrapiPopulatedItem {
  name: string
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

// --- Participant Types ---
export interface StrapiMinimalParticipant extends StrapiPopulatedItem {
  name: string
}

export interface StrapiFullParticipant extends StrapiPopulatedItem {
  name: string
  event: EventData
  department: DepartmentData
  headshot: HeadshotData
}
