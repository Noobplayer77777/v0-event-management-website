import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar, MapPin, Users, ArrowLeft, Mail } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import type { Event, Profile, Registration } from "@/lib/types"

interface EventDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ClubEventDetailPage({ params }: EventDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || (profile.role !== "club_admin" && profile.role !== "super_admin")) {
    redirect("/dashboard/student")
  }

  const { data: event } = await supabase
    .from("events")
    .select("*, category:categories(*)")
    .eq("id", id)
    .eq("created_by", user.id)
    .single()

  if (!event) {
    notFound()
  }

  const { data: registrations } = await supabase
    .from("registrations")
    .select("*, user:profiles(*)")
    .eq("event_id", id)
    .order("registered_at", { ascending: false })

  const typedEvent = event as Event

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={profile as Profile} />

      <main className="flex-1 container mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/dashboard/club">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{typedEvent.title}</h1>
                <div className="flex items-center gap-2">
                  {typedEvent.category && <Badge variant="outline">{typedEvent.category.name}</Badge>}
                  <Badge
                    variant={
                      typedEvent.status === "approved"
                        ? "default"
                        : typedEvent.status === "pending"
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {typedEvent.status}
                  </Badge>
                </div>
              </div>
              <Button asChild>
                <Link href={`/dashboard/club/events/${id}/edit`}>Edit Event</Link>
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Registrations ({registrations?.length || 0})</CardTitle>
              </CardHeader>
              <CardContent>
                {registrations && registrations.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Registered At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {registrations.map((reg) => {
                        const r = reg as Registration
                        return (
                          <TableRow key={r.id}>
                            <TableCell className="font-medium">{r.user?.full_name || "N/A"}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                {r.user?.email}
                              </div>
                            </TableCell>
                            <TableCell>{format(new Date(r.registered_at), "PPP")}</TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">No registrations yet</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date & Time</p>
                    <p className="font-medium">{format(new Date(typedEvent.date), "PPP 'at' p")}</p>
                  </div>
                </div>

                {typedEvent.location && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/10">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-medium">{typedEvent.location}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Registrations</p>
                    <p className="font-medium">
                      {registrations?.length || 0}
                      {typedEvent.max_capacity && ` / ${typedEvent.max_capacity}`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {typedEvent.description && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{typedEvent.description}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
