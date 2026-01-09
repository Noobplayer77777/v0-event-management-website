import { createClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/navbar"
import { RegisterButton } from "@/components/register-button"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, MapPin, Users, ArrowLeft } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { notFound } from "next/navigation"
import type { Event, Profile } from "@/lib/types"

interface EventDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile: Profile | null = null
  if (user) {
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()
    profile = data
  }

  const { data: event } = await supabase
    .from("events")
    .select("*, category:categories(*), creator:profiles(*)")
    .eq("id", id)
    .eq("status", "approved")
    .single()

  if (!event) {
    notFound()
  }

  // Get registration count
  const { count: registrationCount } = await supabase
    .from("registrations")
    .select("*", { count: "exact", head: true })
    .eq("event_id", id)

  // Check if user is registered
  let isRegistered = false
  if (user) {
    const { data: registration } = await supabase
      .from("registrations")
      .select("id")
      .eq("event_id", id)
      .eq("user_id", user.id)
      .single()
    isRegistered = !!registration
  }

  const typedEvent = event as Event
  const isFull = typedEvent.max_capacity ? (registrationCount || 0) >= typedEvent.max_capacity : false

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={profile} />

      <main className="flex-1 container mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/events">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Link>
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="aspect-video bg-muted rounded-lg overflow-hidden">
              {typedEvent.image_url ? (
                <img
                  src={typedEvent.image_url || "/placeholder.svg"}
                  alt={typedEvent.title}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary/20 to-primary/5">
                  <Calendar className="h-16 w-16 text-primary/40" />
                </div>
              )}
            </div>

            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <h1 className="text-3xl font-bold">{typedEvent.title}</h1>
                {typedEvent.category && <Badge variant="outline">{typedEvent.category.name}</Badge>}
              </div>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {typedEvent.description || "No description available for this event."}
              </p>
            </div>
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
                      {registrationCount || 0}
                      {typedEvent.max_capacity && ` / ${typedEvent.max_capacity}`}
                      {isFull && <span className="text-destructive ml-2">(Full)</span>}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <RegisterButton
                    eventId={typedEvent.id}
                    isLoggedIn={!!user}
                    isRegistered={isRegistered}
                    isFull={isFull}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
