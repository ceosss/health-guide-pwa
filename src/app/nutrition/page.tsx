"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import Link from "next/link"
import { Plus, Camera, Trash2 } from "lucide-react"
export default function NutritionPage() {
  const router = useRouter()
  const supabase = createClient()
  const [foodLogs, setFoodLogs] = useState<any>({
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: []
  })
  const [profile, setProfile] = useState<any>(null)
  const [waterGlasses, setWaterGlasses] = useState(0)
  const [totalCalories, setTotalCalories] = useState(0)
  useEffect(() => {
    fetchData()
  }, [])
  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push("/login")
      return
    }
    const { data: profileData } = await supabase
      .from("user_profiles")
      .select("daily_calories_target, daily_protein_g, daily_carbs_g, daily_fat_g")
      .eq("user_id", user.id)
      .single()
    setProfile(profileData)
    const today = new Date().toISOString().split("T")[0]
    const { data: logs } = await supabase
      .from("user_food_logs")
      .select(`
        *,
        foods(name, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g)
      `)
      .eq("user_id", user.id)
      .eq("date", today)
    const organized: Record<string, any[]> = { breakfast: [], lunch: [], dinner: [], snack: [] }
    let calories = 0
    logs?.forEach((log) => {
      const meal = log.meal_type || "snack"
      organized[meal as keyof typeof organized].push(log)
      if (log.calories_override) {
        calories += log.calories_override
      } else if (log.foods) {
        const cals = log.foods.calories_per_100g * (log.quantity_g || 0) / 100
        calories += cals
      }
    })
    setFoodLogs(organized)
    setTotalCalories(Math.round(calories))
    const { data: water } = await supabase
      .from("user_water_logs")
      .select("glasses")
      .eq("user_id", user.id)
      .eq("date", today)
      .single()
    setWaterGlasses(water?.glasses || 0)
  }
  const updateWater = async (delta: number) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const today = new Date().toISOString().split("T")[0]
    const newGlasses = Math.max(0, waterGlasses + delta)
    await supabase
      .from("user_water_logs")
      .upsert({
        user_id: user.id,
        date: today,
        glasses: newGlasses
      })
    setWaterGlasses(newGlasses)
  }
  const deleteFood = async (id: string) => {
    await supabase.from("user_food_logs").delete().eq("id", id)
    fetchData()
  }
  const remaining = Math.max(0, (profile?.daily_calories_target || 2000) - totalCalories)
  const percentage = Math.min(100, (totalCalories / (profile?.daily_calories_target || 2000)) * 100)
  const data = [
    { name: "Consumed", value: totalCalories },
    { name: "Remaining", value: remaining },
  ]
  const COLORS = ["hsl(var(--primary))", "hsl(var(--muted))"]
  const renderMealSection = (title: string, mealType: string) => (
    <Card className="mb-3">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{title}</CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link href={`/nutrition/add?meal=${mealType}`}>
              <Plus className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {foodLogs[mealType]?.length === 0 ? (
          <p className="text-sm text-muted-foreground">No items logged</p>
        ) : (
          <div className="space-y-2">
            {foodLogs[mealType].map((log: any) => (
              <div key={log.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">
                    {log.food_name_override || log.foods?.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {Math.round(log.calories_override || (log.foods?.calories_per_100g * log.quantity_g / 100))} kcal
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => deleteFood(log.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Nutrition</h1>
        <Card className="mb-6">
          <CardContent className="py-6">
            <div className="flex items-center gap-4">
              <div className="h-24 w-24">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={45}
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
                <p className="text-3xl font-bold">{totalCalories}</p>
                <p className="text-sm text-muted-foreground">/ {profile?.daily_calories_target || 2000} kcal</p>
                <Progress value={percentage} className="mt-2 h-2" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4 text-center">
              <div className="bg-muted rounded p-2">
                <p className="font-medium">{profile?.daily_protein_g}g</p>
                <p className="text-xs text-muted-foreground">Protein</p>
              </div>
              <div className="bg-muted rounded p-2">
                <p className="font-medium">{profile?.daily_carbs_g}g</p>
                <p className="text-xs text-muted-foreground">Carbs</p>
              </div>
              <div className="bg-muted rounded p-2">
                <p className="font-medium">{profile?.daily_fat_g}g</p>
                <p className="text-xs text-muted-foreground">Fat</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="flex gap-2 mb-6">
          <Button asChild className="flex-1">
            <Link href="/nutrition/add">Add Food</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/nutrition/photo">
              <Camera className="h-4 w-4 mr-2" />
              Photo
            </Link>
          </Button>
        </div>
        {renderMealSection("Breakfast", "breakfast")}
        {renderMealSection("Lunch", "lunch")}
        {renderMealSection("Dinner", "dinner")}
        {renderMealSection("Snacks", "snack")}
        <Card className="mt-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Water Tracker</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={() => updateWater(-1)}>-</Button>
              <div className="text-center">
                <p className="text-2xl font-bold">{waterGlasses}/8</p>
                <p className="text-xs text-muted-foreground">glasses</p>
              </div>
              <Button variant="outline" onClick={() => updateWater(1)}>+</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
