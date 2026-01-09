"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import type { Category, Event } from "@/lib/types"

interface EventFormProps {
  categories: Category[]
  event?: Event
}

export function EventForm({ categories, event }: EventFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        category_id: (formData.get("category") as string) || null,
        date: formData.get("date") as string,
        location: formData.get("location") as string,
        max_capacity: formData.get("max_capacity") ? Number(formData.get("max_capacity")) : null,
        image_url: (formData.get("image_url") as string) || null,
        created_by: user.id,
        status: "pending" as const,
        updated_at: new Date().toISOString(),
      }

      if (event) {
        const { error } = await supabase
          .from("events")
          .update({
            ...eventData,
            status: event.status, // Keep existing status
          })
          .eq("id", event.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("events").insert(eventData)
        if (error) throw error
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
            <Input id="title" name="title" required defaultValue={event?.title} placeholder="Enter event title" />
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
              <Select name="category" defaultValue={event?.category_id || undefined}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
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
                name="date"
                type="datetime-local"
                required
                defaultValue={event?.date ? new Date(event.date).toISOString().slice(0, 16) : undefined}
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" name="location" defaultValue={event?.location || ""} placeholder="Event location" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="max_capacity">Max Capacity</Label>
              <Input
                id="max_capacity"
                name="max_capacity"
                type="number"
                min="1"
                defaultValue={event?.max_capacity || ""}
                placeholder="Leave empty for unlimited"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="image_url">Image URL</Label>
            <Input
              id="image_url"
              name="image_url"
              type="url"
              defaultValue={event?.image_url || ""}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-4 pt-4">
            <Button type="button" variant="outline" className="flex-1 bg-transparent" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? "Saving..." : event ? "Update Event" : "Create Event"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
