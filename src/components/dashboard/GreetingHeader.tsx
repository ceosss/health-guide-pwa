"use client"

import { useEffect, useState } from "react"

interface GreetingHeaderProps {
  profile: {
    goal?: string
  }
}

export function GreetingHeader({ profile }: GreetingHeaderProps) {
  const [greeting, setGreeting] = useState("")
  const [date, setDate] = useState("")

  useEffect(() => {
    const hour = new Date().getHours()
    let greetingText = "Good evening"
    if (hour < 12) greetingText = "Good morning"
    else if (hour < 18) greetingText = "Good afternoon"
    setGreeting(greetingText)

    // Format date in IST
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      timeZone: 'Asia/Kolkata'
    }
    setDate(new Date().toLocaleDateString('en-IN', options))
  }, [])

  return (
    <div className="space-y-1">
      <h1 className="text-2xl font-bold">{greeting}, Swaraj</h1>
      <p className="text-muted-foreground">{date}</p>
    </div>
  )
}
