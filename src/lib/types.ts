export type Profile = {
  id: string
  full_name: string | null
  campus: string | null
  avatar_url: string | null
  allow_messages: boolean
  is_admin: boolean
  created_at: string
}

export type Business = {
  id: string
  owner_id: string
  name: string
  category: string | null
  description: string | null
  email: string | null
  contact_number: string | null
  logo_url: string | null
  is_verified: boolean
  verification_status: 'none' | 'pending' | 'approved' | 'rejected'
  is_paused: boolean
  hub_student_number: string | null
  verification_note: string | null
  verification_requested_at: string | null
  verification_reviewed_at: string | null
  verification_rejection_reason: string | null
  created_at: string
}

export type Listing = {
  id: string
  user_id: string
  business_id: string | null
  title: string
  category: string | null
  price: number | null
  description: string | null
  photo_url: string | null
  campus: string | null
  created_at: string
}

export type Message = {
  id: string
  conversation_id: string
  sender_id: string
  recipient_id: string
  content: string
  read_at: string | null
  created_at: string
}

export type Conversation = {
  id: string
  user_a: string
  user_b: string
  listing_id: string | null
  listing_title: string | null
  listing_photo_url: string | null
  listing_price: number | null
  last_message_at: string | null
  last_message_preview: string | null
  created_at: string
}

export type Report = {
  id: string
  listing_id: string | null
  reported_by: string
  reason: string | null
  note: string | null
  status: 'pending' | 'resolved'
  created_at: string
}

export type Event = {
  id: string
  posted_by: string
  title: string
  description: string | null
  event_date: string | null
  campus: string | null
  poster_url: string | null
  created_at: string
}

export type EduchatMessage = {
  id: string
  user_id: string
  content: string
  created_at: string
  profiles: { full_name: string | null; campus: string | null; avatar_url: string | null } | null
}
