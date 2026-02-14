import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { GreetingHeader } from "@/components/dashboard/GreetingHeader"
import { WorkoutCard } from "@/components/dashboard/WorkoutCard"
import { SkinRoutineCard } from "@/components/dashboard/SkinRoutineCard"
import { NutritionCard } from "@/components/dashboard/NutritionCard"
import { QuickStats } from "@/components/dashboard/QuickStats"
import { FocusCard } from "@/components/dashboard/FocusCard"

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/login")
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single()

  if (!profile?.onboarding_complete) {
    redirect("/onboarding")
  }

  // Get today's date
  const today = new Date().toISOString().split("T")[0]

  // Fetch today's workout log
  const { data: workoutLog } = await supabase
    .from("user_workout_logs")
    .select("*")
    .eq("user_id", user.id)
    .eq("date", today)
    .single()

  // Fetch today's skin log
  const { data: skinLog } = await supabase
    .from("user_skin_logs")
    .select("*")
    .eq("user_id", user.id)
    .eq("date", today)
    .single()

  // Fetch today's food logs
  const { data: foodLogs } = await supabase
    .from("user_food_logs")
    .select("calories_override, quantity_g, foods(calories_per_100g)")
    .eq("user_id", user.id)
    .eq("date", today)

  // Calculate total calories
  const totalCalories = foodLogs?.reduce((sum, log) => {
    if (log.calories_override) {
      return sum + log.calories_override
    }
    const foodCals = (log.foods as any)?.calories_per_100g || 0
    return sum + (foodCals * (log.quantity_g || 0) / 100)
  }, 0) || 0

  // Fetch today's water log
  const { data: waterLog } = await supabase
    .from("user_water_logs")
    .select("glasses")
    .eq("user_id", user.id)
    .eq("date", today)
    .single()

  // Fetch streak count
  const { data: workoutHistory } = await supabase
    .from("user_workout_logs")
    .select("date")
    .eq("user_id", user.id)
    .eq("status", "completed")
    .order("date", { ascending: false })

  // Calculate streak
  let streak = 0
  if (workoutHistory) {
    const today_date = new Date()
    for (let i = 0; i < workoutHistory.length; i++) {
      const logDate = new Date(workoutHistory[i].date)
      const diffDays = Math.floor((today_date.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24))
      if (diffDays === i || (i === 0 && diffDays <= 1)) {
        streak++
      } else {
        break
      }
    }
  }

  // Get this week's workout count
  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  const weekWorkouts = workoutHistory?.filter(log => 
    new Date(log.date) >= weekStart
  ).length || 0

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto px-4 py-6 space-y-4">
        <GreetingHeader profile={profile} />
        
        <FocusCard goal={profile.goal} />
        
        <WorkoutCard 
          workoutLog={workoutLog}
          fitnessLevel={profile.fitness_level}
        />
        
        <SkinRoutineCard 
          skinLog={skinLog}
          skinType={profile.skin_type}
        />
        
        <NutritionCard 
          calories={Math.round(totalCalories)}
          targetCalories={profile.daily_calories_target}
          protein={profile.daily_protein_g}
          carbs={profile.daily_carbs_g}
          fat={profile.daily_fat_g}
        />
        
        <QuickStats 
          streak={streak}
          weekWorkouts={weekWorkouts}
          waterGlasses={waterLog?.glasses || 0}
        />
      </div>
    </div>
  )
}
