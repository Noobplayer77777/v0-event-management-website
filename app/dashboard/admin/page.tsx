import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PendingEventsTable } from "@/components/admin/pending-events-table"
import { AnalyticsCards } from "@/components/admin/analytics-cards"
import { Calendar, Users, CheckCircle, Clock } from "lucide-react"
import type { Profile } from "@/lib/types"

export default async function AdminDashboard() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || profile.role !== "super_admin") {
    redirect("/dashboard/student")
  }

  // Get analytics data
  const { count: totalEvents } = await supabase.from("events").select("*", { count: "exact", head: true })

  const { count: pendingEvents } = await supabase
    .from("events")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending")

  const { count: approvedEvents } = await supabase
    .from("events")
    .select("*", { count: "exact", head: true })
    .eq("status", "approved")

  const { count: totalRegistrations } = await supabase.from("registrations").select("*", { count: "exact", head: true })

  const { count: totalUsers } = await supabase.from("profiles").select("*", { count: "exact", head: true })

  // Get pending events for review
  const { data: pendingEventsList } = await supabase
    .from("events")
    .select("*, category:categories(*), creator:profiles(*)")
    .eq("status", "pending")
    .order("created_at", { ascending: false })

  // Get all events
  const { data: allEvents } = await supabase
    .from("events")
    .select("*, category:categories(*), creator:profiles(*)")
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={profile as Profile} />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage events and view analytics</p>
        </div>

        {/* Analytics Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Events</p>
                  <p className="text-2xl font-bold">{totalEvents || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-amber-500/10">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                  <p className="text-2xl font-bold">{pendingEvents || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-green-500/10">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Registrations</p>
                  <p className="text-2xl font-bold">{totalRegistrations || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-blue-500/10">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{totalUsers || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">Pending Review ({pendingEvents || 0})</TabsTrigger>
            <TabsTrigger value="all">All Events ({totalEvents || 0})</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Events Pending Approval</CardTitle>
              </CardHeader>
              <CardContent>
                <PendingEventsTable events={pendingEventsList || []} isPending />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="all" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>All Events</CardTitle>
              </CardHeader>
              <CardContent>
                <PendingEventsTable events={allEvents || []} isPending={false} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <AnalyticsCards
              totalEvents={totalEvents || 0}
              approvedEvents={approvedEvents || 0}
              pendingEvents={pendingEvents || 0}
              totalRegistrations={totalRegistrations || 0}
              totalUsers={totalUsers || 0}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
