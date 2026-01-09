"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { format } from "date-fns"
import { Check, X, Eye, Calendar } from "lucide-react"
import Link from "next/link"
import type { Event } from "@/lib/types"

interface PendingEventsTableProps {
  events: Event[]
  isPending: boolean
}

export function PendingEventsTable({ events, isPending }: PendingEventsTableProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const router = useRouter()

  const handleAction = async () => {
    if (!selectedEventId || !actionType) return
    setLoadingId(selectedEventId)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from("events")
        .update({
          status: actionType === "approve" ? "approved" : "rejected",
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedEventId)

      if (error) throw error
      router.refresh()
    } catch (error) {
      console.error("Action error:", error)
    } finally {
      setLoadingId(null)
      setDialogOpen(false)
      setSelectedEventId(null)
      setActionType(null)
    }
  }

  const openDialog = (eventId: string, action: "approve" | "reject") => {
    setSelectedEventId(eventId)
    setActionType(action)
    setDialogOpen(true)
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>{isPending ? "No events pending review" : "No events found"}</p>
      </div>
    )
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Event</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Created By</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event) => (
            <TableRow key={event.id}>
              <TableCell className="font-medium">{event.title}</TableCell>
              <TableCell>{event.category?.name || "Uncategorized"}</TableCell>
              <TableCell>{event.creator?.full_name || event.creator?.email || "Unknown"}</TableCell>
              <TableCell>{format(new Date(event.date), "PP")}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    event.status === "approved" ? "default" : event.status === "pending" ? "secondary" : "destructive"
                  }
                >
                  {event.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/dashboard/admin/events/${event.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  {event.status === "pending" && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={() => openDialog(event.id, "approve")}
                        disabled={loadingId === event.id}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => openDialog(event.id, "reject")}
                        disabled={loadingId === event.id}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{actionType === "approve" ? "Approve Event?" : "Reject Event?"}</AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === "approve"
                ? "This will make the event visible to all students for registration."
                : "This event will be rejected and the creator will be notified."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAction}
              className={actionType === "approve" ? "bg-green-600 hover:bg-green-700" : "bg-destructive"}
            >
              {actionType === "approve" ? "Approve" : "Reject"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
