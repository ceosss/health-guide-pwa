"use client"
import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Camera } from "lucide-react"
import Link from "next/link"
export default function ProgressPhotosPage() {
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [photos, setPhotos] = useState<any[]>([])
  const [selectedType, setSelectedType] = useState("front")
  useEffect(() => {
    fetchPhotos()
  }, [])
  const fetchPhotos = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push("/login")
      return
    }
    const { data } = await supabase
      .from("user_progress_photos")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
    setPhotos(data || [])
  }
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const today = new Date().toISOString().split("T")[0]
    // Upload to storage
    const filePath = `${user.id}/${today}_${selectedType}_${Date.now()}.jpg`
    
    await supabase.storage
      .from("progress-photos")
      .upload(filePath, file)
    // Save to database
    await supabase.from("user_progress_photos").insert({
      user_id: user.id,
      date: today,
      photo_type: selectedType,
      storage_path: filePath
    })
    fetchPhotos()
  }
  const groupedPhotos = photos.reduce((acc, photo) => {
    if (!acc[photo.date]) acc[photo.date] = []
    acc[photo.date].push(photo)
    return acc
  }, {} as Record<string, typeof photos>)
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-6">
          <Button asChild variant="ghost" size="icon">
            <Link href="/progress">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Progress Photos</h1>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
        />
        <Card className="mb-6">
          <CardContent className="py-4">
            <p className="font-medium mb-3">Add New Photo</p>
            
            <div className="flex gap-2 mb-3">
              {["front", "side", "back"].map((type) => (
                <Button
                  key={type}
                  variant={selectedType === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedType(type)}
                  className="flex-1 capitalize"
                >
                  {type}
                </Button>
              ))}
            </div>
            <Button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full"
            >
              <Camera className="h-4 w-4 mr-2" />
              Take {selectedType} Photo
            </Button>
          </CardContent>
        </Card>
        <div className="space-y-6">
          {Object.entries(groupedPhotos).map(([date, datePhotos]: [string, any]) => (
            <div key={date}>
              <p className="font-medium mb-2">
                {new Date(date).toLocaleDateString()}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {datePhotos.map((photo: any) => (
                  <div key={photo.id} className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                    <span className="text-xs text-muted-foreground capitalize">
                      {photo.photo_type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
