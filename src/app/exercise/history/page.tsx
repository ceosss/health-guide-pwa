"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Flame } from "lucide-react"
import Link from "next/link"
export default function ExerciseHistoryPage() {
  const router = useRouter()
  const supabase = createClient()
  const [workoutLogs, setWorkoutLogs] = useState<any[]>([])
  const [streak, setStreak] = useState(0)
  useEffect(() => {
    fetchHistory()
  }, [])
  const fetchHistory = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push("/login")
      return
    }
    const { data } = await supabase
      .from("user_workout_logs")
      .select(`
        *,
        workouts(name, muscle_group)
      `)
      .eq("user_id", user.id)
      .eq("status", "completed")
      .order("date", { ascending: false })
      .limit(30)
    setWorkoutLogs(data || [])
    // Calculate streak
    const today = new Date()
    let currentStreak = 0
    const dates = new Set(data?.map(log => log.date) || [])
    
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(checkDate.getDate() - i)
      const dateStr = checkDate.toISOString().split("T")[0]
      
      if (dates.has(dateStr)) {
        currentStreak++
      } else if (i > 0) {
        break
      }
    }
    
    setStreak(currentStreak)
  }
  // Generate calendar for last 3 months
  const generateCalendar = () => {
    const days = []
    const today = new Date()
    const workoutDates = new Set(workoutLogs.map(log => log.date))
    
    for (let i = 89; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]
      
      days.push({
        date: dateStr,
        hasWorkout: workoutDates.has(dateStr),
        isToday: i === 0
      })
    }
    
    return days
  }
  const calendarDays = generateCalendar()
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-6">
          <Button asChild variant="ghost" size="icon">
            <Link href="/exercise">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">History</h1>
        </div>
        <Card className="mb-6 bg-gradient-to-r from-orange-500 to-red-500 text-white">
          <CardContent className="py-6 text-center">
            <Flame className="h-8 w-8 mx-auto mb-2" />
            <p className="text-4xl font-bold">{streak}</p>
            <p className="text-sm opacity-90">Day Streak</p>
          </CardContent>
        </Card>
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-3">Last 3 Months</h3>
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, idx) => (
              <div
                key={idx}
                className={`aspect-square rounded-sm ${
                  day.hasWorkout 
                    ? "bg-green-500" 
                    : day.isToday 
                      ? "bg-primary" 
                      : "bg-muted"
                }`}
                title={day.date}
              />
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Recent Workouts</h3>
          {workoutLogs.slice(0, 10).map((log) => (
            <Card key={log.id}>
              <CardContent className="py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{log.workouts?.name || "Workout"}</p>
                    <p className="text-sm text-muted-foreground">
                      {log.workouts?.muscle_group}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(log.date).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
