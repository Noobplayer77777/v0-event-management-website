import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { EventForm } from "@/components/event-form"
import { DeleteEventButton } from "@/components/delete-event-button"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { Profile, Category, Event } from "@/lib/types"

interface EditEventPageProps {
  params: Promise<{ id: string }>
}

export default async function EditEventPage({ params }: EditEventPageProps) {
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

  const { data: event } = await supabase.from("events").select("*, category:categories(*)").eq("id", id).single()

  // Check ownership (club admin can only edit own events)
  if (!event || (profile.role === "club_admin" && event.created_by !== user.id)) {
    notFound()
  }

  const { data: categories } = await supabase.from("categories").select("*").order("name")

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={profile as Profile} />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
        <Button variant="ghost" asChild className="mb-6">
          <Link href={`/dashboard/club/events/${id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Event
          </Link>
        </Button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Edit Event</h1>
            <p className="text-muted-foreground">Update your event details</p>
          </div>
          <DeleteEventButton eventId={id} />
        </div>

        <EventForm categories={(categories || []) as Category[]} event={event as Event} />
      </main>
    </div>
  )
}
