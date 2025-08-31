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

interface BreedingRecord {
  id: string
  breeding_date: string
  cows: {
    tag_number: string
    name: string | null
  }
}

export function AddPregnancyForm({ cows, breedingRecords }: { cows: Cow[]; breedingRecords: BreedingRecord[] }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const calculateExpectedCalvingDate = (conceptionDate: string) => {
    const conception = new Date(conceptionDate)
    const expectedCalving = new Date(conception)
    expectedCalving.setDate(conception.getDate() + 283) // Average gestation period for cattle
    return expectedCalving.toISOString().split("T")[0]
  }

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
      setError("You must be logged in to add a pregnancy record")
      setIsLoading(false)
      return
    }

    try {
      const conceptionDate = formData.get("conception_date") as string
      const expectedCalvingDate =
        (formData.get("expected_calving_date") as string) || calculateExpectedCalvingDate(conceptionDate)

      const pregnancyData = {
        user_id: user.id,
        cow_id: formData.get("cow_id") as string,
        breeding_record_id: (formData.get("breeding_record_id") as string) || null,
        conception_date: conceptionDate,
        expected_calving_date: expectedCalvingDate,
        pregnancy_status: "confirmed",
        notes: (formData.get("notes") as string) || null,
      }

      const { error: pregnancyError } = await supabase.from("pregnancies").insert(pregnancyData)
      if (pregnancyError) throw pregnancyError

      // Update cow status to pregnant
      const { error: cowError } = await supabase
        .from("cows")
        .update({ status: "pregnant" })
        .eq("id", formData.get("cow_id") as string)
      if (cowError) throw cowError

      // Update breeding record success if linked
      const breedingRecordId = formData.get("breeding_record_id") as string
      if (breedingRecordId) {
        const { error: breedingError } = await supabase
          .from("breeding_records")
          .update({ success: true })
          .eq("id", breedingRecordId)
        if (breedingError) throw breedingError
      }

      router.push("/dashboard/breeding")
    } catch (error: any) {
      setError(error.message || "An error occurred while adding the pregnancy record")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-green-200 shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="text-green-700">
            <Link href="/dashboard/breeding">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <CardTitle className="text-green-800">Pregnancy Confirmation</CardTitle>
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
              <Label htmlFor="breeding_record_id" className="text-green-700">
                Related Breeding Record (Optional)
              </Label>
              <Select name="breeding_record_id">
                <SelectTrigger className="border-green-200 focus:border-green-400">
                  <SelectValue placeholder="Select breeding record" />
                </SelectTrigger>
                <SelectContent>
                  {breedingRecords.map((record) => (
                    <SelectItem key={record.id} value={record.id}>
                      {record.cows.name || `Cow #${record.cows.tag_number}`} -{" "}
                      {new Date(record.breeding_date).toLocaleDateString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="conception_date" className="text-green-700">
                Conception Date *
              </Label>
              <Input
                id="conception_date"
                name="conception_date"
                type="date"
                required
                className="border-green-200 focus:border-green-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expected_calving_date" className="text-green-700">
                Expected Calving Date
              </Label>
              <Input
                id="expected_calving_date"
                name="expected_calving_date"
                type="date"
                className="border-green-200 focus:border-green-400"
                placeholder="Auto-calculated if left empty"
              />
              <p className="text-xs text-green-600">Leave empty to auto-calculate (283 days from conception)</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-green-700">
              Notes
            </Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Any additional notes about this pregnancy..."
              className="border-green-200 focus:border-green-400"
              rows={3}
            />
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading} className="bg-green-600 hover:bg-green-700">
              {isLoading ? "Confirming Pregnancy..." : "Confirm Pregnancy"}
            </Button>
            <Button asChild variant="outline" className="border-green-300 text-green-700 bg-transparent">
              <Link href="/dashboard/breeding">Cancel</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
