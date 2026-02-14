"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
const skinTypes = ["normal", "oily", "dry", "combination", "sensitive"]
const skinConcernsOptions = ["Acne", "Dark spots", "Dullness", "Anti-aging", "Hydration", "Texture"]
const dietaryOptions = ["None", "Vegetarian", "Vegan", "Gluten-free", "Dairy-free", "Halal"]
const goalOptions = [
  { value: "lose_fat", label: "🔥 Lose fat", desc: "Reduce body fat, preserve muscle" },
  { value: "build_muscle", label: "💪 Build muscle", desc: "Gain lean mass, strength focus" },
  { value: "body_recomp", label: "🔄 Body recomp", desc: "Lose fat + gain muscle simultaneously" },
  { value: "athletic", label: "⚡ Athletic", desc: "Improve endurance, speed, stamina" },
  { value: "bulk", label: "🏋️ Bulk up", desc: "Significant mass gain" },
  { value: "lean_toned", label: "🎯 Get lean & toned", desc: "Slim down with muscle definition" },
  { value: "maintain", label: "⚖️ Maintain", desc: "Sustain current physique" },
]
export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    height_cm: "",
    weight_kg: "",
    age: "",
    gender: "",
    fitness_level: "",
    equipment: "",
    skin_type: "",
    skin_concerns: [] as string[],
    skin_routine_level: "",
    goal: "",
    timeline_months: "3",
    target_weight_kg: "",
    preferred_workout_time: "",
    workout_duration_min: "30",
    dietary_restrictions: [] as string[],
  })
  const totalSteps = 6
  const progress = (step / totalSteps) * 100
  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }
  const handleNext = async () => {
    if (step < totalSteps) {
      // Save progress to Supabase after each step
      await saveProgress()
      setStep(step + 1)
    } else {
      await completeOnboarding()
    }
  }
  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }
  const saveProgress = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase
      .from("user_profiles")
      .upsert({
        user_id: user.id,
        ...formData,
        height_cm: formData.height_cm ? parseFloat(formData.height_cm) : null,
        weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
        age: formData.age ? parseInt(formData.age) : null,
        target_weight_kg: formData.target_weight_kg ? parseFloat(formData.target_weight_kg) : null,
        timeline_months: parseInt(formData.timeline_months),
        workout_duration_min: parseInt(formData.workout_duration_min),
      })
    if (error) console.error("Error saving progress:", error)
  }
  const completeOnboarding = async () => {
    setLoading(true)
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    // Calculate TDEE and macros
    const weight = parseFloat(formData.weight_kg)
    const height = parseFloat(formData.height_cm)
    const age = parseInt(formData.age)
    const isMale = formData.gender === "male"
    
    // BMR using Mifflin-St Jeor
    let bmr = (10 * weight) + (6.25 * height) - (5 * age)
    bmr = isMale ? bmr + 5 : bmr - 161
    
    // TDEE with moderate activity (1.55)
    let tdee = Math.round(bmr * 1.55)
    
    // Goal adjustment
    const goalAdjustments: Record<string, number> = {
      lose_fat: -500,
      build_muscle: 300,
      body_recomp: 0,
      bulk: 500,
      athletic: -250,
      lean_toned: -250,
      maintain: 0,
    }
    
    const dailyCalories = tdee + (goalAdjustments[formData.goal] || 0)
    const protein = Math.round(weight * 2)
    const fat = Math.round((dailyCalories * 0.25) / 9)
    const carbs = Math.round((dailyCalories - (protein * 4) - (fat * 9)) / 4)
    const { error } = await supabase
      .from("user_profiles")
      .upsert({
        user_id: user.id,
        ...formData,
        height_cm: height,
        weight_kg: weight,
        age: age,
        target_weight_kg: formData.target_weight_kg ? parseFloat(formData.target_weight_kg) : null,
        timeline_months: parseInt(formData.timeline_months),
        workout_duration_min: parseInt(formData.workout_duration_min),
        daily_calories_target: dailyCalories,
        daily_protein_g: protein,
        daily_carbs_g: carbs,
        daily_fat_g: fat,
        onboarding_complete: true,
      })
    if (error) {
      console.error("Error completing onboarding:", error)
    } else {
      router.push("/dashboard")
    }
    setLoading(false)
  }
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <CardTitle>Basic Info</CardTitle>
            <CardDescription>Let&apos;s start with some basic information</CardDescription>
            
            <div className="space-y-2">
              <Label>Height (cm)</Label>
              <Input 
                type="number" 
                value={formData.height_cm}
                onChange={(e) => updateField("height_cm", e.target.value)}
                placeholder="175"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Weight (kg)</Label>
              <Input 
                type="number" 
                value={formData.weight_kg}
                onChange={(e) => updateField("weight_kg", e.target.value)}
                placeholder="70"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Age</Label>
              <Input 
                type="number" 
                value={formData.age}
                onChange={(e) => updateField("age", e.target.value)}
                placeholder="26"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Gender</Label>
              <div className="flex gap-2">
                {["male", "female", "other"].map((g) => (
                  <Button
                    key={g}
                    type="button"
                    variant={formData.gender === g ? "default" : "outline"}
                    onClick={() => updateField("gender", g)}
                    className="flex-1 capitalize"
                  >
                    {g}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )
      case 2:
        return (
          <div className="space-y-4">
            <CardTitle>Fitness Level</CardTitle>
            <CardDescription>Select your current fitness level</CardDescription>
            
            {[
              { value: "beginner", label: "Beginner", desc: "New to exercise or getting back after a long break" },
              { value: "intermediate", label: "Intermediate", desc: "Exercise 2-3 times per week consistently" },
              { value: "advanced", label: "Advanced", desc: "Exercise 4+ times per week for over a year" },
            ].map((level) => (
              <Button
                key={level.value}
                type="button"
                variant={formData.fitness_level === level.value ? "default" : "outline"}
                onClick={() => updateField("fitness_level", level.value)}
                className="w-full h-auto py-4 flex flex-col items-start text-left"
              >
                <span className="font-semibold">{level.label}</span>
                <span className="text-xs opacity-80 font-normal">{level.desc}</span>
              </Button>
            ))}
          </div>
        )
      case 3:
        return (
          <div className="space-y-4">
            <CardTitle>Equipment</CardTitle>
            <CardDescription>What equipment do you have access to?</CardDescription>
            
            {[
              { value: "none", label: "None", desc: "Bodyweight exercises only" },
              { value: "home_gym", label: "Home gym", desc: "Dumbbells, resistance bands, pull-up bar" },
              { value: "gym", label: "Full gym", desc: "Complete gym membership access" },
            ].map((eq) => (
              <Button
                key={eq.value}
                type="button"
                variant={formData.equipment === eq.value ? "default" : "outline"}
                onClick={() => updateField("equipment", eq.value)}
                className="w-full h-auto py-4 flex flex-col items-start text-left"
              >
                <span className="font-semibold">{eq.label}</span>
                <span className="text-xs opacity-80 font-normal">{eq.desc}</span>
              </Button>
            ))}
          </div>
        )
      case 4:
        return (
          <div className="space-y-4">
            <CardTitle>Skin Profile</CardTitle>
            <CardDescription>Help us customize your skincare routine</CardDescription>
            
            <div className="space-y-2">
              <Label>Skin Type</Label>
              <div className="grid grid-cols-2 gap-2">
                {skinTypes.map((type) => (
                  <Button
                    key={type}
                    type="button"
                    variant={formData.skin_type === type ? "default" : "outline"}
                    onClick={() => updateField("skin_type", type)}
                    className="capitalize"
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Skin Concerns</Label>
              <div className="grid grid-cols-2 gap-2">
                {skinConcernsOptions.map((concern) => (
                  <div key={concern} className="flex items-center space-x-2">
                    <Checkbox
                      id={concern}
                      checked={formData.skin_concerns.includes(concern)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateField("skin_concerns", [...formData.skin_concerns, concern])
                        } else {
                          updateField("skin_concerns", formData.skin_concerns.filter(c => c !== concern))
                        }
                      }}
                    />
                    <label htmlFor={concern} className="text-sm">{concern}</label>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Current Routine Level</Label>
              <div className="flex flex-col gap-2">
                {["none", "minimal", "full"].map((level) => (
                  <Button
                    key={level}
                    type="button"
                    variant={formData.skin_routine_level === level ? "default" : "outline"}
                    onClick={() => updateField("skin_routine_level", level)}
                    className="capitalize"
                  >
                    {level}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )
      case 5:
        return (
          <div className="space-y-4">
            <CardTitle>Goals</CardTitle>
            <CardDescription>What are you working towards?</CardDescription>
            
            <div className="grid gap-2">
              {goalOptions.map((goal) => (
                <Button
                  key={goal.value}
                  type="button"
                  variant={formData.goal === goal.value ? "default" : "outline"}
                  onClick={() => updateField("goal", goal.value)}
                  className="w-full h-auto py-3 flex flex-col items-start text-left"
                >
                  <span className="font-semibold">{goal.label}</span>
                  <span className="text-xs opacity-80 font-normal">{goal.desc}</span>
                </Button>
              ))}
            </div>
            
            <div className="space-y-2">
              <Label>Timeline</Label>
              <div className="flex gap-2">
                {["3", "6", "12"].map((months) => (
                  <Button
                    key={months}
                    type="button"
                    variant={formData.timeline_months === months ? "default" : "outline"}
                    onClick={() => updateField("timeline_months", months)}
                    className="flex-1"
                  >
                    {months} months
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Target Weight (kg, optional)</Label>
              <Input 
                type="number" 
                value={formData.target_weight_kg}
                onChange={(e) => updateField("target_weight_kg", e.target.value)}
                placeholder="Leave empty if unsure"
              />
            </div>
          </div>
        )
      case 6:
        return (
          <div className="space-y-4">
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Customize your experience</CardDescription>
            
            <div className="space-y-2">
              <Label>Preferred Workout Time</Label>
              <div className="grid grid-cols-2 gap-2">
                {["morning", "afternoon", "evening", "flexible"].map((time) => (
                  <Button
                    key={time}
                    type="button"
                    variant={formData.preferred_workout_time === time ? "default" : "outline"}
                    onClick={() => updateField("preferred_workout_time", time)}
                    className="capitalize"
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Workout Duration</Label>
              <div className="flex gap-2">
                {["20", "30", "45", "60"].map((mins) => (
                  <Button
                    key={mins}
                    type="button"
                    variant={formData.workout_duration_min === mins ? "default" : "outline"}
                    onClick={() => updateField("workout_duration_min", mins)}
                    className="flex-1"
                  >
                    {mins} min
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Dietary Restrictions</Label>
              <div className="grid grid-cols-2 gap-2">
                {dietaryOptions.map((diet) => (
                  <div key={diet} className="flex items-center space-x-2">
                    <Checkbox
                      id={diet}
                      checked={formData.dietary_restrictions.includes(diet)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateField("dietary_restrictions", [...formData.dietary_restrictions, diet])
                        } else {
                          updateField("dietary_restrictions", formData.dietary_restrictions.filter(d => d !== diet))
                        }
                      }}
                    />
                    <label htmlFor={diet} className="text-sm">{diet}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <Progress value={progress} className="mb-4" />
        </CardHeader>
        <CardContent className="space-y-6">
          {renderStep()}
          
          <div className="flex gap-2">
            {step > 1 && (
              <Button type="button" variant="outline" onClick={handleBack} className="flex-1">
                Back
              </Button>
            )}
            <Button 
              onClick={handleNext} 
              className="flex-1"
              disabled={loading}
            >
              {step === totalSteps ? (loading ? "Saving..." : "Complete") : "Next"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
