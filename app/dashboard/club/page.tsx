import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { EventCard } from "@/components/event-card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Plus, Clock, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import type { Event, Profile } from "@/lib/types"

export default async function ClubDashboard() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || (profile.role !== "club_admin" && profile.role !== "super_admin")) {
    redirect("/dashboard/student")
  }

  // Get events created by this user with registration counts
  const { data: events } = await supabase
    .from("events")
    .select("*, category:categories(*)")
    .eq("created_by", user.id)
    .order("created_at", { ascending: false })

  // Get registration counts for each event
  const eventsWithCounts = await Promise.all(
    (events || []).map(async (event) => {
      const { count } = await supabase
        .from("registrations")
        .select("*", { count: "exact", head: true })
        .eq("event_id", event.id)
      return { ...event, registration_count: count || 0 }
    }),
  )

  const pendingEvents = eventsWithCounts.filter((e) => e.status === "pending")
  const approvedEvents = eventsWithCounts.filter((e) => e.status === "approved")
  const rejectedEvents = eventsWithCounts.filter((e) => e.status === "rejected")

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={profile as Profile} />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Club Dashboard</h1>
            <p className="text-muted-foreground">Manage your events and view registrations</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/club/create">
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Link>
          </Button>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-amber-500/10 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="h-5 w-5 text-amber-600" />
              <span className="font-medium">Pending</span>
            </div>
            <p className="text-3xl font-bold">{pendingEvents.length}</p>
          </div>
          <div className="bg-green-500/10 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium">Approved</span>
            </div>
            <p className="text-3xl font-bold">{approvedEvents.length}</p>
          </div>
          <div className="bg-red-500/10 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <span className="font-medium">Rejected</span>
            </div>
            <p className="text-3xl font-bold">{rejectedEvents.length}</p>
          </div>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All ({eventsWithCounts.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingEvents.length})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({approvedEvents.length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({rejectedEvents.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            {eventsWithCounts.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {eventsWithCounts.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event as Event}
                    showStatus
                    actionButton={
                      <div className="flex gap-2 w-full">
                        <Button asChild variant="outline" className="flex-1 bg-transparent">
                          <Link href={`/dashboard/club/events/${event.id}`}>View</Link>
                        </Button>
                        <Button asChild className="flex-1">
                          <Link href={`/dashboard/club/events/${event.id}/edit`}>Edit</Link>
                        </Button>
                      </div>
                    }
                  />
                ))}
              </div>
            ) : (
              <EmptyState />
            )}
          </TabsContent>

          <TabsContent value="pending" className="mt-6">
            {pendingEvents.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event as Event}
                    showStatus
                    actionButton={
                      <div className="flex gap-2 w-full">
                        <Button asChild variant="outline" className="flex-1 bg-transparent">
                          <Link href={`/dashboard/club/events/${event.id}`}>View</Link>
                        </Button>
                        <Button asChild className="flex-1">
                          <Link href={`/dashboard/club/events/${event.id}/edit`}>Edit</Link>
                        </Button>
                      </div>
                    }
                  />
                ))}
              </div>
            ) : (
              <EmptyState message="No pending events" />
            )}
          </TabsContent>

          <TabsContent value="approved" className="mt-6">
            {approvedEvents.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {approvedEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event as Event}
                    showStatus
                    actionButton={
                      <div className="flex gap-2 w-full">
                        <Button asChild variant="outline" className="flex-1 bg-transparent">
                          <Link href={`/dashboard/club/events/${event.id}`}>View</Link>
                        </Button>
                        <Button asChild className="flex-1">
                          <Link href={`/dashboard/club/events/${event.id}/edit`}>Edit</Link>
                        </Button>
                      </div>
                    }
                  />
                ))}
              </div>
            ) : (
              <EmptyState message="No approved events" />
            )}
          </TabsContent>

          <TabsContent value="rejected" className="mt-6">
            {rejectedEvents.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {rejectedEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event as Event}
                    showStatus
                    actionButton={
                      <div className="flex gap-2 w-full">
                        <Button asChild variant="outline" className="flex-1 bg-transparent">
                          <Link href={`/dashboard/club/events/${event.id}`}>View</Link>
                        </Button>
                        <Button asChild className="flex-1">
                          <Link href={`/dashboard/club/events/${event.id}/edit`}>Edit</Link>
                        </Button>
                      </div>
                    }
                  />
                ))}
              </div>
            ) : (
              <EmptyState message="No rejected events" />
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

function EmptyState({ message = "No events yet" }: { message?: string }) {
  return (
    <div className="text-center py-12 text-muted-foreground">
      <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
      <p>{message}</p>
      <Button asChild className="mt-4">
        <Link href="/dashboard/club/create">Create Your First Event</Link>
      </Button>
    </div>
  )
}
