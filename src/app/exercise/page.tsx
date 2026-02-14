"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
export default function ExercisePage() {
  const router = useRouter()
  const supabase = createClient()
  const [workout, setWorkout] = useState<any>(null)
  const [exercises, setExercises] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)
  useEffect(() => {
    fetchTodaysWorkout()
  }, [])
  const fetchTodaysWorkout = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push("/login")
      return
    }
    const { data: profileData } = await supabase
      .from("user_profiles")
      .select("fitness_level, equipment")
      .eq("user_id", user.id)
      .single()
    setProfile(profileData)
    // Get workout based on day of week and fitness level
    const dayOfWeek = new Date().getDay()
    const isBeginner = profileData?.fitness_level === "beginner"
    
    let dayTag = "rest"
    if (isBeginner) {
      if (dayOfWeek === 1 || dayOfWeek === 4) dayTag = "push"
      if (dayOfWeek === 2 || dayOfWeek === 5) dayTag = "legs"
    } else {
      if (dayOfWeek === 1 || dayOfWeek === 4) dayTag = "push"
      if (dayOfWeek === 2 || dayOfWeek === 5) dayTag = "pull"
      if (dayOfWeek === 3 || dayOfWeek === 6) dayTag = "legs"
    }
    if (dayTag === "rest") {
      setWorkout({ name: "Rest Day", day_tag: "rest" })
      return
    }
    const { data: workoutData } = await supabase
      .from("workouts")
      .select("*")
      .eq("day_tag", dayTag)
      .eq("difficulty", profileData?.fitness_level || "beginner")
      .single()
    if (workoutData) {
      setWorkout(workoutData)
      
      const { data: exerciseData } = await supabase
        .from("workout_exercises")
        .select(`
          sets,
          reps,
          exercises(name, muscle_group)
        `)
        .eq("workout_id", workoutData.id)
      setExercises(exerciseData || [])
    }
  }
  if (workout?.day_tag === "rest") {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-md mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold mb-6">Today&apos;s Workout</h1>
          
          <Card>
            <CardHeader>
              <CardTitle>🧘 Rest Day</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Today is a rest day. Take time to recover, stretch, or do light activity like walking.
              </p>
            </CardContent>
          </Card>
          <div className="mt-6 flex gap-3">
            <Button asChild variant="outline" className="flex-1">
              <Link href="/exercise/history">History</Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/exercise/library">Library</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-2">Today&apos;s Workout</h1>
        <p className="text-muted-foreground mb-6">{workout?.name}</p>
        <div className="space-y-3 mb-6">
          {exercises.map((ex, idx) => (
            <Card key={idx}>
              <CardContent className="py-4">
                <p className="font-medium">{ex.exercises?.name}</p>
                <p className="text-sm text-muted-foreground">
                  {ex.sets} sets × {ex.reps} reps
                </p>
                <p className="text-xs text-muted-foreground">
                  {ex.exercises?.muscle_group}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        <Button asChild className="w-full mb-4">
          <Link href="/exercise/start">Start Workout</Link>
        </Button>
        <div className="flex gap-3">
          <Button asChild variant="outline" className="flex-1">
            <Link href="/exercise/history">History</Link>
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link href="/exercise/library">Library</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
