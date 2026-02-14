"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, TrendingUp } from "lucide-react"
import Link from "next/link"
export default function ProgressPage() {
  const router = useRouter()
  const supabase = createClient()
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    currentStreak: 0,
    weightChange: 0,
    startingWeight: 0,
    currentWeight: 0
  })
  useEffect(() => {
    fetchStats()
  }, [])
  const fetchStats = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push("/login")
      return
    }
    const { data: workouts } = await supabase
      .from("user_workout_logs")
      .select("date")
      .eq("user_id", user.id)
      .eq("status", "completed")
    const totalWorkouts = workouts?.length || 0
    // Calculate streak
    const today = new Date()
    let streak = 0
    const dates = new Set(workouts?.map(w => w.date) || [])
    
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(checkDate.getDate() - i)
      const dateStr = checkDate.toISOString().split("T")[0]
      
      if (dates.has(dateStr)) {
        streak++
      } else if (i > 0) {
        break
      }
    }
    const { data: measurements } = await supabase
      .from("user_measurements")
      .select("weight_kg")
      .eq("user_id", user.id)
      .order("date", { ascending: true })
    const startingWeight = measurements?.[0]?.weight_kg || 0
    const currentWeight = measurements?.[measurements.length - 1]?.weight_kg || 0
    const weightChange = currentWeight - startingWeight
    setStats({
      totalWorkouts,
      currentStreak: streak,
      weightChange,
      startingWeight,
      currentWeight
    })
  }
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-6">
          <Button asChild variant="ghost" size="icon">
            <Link href="/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Progress</h1>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="py-4 text-center">
              <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-500" />
              <p className="text-2xl font-bold">{stats.totalWorkouts}</p>
              <p className="text-sm text-muted-foreground">Total Workouts</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 text-center">
              <p className="text-2xl font-bold">{stats.currentStreak}</p>
              <p className="text-sm text-muted-foreground">Day Streak</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 text-center">
              <p className="text-2xl font-bold">
                {stats.weightChange > 0 ? "+" : ""}{stats.weightChange.toFixed(1)}
              </p>
              <p className="text-sm text-muted-foreground">Weight Change (kg)</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 text-center">
              <p className="text-2xl font-bold">{stats.currentWeight || "--"}</p>
              <p className="text-sm text-muted-foreground">Current Weight (kg)</p>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-3">
          <Button asChild className="w-full">
            <Link href="/progress/photos">Progress Photos</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/progress/measurements">Log Measurements</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
