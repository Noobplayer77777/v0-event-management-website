export type UserRole = "student" | "club_admin" | "super_admin"

export interface Profile {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  created_at: string
}

export interface Event {
  id: string
  title: string
  description: string | null
  category_id: string | null
  date: string
  location: string | null
  max_capacity: number | null
  image_url: string | null
  status: "pending" | "approved" | "rejected"
  created_by: string
  created_at: string
  updated_at: string
  category?: Category
  creator?: Profile
  registration_count?: number
}

export interface Registration {
  id: string
  event_id: string
  user_id: string
  registered_at: string
  event?: Event
  user?: Profile
}
