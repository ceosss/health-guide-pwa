import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Heart, Activity, Apple, Sparkles } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero */}
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="mb-6 flex justify-center gap-2">
          <Heart className="h-8 w-8 text-rose-500" />
          <Activity className="h-8 w-8 text-blue-500" />
          <Apple className="h-8 w-8 text-green-500" />
          <Sparkles className="h-8 w-8 text-amber-500" />
        </div>
        
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Your Personal Health Guide
        </h1>
        
        <p className="mx-auto mb-8 max-w-2xl text-lg text-slate-600">
          Track your fitness, nutrition, and skincare routines in one place. 
          Get personalized daily guidance to achieve your health goals.
        </p>
        
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/signup">
            <Button size="lg" className="w-full sm:w-auto">
              Get Started
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Sign In
            </Button>
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Workout Plans</h3>
            <p className="text-slate-600">Personalized exercise routines based on your fitness level and goals.</p>
          </div>
          
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
              <Apple className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Nutrition Tracking</h3>
            <p className="text-slate-600">Log meals with AI photo analysis and track your macros automatically.</p>
          </div>
          
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-rose-100">
              <Sparkles className="h-6 w-6 text-rose-600" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Skincare Routine</h3>
            <p className="text-slate-600">AM/PM skincare checklists tailored to your skin type and concerns.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
