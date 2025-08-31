"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

interface Cow {
  id: string
  tag_number: string
  name: string | null
}

export function AddMilkingForm({ cows }: { cows: Cow[] }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError("You must be logged in to record milking")
      setIsLoading(false)
      return
    }

    try {
      const milkingData = {
        user_id: user.id,
        cow_id: formData.get("cow_id") as string,
        milking_date: formData.get("milking_date") as string,
        milking_time: formData.get("milking_time") as string,
        milk_yield_liters: Number.parseFloat(formData.get("milk_yield_liters") as string),
        milk_quality: formData.get("milk_quality") as string,
        notes: (formData.get("notes") as string) || null,
      }

      const { error } = await supabase.from("milking_records").insert(milkingData)
      if (error) throw error

      router.push("/dashboard/milking")
    } catch (error: any) {
      setError(error.message || "An error occurred while recording the milking")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-green-200 shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="text-green-700">
            <Link href="/dashboard/milking">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <CardTitle className="text-green-800">Milking Record</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cow_id" className="text-green-700">
                Cow *
              </Label>
              <Select name="cow_id" required>
                <SelectTrigger className="border-green-200 focus:border-green-400">
                  <SelectValue placeholder="Select a cow" />
                </SelectTrigger>
                <SelectContent>
                  {cows.map((cow) => (
                    <SelectItem key={cow.id} value={cow.id}>
                      {cow.name || `Cow #${cow.tag_number}`} (#{cow.tag_number})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="milking_date" className="text-green-700">
                Milking Date *
              </Label>
              <Input
                id="milking_date"
                name="milking_date"
                type="date"
                required
                defaultValue={new Date().toISOString().split("T")[0]}
                className="border-green-200 focus:border-green-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="milking_time" className="text-green-700">
                Milking Time *
              </Label>
              <Select name="milking_time" required>
                <SelectTrigger className="border-green-200 focus:border-green-400">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning</SelectItem>
                  <SelectItem value="afternoon">Afternoon</SelectItem>
                  <SelectItem value="evening">Evening</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="milk_yield_liters" className="text-green-700">
                Milk Yield (Liters) *
              </Label>
              <Input
                id="milk_yield_liters"
                name="milk_yield_liters"
                type="number"
                step="0.1"
                required
                placeholder="e.g., 15.5"
                className="border-green-200 focus:border-green-400"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="milk_quality" className="text-green-700">
              Milk Quality *
            </Label>
            <Select name="milk_quality" defaultValue="normal" required>
              <SelectTrigger className="border-green-200 focus:border-green-400">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="abnormal">Abnormal</SelectItem>
                <SelectItem value="bloody">Bloody</SelectItem>
                <SelectItem value="watery">Watery</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-green-700">
              Notes
            </Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Any additional notes about this milking session..."
              className="border-green-200 focus:border-green-400"
              rows={3}
            />
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading} className="bg-green-600 hover:bg-green-700">
              {isLoading ? "Recording Milking..." : "Record Milking"}
            </Button>
            <Button asChild variant="outline" className="border-green-300 text-green-700 bg-transparent">
              <Link href="/dashboard/milking">Cancel</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
