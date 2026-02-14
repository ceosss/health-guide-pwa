"use client"
import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Search, Camera, Plus } from "lucide-react"
import Link from "next/link"

function AddFoodContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [mealType, setMealType] = useState(searchParams.get("meal") || "breakfast")
  const [searchQuery, setSearchQuery] = useState("")
  const [foods, setFoods] = useState<any[]>([])
  const [manualForm, setManualForm] = useState({
    name: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: ""
  })
  useEffect(() => {
    if (searchQuery.length > 2) {
      searchFoods()
    }
  }, [searchQuery])
  const searchFoods = async () => {
    const { data } = await supabase
      .from("foods")
      .select("*")
      .ilike("name", `%${searchQuery}%`)
      .limit(10)
    
    setFoods(data || [])
  }
  const addFood = async (food: any, quantity: number = 100) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const today = new Date().toISOString().split("T")[0]
    await supabase.from("user_food_logs").insert({
      user_id: user.id,
      food_id: food.id,
      meal_type: mealType,
      date: today,
      quantity_g: quantity
    })
    router.push("/nutrition")
  }
  const addManualFood = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const today = new Date().toISOString().split("T")[0]
    await supabase.from("user_food_logs").insert({
      user_id: user.id,
      meal_type: mealType,
      date: today,
      food_name_override: manualForm.name,
      calories_override: parseFloat(manualForm.calories) || 0,
      protein_override: parseFloat(manualForm.protein) || 0,
      carbs_override: parseFloat(manualForm.carbs) || 0,
      fat_override: parseFloat(manualForm.fat) || 0,
    })
    router.push("/nutrition")
  }
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-6">
          <Button asChild variant="ghost" size="icon">
            <Link href="/nutrition">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Add Food</h1>
        </div>
        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="search"><Search className="h-4 w-4 mr-2" />Search</TabsTrigger>
            <TabsTrigger value="photo"><Camera className="h-4 w-4 mr-2" />Photo</TabsTrigger>
            <TabsTrigger value="manual"><Plus className="h-4 w-4 mr-2" />Manual</TabsTrigger>
          </TabsList>
          <TabsContent value="search" className="space-y-4">
            <Input
              placeholder="Search foods..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="space-y-2">
              <Label>Meal Type</Label>
              <select
                className="w-full h-9 rounded-md border border-input bg-transparent px-3"
                value={mealType}
                onChange={(e) => setMealType(e.target.value)}
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
              </select>
            </div>
            <div className="space-y-2">
              {foods.map((food) => (
                <Card key={food.id} className="cursor-pointer" onClick={() => addFood(food)}>
                  <CardContent className="py-3">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{food.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {food.calories_per_100g} kcal/100g
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="photo">
            <Button asChild className="w-full">
              <Link href="/nutrition/photo">Take Photo</Link>
            </Button>
          </TabsContent>
          <TabsContent value="manual" className="space-y-4">
            <div className="space-y-2">
              <Label>Food Name</Label>
              <Input
                value={manualForm.name}
                onChange={(e) => setManualForm({...manualForm, name: e.target.value})}
                placeholder="e.g., Homemade sandwich"
              />
            </div>
            <div className="space-y-2">
              <Label>Calories</Label>
              <Input
                type="number"
                value={manualForm.calories}
                onChange={(e) => setManualForm({...manualForm, calories: e.target.value})}
                placeholder="kcal"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-2">
                <Label>Protein (g)</Label>
                <Input
                  type="number"
                  value={manualForm.protein}
                  onChange={(e) => setManualForm({...manualForm, protein: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Carbs (g)</Label>
                <Input
                  type="number"
                  value={manualForm.carbs}
                  onChange={(e) => setManualForm({...manualForm, carbs: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Fat (g)</Label>
                <Input
                  type="number"
                  value={manualForm.fat}
                  onChange={(e) => setManualForm({...manualForm, fat: e.target.value})}
                />
              </div>
            </div>
            <Button onClick={addManualFood} className="w-full">
              Add Food
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default function AddFoodPage() {
  return (
    <Suspense fallback={<div className="p-4">Loading...</div>}>
      <AddFoodContent />
    </Suspense>
  )
}
