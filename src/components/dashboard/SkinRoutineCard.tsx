"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"
import Link from "next/link"

interface SkinRoutineCardProps {
  skinLog?: {
    completed_all: boolean
    steps_completed: string[]
  } | null
  skinType?: string
}

export function SkinRoutineCard({ skinLog, skinType }: SkinRoutineCardProps) {
  const isAM = new Date().getHours() < 12
  const routineType = isAM ? "AM" : "PM"
  const isCompleted = skinLog?.completed_all || false
  
  const getSteps = () => {
    if (skinType === "oily") {
      return isAM 
        ? ["Cleanser", "Toner", "Moisturizer", "SPF"]
        : ["Cleanser", "Treatment", "Moisturizer"]
    }
    if (skinType === "dry") {
      return isAM 
        ? ["Cleanser", "Moisturizer", "SPF"]
        : ["Cleanser", "Treatment", "Moisturizer"]
    }
    // Default for normal, combination, sensitive
    return isAM 
      ? ["Cleanser", "Moisturizer", "SPF"]
      : ["Cleanser", "Moisturizer"]
  }

  const steps = getSteps()
  const completedSteps = skinLog?.steps_completed || []
  const progress = Math.round((completedSteps.length / steps.length) * 100)

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{routineType} Routine</CardTitle>
          </div>
          {isCompleted ? (
            <Badge className="bg-green-500">Done</Badge>
          ) : (
            <Badge variant="outline">{progress}%</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          {steps.slice(0, 3).map((step, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div 
                className={`h-2 w-2 rounded-full ${
                  completedSteps.includes(step) ? "bg-green-500" : "bg-muted"
                }`} 
              />
              <span className={`text-sm ${completedSteps.includes(step) ? "line-through text-muted-foreground" : ""}`}>
                {step}
              </span>
            </div>
          ))}
          {steps.length > 3 && (
            <p className="text-xs text-muted-foreground">+{steps.length - 3} more steps</p>
          )}
        </div>
        
        <Button asChild variant="outline" className="w-full">
          <Link href="/skincare">
            {isCompleted ? "View Routine" : "Open Routine"}
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
