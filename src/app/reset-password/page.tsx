"use client"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
export default function ResetPasswordPage() {
  const supabase = createClient()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setMessage("")
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    })
    if (error) {
      setError(error.message)
    } else {
      setMessage("Check your email for the password reset link")
    }
    setLoading(false)
  }
  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Reset password</CardTitle>
        <CardDescription>
          Enter your email to receive a reset link
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleReset}>
        <CardContent className="space-y-4">
          {error && (
            <div className="text-sm text-red-500 bg-red-50 p-2 rounded">{error}</div>
          )}
          {message && (
            <div className="text-sm text-green-600 bg-green-50 p-2 rounded">{message}</div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Sending..." : "Send reset link"}
          </Button>
          
          <div className="text-sm text-center text-muted-foreground">
            Remember your password?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}
