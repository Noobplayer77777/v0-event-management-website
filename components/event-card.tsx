"use client"

import type React from "react"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users } from "lucide-react"
import type { Event } from "@/lib/types"
import { format } from "date-fns"
import Link from "next/link"

interface EventCardProps {
  event: Event
  showStatus?: boolean
  actionButton?: React.ReactNode
}

export function EventCard({ event, showStatus, actionButton }: EventCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden transition-shadow hover:shadow-lg">
      <div className="aspect-video bg-muted relative">
        {event.image_url ? (
          <img src={event.image_url || "/placeholder.svg"} alt={event.title} className="object-cover w-full h-full" />
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary/20 to-primary/5">
            <Calendar className="h-12 w-12 text-primary/40" />
          </div>
        )}
        {showStatus && (
          <Badge
            className="absolute top-2 right-2"
            variant={event.status === "approved" ? "default" : event.status === "pending" ? "secondary" : "destructive"}
          >
            {event.status}
          </Badge>
        )}
      </div>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-lg line-clamp-1">{event.title}</h3>
          {event.category && (
            <Badge variant="outline" className="shrink-0">
              {event.category.name}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {event.description || "No description available"}
        </p>
        <div className="space-y-1.5 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{format(new Date(event.date), "PPP 'at' p")}</span>
          </div>
          {event.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="line-clamp-1">{event.location}</span>
            </div>
          )}
          {event.max_capacity && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>
                {event.registration_count ?? 0} / {event.max_capacity} registered
              </span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        {actionButton || (
          <Button asChild className="w-full">
            <Link href={`/events/${event.id}`}>View Details</Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
