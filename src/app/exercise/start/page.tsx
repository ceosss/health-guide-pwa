"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
export default function ActiveWorkoutPage() {
  const router = useRouter()
  const supabase = createClient()
  const [currentExercise, setCurrentExercise] = useState(0)
  const [exercises, setExercises] = useState<any[]>([])
  const [completedSets, setCompletedSets] = useState<Record<string, boolean>>({})
  const [restTimer, setRestTimer] = useState(0)
  const [isResting, setIsResting] = useState(false)
  const [workoutLogId, setWorkoutLogId] = useState(null)
  useEffect(() => {
    fetchWorkout()
  }, [])
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined
    if (isResting && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer((prev) => prev - 1)
      }, 1000)
    } else if (restTimer === 0) {
      setIsResting(false)
    }
    return () => clearInterval(interval)
  }, [isResting, restTimer])
  const fetchWorkout = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("fitness_level")
      .eq("user_id", user.id)
      .single()
    const dayOfWeek = new Date().getDay()
    const isBeginner = profile?.fitness_level === "beginner"
    
    let dayTag = "push"
    if (isBeginner) {
      if (dayOfWeek === 1 || dayOfWeek === 4) dayTag = "push"
      else if (dayOfWeek === 2 || dayOfWeek === 5) dayTag = "legs"
    } else {
      if (dayOfWeek === 1 || dayOfWeek === 4) dayTag = "push"
      else if (dayOfWeek === 2 || dayOfWeek === 5) dayTag = "pull"
      else dayTag = "legs"
    }
    const { data: workout } = await supabase
      .from("workouts")
      .select("id")
      .eq("day_tag", dayTag)
      .eq("difficulty", profile?.fitness_level || "beginner")
      .single()
    if (workout) {
      const { data: exerciseData } = await supabase
        .from("workout_exercises")
        .select(`
          id,
          sets,
          reps,
          exercises(id, name, instructions)
        `)
        .eq("workout_id", workout.id)
        .order("order_index")
      setExercises(exerciseData || [])
      // Create workout log
      const { data: log } = await supabase
        .from("user_workout_logs")
        .insert({
          user_id: user.id,
          workout_id: workout.id,
          date: new Date().toISOString().split("T")[0],
          started_at: new Date().toISOString(),
          status: "started"
        })
        .select()
        .single()
      if (log) setWorkoutLogId(log.id)
    }
  }
  const toggleSet = (exerciseId: string, setIndex: number) => {
    const key = `${exerciseId}-${setIndex}`
    setCompletedSets(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
    
    if (!completedSets[key]) {
      setRestTimer(60)
      setIsResting(true)
    }
  }
  const nextExercise = () => {
    if (currentExercise < exercises.length - 1) {
      setCurrentExercise(prev => prev + 1)
    }
  }
  const prevExercise = () => {
    if (currentExercise > 0) {
      setCurrentExercise(prev => prev - 1)
    }
  }
  const finishWorkout = async () => {
    if (workoutLogId) {
      await supabase
        .from("user_workout_logs")
        .update({
          status: "completed",
          completed_at: new Date().toISOString()
        })
        .eq("id", workoutLogId)
    }
    router.push("/dashboard")
  }
  const exercise = exercises[currentExercise]
  if (!exercise) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading workout...</p>
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => router.push("/exercise")}>
            ✕
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {currentExercise + 1} / {exercises.length}
            </span>
          </div>
        </div>
        {isResting && (
          <Card className="mb-4 bg-primary/10">
            <CardContent className="py-4 text-center">
              <p className="text-sm text-muted-foreground">Rest Timer</p>
              <p className="text-4xl font-bold">{restTimer}s</p>
            </CardContent>
          </Card>
        )}
        <Card className="mb-6">
          <CardContent className="py-6">
            <h2 className="text-xl font-bold mb-2">{exercise.exercises?.name}</h2>
            <p className="text-sm text-muted-foreground mb-4">
              {exercise.sets} sets × {exercise.reps} reps
            </p>
            <div className="space-y-3">
              {Array.from({ length: exercise.sets }).map((_, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <Checkbox
                    checked={completedSets[`${exercise.id}-${idx}`] || false}
                    onCheckedChange={() => toggleSet(exercise.id, idx)}
                  />
                  <span>Set {idx + 1}</span>
                  <Input 
                    placeholder="Reps" 
                    className="w-20 h-8"
                    type="number"
                  />
                  <Input 
                    placeholder="Weight (kg)" 
                    className="w-24 h-8"
                    type="number"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={prevExercise}
            disabled={currentExercise === 0}
            className="flex-1"
          >
            Previous
          </Button>
          
          {currentExercise < exercises.length - 1 ? (
            <Button onClick={nextExercise} className="flex-1">
              Next
            </Button>
          ) : (
            <Button onClick={finishWorkout} className="flex-1">
              Finish
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
