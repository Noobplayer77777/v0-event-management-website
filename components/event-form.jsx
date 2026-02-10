"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"

export function EventForm({ categories, event }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not logged in")

      const eventData = {
        title: formData.get("title"),
        description: formData.get("description"),
        category_id: formData.get("category") || null,
        date: formData.get("date"),
        location: formData.get("location"),
        max_capacity: formData.get("max_capacity") ? Number(formData.get("max_capacity")) : null,
        image_url: formData.get("image_url") || null,
        created_by: user.id,
        status: "pending",
        updated_at: new Date().toISOString(),
      }

      if (event) {
        const { error: updateError } = await supabase
          .from("events")
          .update({
            ...eventData,
            status: event.status,
          })
          .eq("id", event.id)

        if (updateError) throw updateError
      } else {
        const { error: insertError } = await supabase.from("events").insert(eventData)
        if (insertError) throw insertError
      }

      router.push("/dashboard/club")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Event Title *</Label>
            <Input id="title" name="title" required defaultValue={event?.title || ""} placeholder="Enter event title" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={event?.description || ""}
              placeholder="Describe your event"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select name="category" defaultValue={event?.category_id || ""}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="date">Date & Time *</Label>
              <Input
                id="date"
                type="datetime-local"
                name="date"
                required
                defaultValue={event?.date ? event.date.slice(0, 16) : ""}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" name="location" defaultValue={event?.location || ""} placeholder="Event location" />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="max_capacity">Max Capacity</Label>
              <Input
                id="max_capacity"
                type="number"
                name="max_capacity"
                defaultValue={event?.max_capacity || ""}
                placeholder="Leave blank for unlimited"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="image_url">Image URL</Label>
              <Input id="image_url" type="url" name="image_url" defaultValue={event?.image_url || ""} placeholder="https://..." />
            </div>
          </div>

          {error && <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-md text-sm">{error}</div>}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Saving..." : event ? "Update Event" : "Create Event"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
