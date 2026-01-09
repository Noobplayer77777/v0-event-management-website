import { createClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/navbar"
import { EventCard } from "@/components/event-card"
import { EventFilters } from "@/components/event-filters"
import type { Event, Profile, Category } from "@/lib/types"
import { Calendar } from "lucide-react"

interface EventsPageProps {
  searchParams: Promise<{ category?: string; date?: string }>
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const params = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile: Profile | null = null
  if (user) {
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()
    profile = data
  }

  const { data: categories } = await supabase.from("categories").select("*").order("name")

  let query = supabase
    .from("events")
    .select("*, category:categories(*)")
    .eq("status", "approved")
    .gte("date", new Date().toISOString())
    .order("date", { ascending: true })

  if (params.category) {
    query = query.eq("category_id", params.category)
  }

  if (params.date) {
    const startDate = new Date(params.date)
    const endDate = new Date(params.date)
    endDate.setDate(endDate.getDate() + 1)
    query = query.gte("date", startDate.toISOString()).lt("date", endDate.toISOString())
  }

  const { data: events } = await query

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={profile} />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Explore Events</h1>
          <p className="text-muted-foreground">Discover exciting events happening on campus</p>
        </div>

        <EventFilters categories={(categories || []) as Category[]} />

        {events && events.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event as Event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No events found</p>
            <p className="text-sm">Try adjusting your filters or check back later</p>
          </div>
        )}
      </main>
    </div>
  )
}
