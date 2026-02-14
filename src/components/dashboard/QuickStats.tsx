"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Flame, Dumbbell, GlassWater } from "lucide-react"

interface QuickStatsProps {
  streak: number
  weekWorkouts: number
  waterGlasses: number
}

export function QuickStats({ streak, weekWorkouts, waterGlasses }: QuickStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <Card>
        <CardHeader className="pb-1">
          <Flame className="h-5 w-5 text-orange-500" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{streak}</p>
          <p className="text-xs text-muted-foreground">Day Streak</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-1">
          <Dumbbell className="h-5 w-5 text-blue-500" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{weekWorkouts}/7</p>
          <p className="text-xs text-muted-foreground">This Week</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-1">
          <GlassWater className="h-5 w-5 text-cyan-500" />
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-2xl font-bold">{waterGlasses}/8</p>
          <p className="text-xs text-muted-foreground">Glasses</p>
        </CardContent>
      </Card>
    </div>
  )
}
