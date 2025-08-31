"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

const ALLOWED_EMAILS = ["farmer1@example.com", "farmer2@example.com"]

export default function Page() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [farmName, setFarmName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (!ALLOWED_EMAILS.includes(email.toLowerCase())) {
      setError("Access restricted. Only authorized farm personnel can create accounts.")
      setIsLoading(false)
      return
    }

    if (password !== repeatPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
          data: {
            full_name: fullName,
            farm_name: farmName,
          },
        },
      })
      if (error) throw error
      router.push("/auth/sign-up-success")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-green-800 mb-2">🐄 Farm Manager</h1>
            <p className="text-green-600">Calving Management System</p>
          </div>
          <Card className="border-green-200 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-green-800">Create Account</CardTitle>
              <CardDescription className="text-green-600">Set up your farm management account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignUp}>
                <div className="flex flex-col gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="fullName" className="text-green-700">
                      Full Name
                    </Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="John Smith"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="border-green-200 focus:border-green-400"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="farmName" className="text-green-700">
                      Farm Name
                    </Label>
                    <Input
                      id="farmName"
                      type="text"
                      placeholder="Green Valley Farm"
                      required
                      value={farmName}
                      onChange={(e) => setFarmName(e.target.value)}
                      className="border-green-200 focus:border-green-400"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="text-green-700">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="border-green-200 focus:border-green-400"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password" className="text-green-700">
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="border-green-200 focus:border-green-400"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="repeat-password" className="text-green-700">
                      Confirm Password
                    </Label>
                    <Input
                      id="repeat-password"
                      type="password"
                      required
                      value={repeatPassword}
                      onChange={(e) => setRepeatPassword(e.target.value)}
                      className="border-green-200 focus:border-green-400"
                    />
                  </div>
                  {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}
                  <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Create Account"}
                  </Button>
                </div>
                <div className="mt-4 text-center text-sm text-green-600">
                  Already have an account?{" "}
                  <Link href="/auth/login" className="underline underline-offset-4 text-green-700 hover:text-green-800">
                    Sign in
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
