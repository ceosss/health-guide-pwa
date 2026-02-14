"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Sparkles, Check } from "lucide-react"
export default function SkincarePage() {
  const router = useRouter()
  const supabase = createClient()
  const [routine, setRoutine] = useState<any>(null)
  const [completedSteps, setCompletedSteps] = useState<string[]>([])
  const [skinType, setSkinType] = useState("")
  const [isAM, setIsAM] = useState(true)
  useEffect(() => {
    // Auto-detect AM/PM based on current hour
    const hour = new Date().getHours()
    setIsAM(hour < 12)
    
    fetchRoutine()
  }, [isAM])
  const fetchRoutine = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push("/login")
      return
    }
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("skin_type")
      .eq("user_id", user.id)
      .single()
    setSkinType(profile?.skin_type || "normal")
    const { data: routineData } = await supabase
      .from("skin_routines")
      .select("*")
      .eq("skin_type", profile?.skin_type || "normal")
      .eq("routine_type", isAM ? "am" : "pm")
      .single()
    setRoutine(routineData)
    // Check if already completed today
    const today = new Date().toISOString().split("T")[0]
    const { data: log } = await supabase
      .from("user_skin_logs")
      .select("steps_completed")
      .eq("user_id", user.id)
      .eq("date", today)
      .eq("routine_type", isAM ? "am" : "pm")
      .single()
    if (log) {
      setCompletedSteps(log.steps_completed || [])
    }
  }
  const toggleStep = async (stepName: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const newCompleted = completedSteps.includes(stepName)
      ? completedSteps.filter(s => s !== stepName)
      : [...completedSteps, stepName]
    setCompletedSteps(newCompleted)
    const today = new Date().toISOString().split("T")[0]
    const steps = routine?.steps || []
    const allCompleted = newCompleted.length === steps.length
    await supabase
      .from("user_skin_logs")
      .upsert({
        user_id: user.id,
        date: today,
        routine_type: isAM ? "am" : "pm",
        steps_completed: newCompleted,
        completed_all: allCompleted,
        completed_at: allCompleted ? new Date().toISOString() : null
      })
  }
  const allCompleted = completedSteps.length === (routine?.steps?.length || 0)
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Skin Care</h1>
          <div className="flex gap-2">
            <Button 
              variant={isAM ? "default" : "outline"} 
              size="sm"
              onClick={() => setIsAM(true)}
            >
              AM
            </Button>
            <Button 
              variant={!isAM ? "default" : "outline"} 
              size="sm"
              onClick={() => setIsAM(false)}
            >
              PM
            </Button>
          </div>
        </div>
        {allCompleted && (
          <Card className="mb-4 bg-green-500/10 border-green-500">
            <CardContent className="py-4 flex items-center gap-3">
              <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-medium">Routine Complete! 🎉</p>
                <p className="text-sm text-muted-foreground">Great job taking care of your skin</p>
              </div>
            </CardContent>
          </Card>
        )}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle>{isAM ? "Morning" : "Evening"} Routine</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground capitalize">
              {skinType} Skin Type
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {routine?.steps?.map((step: any, idx: number) => (
              <div 
                key={idx}
                className={`p-4 rounded-lg border transition-colors ${
                  completedSteps.includes(step.step_name) 
                    ? "bg-green-500/5 border-green-500/30" 
                    : "bg-card"
                }`}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={completedSteps.includes(step.step_name)}
                    onCheckedChange={() => toggleStep(step.step_name)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className={`font-medium ${
                        completedSteps.includes(step.step_name) ? "line-through text-muted-foreground" : ""
                      }`}>
                        {step.step_name}
                      </p>
                      {step.optional && (
                        <Badge variant="outline" className="text-xs">Optional</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Button asChild variant="outline" className="w-full">
          <Link href="/skincare/products">Manage Products</Link>
        </Button>
      </div>
    </div>
  )
}
