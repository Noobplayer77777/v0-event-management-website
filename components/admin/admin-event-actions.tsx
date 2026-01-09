"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { MoreHorizontal, Check, X, Trash2 } from "lucide-react"

interface AdminEventActionsProps {
  eventId: string
  currentStatus: "pending" | "approved" | "rejected"
}

export function AdminEventActions({ eventId, currentStatus }: AdminEventActionsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<"approve" | "reject" | "delete" | null>(null)
  const router = useRouter()

  const handleAction = async () => {
    if (!actionType) return
    setIsLoading(true)
    const supabase = createClient()

    try {
      if (actionType === "delete") {
        const { error } = await supabase.from("events").delete().eq("id", eventId)
        if (error) throw error
        router.push("/dashboard/admin")
      } else {
        const { error } = await supabase
          .from("events")
          .update({
            status: actionType === "approve" ? "approved" : "rejected",
            updated_at: new Date().toISOString(),
          })
          .eq("id", eventId)
        if (error) throw error
      }

      router.refresh()
    } catch (error) {
      console.error("Action error:", error)
    } finally {
      setIsLoading(false)
      setDialogOpen(false)
      setActionType(null)
    }
  }

  const openDialog = (action: "approve" | "reject" | "delete") => {
    setActionType(action)
    setDialogOpen(true)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" disabled={isLoading}>
            <MoreHorizontal className="h-4 w-4 mr-2" />
            Actions
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {currentStatus !== "approved" && (
            <DropdownMenuItem onClick={() => openDialog("approve")} className="text-green-600">
              <Check className="h-4 w-4 mr-2" />
              Approve
            </DropdownMenuItem>
          )}
          {currentStatus !== "rejected" && (
            <DropdownMenuItem onClick={() => openDialog("reject")} className="text-amber-600">
              <X className="h-4 w-4 mr-2" />
              Reject
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => openDialog("delete")} className="text-destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === "approve" && "Approve Event?"}
              {actionType === "reject" && "Reject Event?"}
              {actionType === "delete" && "Delete Event?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === "approve" && "This will make the event visible to all students for registration."}
              {actionType === "reject" && "This event will be rejected and hidden from students."}
              {actionType === "delete" &&
                "This action cannot be undone. This will permanently delete the event and all registrations."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAction}
              disabled={isLoading}
              className={
                actionType === "approve"
                  ? "bg-green-600 hover:bg-green-700"
                  : actionType === "delete"
                    ? "bg-destructive hover:bg-destructive/90"
                    : "bg-amber-600 hover:bg-amber-700"
              }
            >
              {isLoading
                ? "Processing..."
                : actionType === "approve"
                  ? "Approve"
                  : actionType === "reject"
                    ? "Reject"
                    : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
