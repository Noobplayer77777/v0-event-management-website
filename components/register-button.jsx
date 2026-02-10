"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function RegisterButton({ eventId, isLoggedIn, isRegistered, isFull }) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  if (!isLoggedIn) {
    return (
      <Button asChild className="w-full">
        <Link href="/auth/login">Login to Register</Link>
      </Button>
    )
  }

  if (isFull && !isRegistered) {
    return (
      <Button disabled className="w-full">
        Event Full
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

  return (
    <Button onClick={handleRegister} disabled={isLoading} className="w-full" variant={isRegistered ? "outline" : "default"}>
      {isLoading ? "Loading..." : isRegistered ? "Unregister" : "Register"}
    </Button>
  )
}
