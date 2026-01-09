"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface RegisterButtonProps {
  eventId: string
  isLoggedIn: boolean
  isRegistered: boolean
  isFull: boolean
}

export function RegisterButton({ eventId, isLoggedIn, isRegistered, isFull }: RegisterButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  if (!isLoggedIn) {
    return (
      <Button asChild className="w-full">
        <Link href="/auth/login">Login to Register</Link>
      </Button>
    )
  }

  const handleRegister = async () => {
    setIsLoading(true)
    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not logged in")

      if (isRegistered) {
        await supabase.from("registrations").delete().eq("event_id", eventId).eq("user_id", user.id)
      } else {
        await supabase.from("registrations").insert({ event_id: eventId, user_id: user.id })
      }

      router.refresh()
    } catch (error) {
      console.error("Registration error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isRegistered) {
    return (
      <Button variant="outline" className="w-full bg-transparent" onClick={handleRegister} disabled={isLoading}>
        {isLoading ? "Processing..." : "Cancel Registration"}
      </Button>
    )
  }

  if (isFull) {
    return (
      <Button disabled className="w-full">
        Event Full
      </Button>
    )
  }

  return (
    <Button className="w-full" onClick={handleRegister} disabled={isLoading}>
      {isLoading ? "Processing..." : "Register for Event"}
    </Button>
  )
}
