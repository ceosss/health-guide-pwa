"use client"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
export default function PhotoAnalysisPage() {
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [detectedItems, setDetectedItems] = useState<any[]>([])
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set())
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setPreview(URL.createObjectURL(file))
      setDetectedItems([])
    }
  }
  const analyzePhoto = async () => {
    if (!selectedFile) return
    setAnalyzing(true)
    const formData = new FormData()
    formData.append("image", selectedFile)
    try {
      const response = await fetch("/api/analyze-meal", {
        method: "POST",
        body: formData,
      })
      const data = await response.json()
      setDetectedItems(data.items || [])
      setSelectedItems(new Set(data.items?.map((_item: any, i: number) => i) || []))
    } catch (error) {
      console.error("Analysis failed:", error)
    } finally {
      setAnalyzing(false)
    }
  }
  const toggleItem = (index: number) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(index)) {
      newSelected.delete(index)
    } else {
      newSelected.add(index)
    }
    setSelectedItems(newSelected)
  }
  const logItems = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const today = new Date().toISOString().split("T")[0]
    // Save photo log
    const { data: photoLog } = await supabase
      .from("user_meal_photo_logs")
      .insert({
        user_id: user.id,
        date: today,
        meal_type: "lunch",
        photo_storage_path: "placeholder",
        ai_detected_items: detectedItems,
      })
      .select()
      .single()
    // Save selected items as food logs
    const itemsToLog = detectedItems.filter((_, i) => selectedItems.has(i))
    
    for (const item of itemsToLog) {
      await supabase.from("user_food_logs").insert({
        user_id: user.id,
        date: today,
        meal_type: "lunch",
        photo_log_id: photoLog?.id,
        food_name_override: item.name,
        calories_override: item.calories,
        protein_override: item.protein_g,
        carbs_override: item.carbs_g,
        fat_override: item.fat_g,
      })
    }
    router.push("/nutrition")
  }
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Analyze Meal Photo</h1>
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
        />
        {!preview ? (
          <Card 
            className="h-64 flex items-center justify-center cursor-pointer hover:bg-muted/50"
            onClick={() => fileInputRef.current?.click()}
          >
            <CardContent className="text-center">
              <p className="text-4xl mb-2">📷</p>
              <p className="font-medium">Tap to take photo</p>
              <p className="text-sm text-muted-foreground">or select from gallery</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <img 
              src={preview} 
              alt="Selected meal" 
              className="w-full h-64 object-cover rounded-lg"
            />
            {detectedItems.length === 0 ? (
              <Button 
                onClick={analyzePhoto} 
                disabled={analyzing}
                className="w-full"
              >
                {analyzing ? "Analyzing..." : "Analyze Meal"}
              </Button>
            ) : (
              <div className="space-y-4">
                <h3 className="font-medium">Detected Items:</h3>
                
                {detectedItems.map((item, idx) => (
                  <Card key={idx} className={selectedItems.has(idx) ? "border-primary" : ""}>
                    <CardContent className="py-3">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={selectedItems.has(idx)}
                          onCheckedChange={() => toggleItem(idx)}
                        />
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            ~{item.calories} kcal
                          </p>
                        </div>
                        <span className={`text-xs ${
                          item.confidence === 'high' ? 'text-green-500' : 
                          item.confidence === 'medium' ? 'text-yellow-500' : 'text-orange-500'
                        }`}>
                          {item.confidence}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <Button onClick={logItems} className="w-full">
                  Log Selected Items
                </Button>
              </div>
            )}
            <Button 
              variant="outline" 
              onClick={() => {
                setPreview(null)
                setSelectedFile(null)
                setDetectedItems([])
              }}
              className="w-full"
            >
              Choose Different Photo
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
