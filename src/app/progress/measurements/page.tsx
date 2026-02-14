"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts"
export default function MeasurementsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [measurements, setMeasurements] = useState<any[]>([])
  const [formData, setFormData] = useState({
    weight_kg: "",
    chest_cm: "",
    waist_cm: "",
    hips_cm: "",
    bicep_cm: "",
    thigh_cm: "",
    notes: ""
  })
  useEffect(() => {
    fetchMeasurements()
  }, [])
  const fetchMeasurements = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push("/login")
      return
    }
    const { data } = await supabase
      .from("user_measurements")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: true })
    setMeasurements(data || [])
  }
  const saveMeasurement = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const today = new Date().toISOString().split("T")[0]
    await supabase.from("user_measurements").insert({
      user_id: user.id,
      date: today,
      weight_kg: parseFloat(formData.weight_kg) || null,
      chest_cm: parseFloat(formData.chest_cm) || null,
      waist_cm: parseFloat(formData.waist_cm) || null,
      hips_cm: parseFloat(formData.hips_cm) || null,
      bicep_cm: parseFloat(formData.bicep_cm) || null,
      thigh_cm: parseFloat(formData.thigh_cm) || null,
      notes: formData.notes
    })
    setFormData({
      weight_kg: "",
      chest_cm: "",
      waist_cm: "",
      hips_cm: "",
      bicep_cm: "",
      thigh_cm: "",
      notes: ""
    })
    fetchMeasurements()
  }
  const chartData = measurements.map(m => ({
    date: new Date(m.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
    weight: m.weight_kg
  }))
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-6">
          <Button asChild variant="ghost" size="icon">
            <Link href="/progress">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Measurements</h1>
        </div>
        {chartData.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base">Weight Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <XAxis dataKey="date" tick={{fontSize: 12}} />
                    <YAxis tick={{fontSize: 12}} />
                    <Line 
                      type="monotone" 
                      dataKey="weight" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Log New Measurement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Weight (kg)</Label>
                <Input
                  type="number"
                  value={formData.weight_kg}
                  onChange={(e) => setFormData({...formData, weight_kg: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Chest (cm)</Label>
                <Input
                  type="number"
                  value={formData.chest_cm}
                  onChange={(e) => setFormData({...formData, chest_cm: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Waist (cm)</Label>
                <Input
                  type="number"
                  value={formData.waist_cm}
                  onChange={(e) => setFormData({...formData, waist_cm: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Hips (cm)</Label>
                <Input
                  type="number"
                  value={formData.hips_cm}
                  onChange={(e) => setFormData({...formData, hips_cm: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Bicep (cm)</Label>
                <Input
                  type="number"
                  value={formData.bicep_cm}
                  onChange={(e) => setFormData({...formData, bicep_cm: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Thigh (cm)</Label>
                <Input
                  type="number"
                  value={formData.thigh_cm}
                  onChange={(e) => setFormData({...formData, thigh_cm: e.target.value})}
                />
              </div>
            </div>
            <Button onClick={saveMeasurement} className="w-full">
              Save Measurement
            </Button>
          </CardContent>
        </Card>
        <div className="space-y-2">
          <h3 className="text-sm font-medium">History</h3>
          {measurements.slice().reverse().map((m) => (
            <Card key={m.id}>
              <CardContent className="py-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium">
                    {new Date(m.date).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {m.weight_kg && `${m.weight_kg} kg`}
                  </p>
                </div>
                {m.notes && (
                  <p className="text-xs text-muted-foreground mt-1">{m.notes}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
