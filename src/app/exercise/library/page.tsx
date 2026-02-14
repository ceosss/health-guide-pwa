"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Search } from "lucide-react"
import Link from "next/link"
export default function ExerciseLibraryPage() {
  const router = useRouter()
  const supabase = createClient()
  const [exercises, setExercises] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMuscle, setSelectedMuscle] = useState("all")
  useEffect(() => {
    fetchExercises()
  }, [])
  const fetchExercises = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push("/login")
      return
    }
    let query = supabase
      .from("exercises")
      .select("*")
    if (selectedMuscle !== "all") {
      query = query.eq("muscle_group", selectedMuscle)
    }
    if (searchQuery) {
      query = query.ilike("name", `%${searchQuery}%`)
    }
    const { data } = await query
    setExercises(data || [])
  }
  const muscleGroups = ["all", "Chest", "Back", "Legs", "Shoulders", "Arms", "Core", "Cardio"]
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-6">
          <Button asChild variant="ghost" size="icon">
            <Link href="/exercise">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Exercise Library</h1>
        </div>
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search exercises..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
          {muscleGroups.map((muscle) => (
            <Button
              key={muscle}
              variant={selectedMuscle === muscle ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setSelectedMuscle(muscle)
                fetchExercises()
              }}
              className="whitespace-nowrap capitalize"
            >
              {muscle}
            </Button>
          ))}
        </div>
        <div className="space-y-3">
          {exercises.map((exercise) => (
            <Card key={exercise.id}>
              <CardContent className="py-4">
                <p className="font-medium">{exercise.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs bg-muted px-2 py-1 rounded">
                    {exercise.muscle_group}
                  </span>
                  <span className="text-xs bg-muted px-2 py-1 rounded capitalize">
                    {exercise.difficulty}
                  </span>
                  <span className="text-xs bg-muted px-2 py-1 rounded capitalize">
                    {exercise.equipment}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {exercise.instructions}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
