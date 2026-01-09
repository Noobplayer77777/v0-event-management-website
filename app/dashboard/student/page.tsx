import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { EventCard } from "@/components/event-card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Ticket } from "lucide-react"
import Link from "next/link"
import type { Event, Profile } from "@/lib/types"

export default async function StudentDashboard() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile) redirect("/auth/login")

  // Redirect club admins and super admins to their dashboards
  if (profile.role === "super_admin") redirect("/dashboard/admin")
  if (profile.role === "club_admin") redirect("/dashboard/club")

  // Get user's registered events
  const { data: registrations } = await supabase
    .from("registrations")
    .select("*, event:events(*, category:categories(*))")
    .eq("user_id", user.id)
    .order("registered_at", { ascending: false })

  const upcomingEvents = registrations?.filter((r) => r.event && new Date(r.event.date) >= new Date()) || []

  const pastEvents = registrations?.filter((r) => r.event && new Date(r.event.date) < new Date()) || []

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={profile as Profile} />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {profile.full_name || profile.email}</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-primary/10 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <Ticket className="h-5 w-5 text-primary" />
              <span className="font-medium">Registered Events</span>
            </div>
            <p className="text-3xl font-bold">{registrations?.length || 0}</p>
          </div>
          <div className="bg-primary/10 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span className="font-medium">Upcoming Events</span>
            </div>
            <p className="text-3xl font-bold">{upcomingEvents.length}</p>
          </div>
        </div>

        <Tabs defaultValue="upcoming">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming ({upcomingEvents.length})</TabsTrigger>
            <TabsTrigger value="past">Past ({pastEvents.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="upcoming" className="mt-6">
            {upcomingEvents.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingEvents.map((reg) => (
                  <EventCard key={reg.id} event={reg.event as Event} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No upcoming events</p>
                <Button asChild className="mt-4">
                  <Link href="/events">Browse Events</Link>
                </Button>
              </div>
            )}
          </TabsContent>
          <TabsContent value="past" className="mt-6">
            {pastEvents.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {pastEvents.map((reg) => (
                  <EventCard key={reg.id} event={reg.event as Event} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No past events</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
