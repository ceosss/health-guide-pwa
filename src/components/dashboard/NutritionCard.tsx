"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { Utensils } from "lucide-react"
import Link from "next/link"

interface NutritionCardProps {
  calories: number
  targetCalories: number
  protein: number
  carbs: number
  fat: number
}

export function NutritionCard({ 
  calories, 
  targetCalories, 
  protein, 
  carbs, 
  fat 
}: NutritionCardProps) {
  const remaining = Math.max(0, targetCalories - calories)
  const percentage = Math.min(100, (calories / targetCalories) * 100)
  
  const data = [
    { name: "Consumed", value: calories },
    { name: "Remaining", value: remaining },
  ]
  
  const COLORS = ["hsl(var(--primary))", "hsl(var(--muted))"]

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Utensils className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Nutrition</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={25}
                  outerRadius={35}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1">
            <p className="text-2xl font-bold">{calories}</p>
            <p className="text-sm text-muted-foreground">/ {targetCalories} kcal</p>
            <Progress value={percentage} className="mt-2 h-2" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-muted rounded p-2">
            <p className="text-sm font-medium">{protein}g</p>
            <p className="text-xs text-muted-foreground">Protein</p>
          </div>
          <div className="bg-muted rounded p-2">
            <p className="text-sm font-medium">{carbs}g</p>
            <p className="text-xs text-muted-foreground">Carbs</p>
          </div>
          <div className="bg-muted rounded p-2">
            <p className="text-sm font-medium">{fat}g</p>
            <p className="text-xs text-muted-foreground">Fat</p>
          </div>
        </div>

        <Button asChild variant="outline" className="w-full">
          <Link href="/nutrition">Log Meal</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
