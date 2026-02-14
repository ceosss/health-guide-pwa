"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, LogOut } from "lucide-react"
import Link from "next/link"
export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const [profile, setProfile] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  useEffect(() => {
    fetchData()
  }, [])
  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push("/login")
      return
    }
    setUser(user)
    const { data: profileData } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single()
    setProfile(profileData)
  }
  const signOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }
  const updateProfile = async (field: string, value: any) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase
      .from("user_profiles")
      .update({ [field]: value })
      .eq("user_id", user.id)
    fetchData()
  }
  if (!profile) return null
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-6">
          <Button asChild variant="ghost" size="icon">
            <Link href="/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Profile</h1>
        </div>
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg">Daily Targets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold">{profile.daily_calories_target}</p>
                <p className="text-xs text-muted-foreground">Calories</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold">{profile.daily_protein_g}g</p>
                <p className="text-xs text-muted-foreground">Protein</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold">{profile.daily_carbs_g}g</p>
                <p className="text-xs text-muted-foreground">Carbs</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold">{profile.daily_fat_g}g</p>
                <p className="text-xs text-muted-foreground">Fat</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg">Edit Goals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Goal Type</Label>
              <select
                className="w-full h-9 rounded-md border border-input bg-transparent px-3"
                value={profile.goal}
                onChange={(e) => updateProfile("goal", e.target.value)}
              >
                <option value="lose_fat">Lose Fat</option>
                <option value="build_muscle">Build Muscle</option>
                <option value="body_recomp">Body Recomposition</option>
                <option value="athletic">Athletic Performance</option>
                <option value="bulk">Bulk Up</option>
                <option value="lean_toned">Get Lean & Toned</option>
                <option value="maintain">Maintain</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Target Weight (kg)</Label>
              <Input
                type="number"
                value={profile.target_weight_kg || ""}
                onChange={(e) => updateProfile("target_weight_kg", parseFloat(e.target.value) || null)}
              />
            </div>
          </CardContent>
        </Card>
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg">Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Email</Label>
              <p className="text-sm">{user?.email}</p>
            </div>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={async () => {
                await supabase.auth.resetPasswordForEmail(user?.email)
                alert("Password reset email sent!")
              }}
            >
              Change Password
            </Button>
          </CardContent>
        </Card>
        <Button 
          variant="destructive" 
          className="w-full"
          onClick={signOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
