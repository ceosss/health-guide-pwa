"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dumbbell } from "lucide-react"
import Link from "next/link"

interface WorkoutCardProps {
  workoutLog?: {
    status: string
    workout_id: string
  } | null
  fitnessLevel?: string
}

export function WorkoutCard({ workoutLog, fitnessLevel }: WorkoutCardProps) {
  const isCompleted = workoutLog?.status === "completed"
  const isStarted = workoutLog?.status === "started"

  const getStatusBadge = () => {
    if (isCompleted) return <Badge className="bg-green-500">Completed</Badge>
    if (isStarted) return <Badge variant="secondary">In Progress</Badge>
    return <Badge variant="outline">Not Started</Badge>
  }

  const getWorkoutType = () => {
    const dayOfWeek = new Date().getDay()
    const isBeginner = fitnessLevel === "beginner"
    
    if (isBeginner) {
      if (dayOfWeek === 1 || dayOfWeek === 4) return "Upper Body"
      if (dayOfWeek === 2 || dayOfWeek === 5) return "Lower Body"
      return "Rest Day"
    } else {
      if (dayOfWeek === 1 || dayOfWeek === 4) return "Push Day"
      if (dayOfWeek === 2 || dayOfWeek === 5) return "Pull Day"
      if (dayOfWeek === 3 || dayOfWeek === 6) return "Leg Day"
      return "Rest Day"
    }
  }

  const workoutType = getWorkoutType()

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Today&apos;s Workout</CardTitle>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="font-medium">{workoutType}</p>
          <p className="text-sm text-muted-foreground">
            {workoutType === "Rest Day" 
              ? "Take a break or do some light stretching"
              : "30-45 min • Focus on form and controlled movements"
            }
          </p>
        </div>
        
        {workoutType !== "Rest Day" && (
          <Button asChild className="w-full">
            <Link href={isStarted ? "/exercise/start" : "/exercise"}>
              {isCompleted ? "View Workout" : isStarted ? "Continue Workout" : "Start Workout"}
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
