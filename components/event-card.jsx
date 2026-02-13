"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

export function EventCard({ event, showStatus, actionButton }) {
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
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{event.description}</p>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{format(new Date(event.date), "MMM dd, yyyy HH:mm")}</span>
          </div>
          {event.location && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="line-clamp-1">{event.location}</span>
            </div>
          )}
          {event.registration_count !== undefined && (
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>
                {event.registration_count}
                {event.max_capacity ? `/${event.max_capacity}` : ""} registered
              </span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        {actionButton ? (
          actionButton
        ) : (
          <Button className="w-full" asChild>
            <Link href={`/events/${event.id}`}>View Details</Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
