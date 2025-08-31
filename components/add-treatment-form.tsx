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

interface Medicine {
  id: string
  name: string
  type: string
  unit: string
  quantity_remaining: number
}

export function AddTreatmentForm({ cows, medicines }: { cows: Cow[]; medicines: Medicine[] }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null)
  const router = useRouter()

  const handleMedicineChange = (medicineId: string) => {
    const medicine = medicines.find((m) => m.id === medicineId)
    setSelectedMedicine(medicine || null)
  }

  const calculateWithdrawalEndDate = (treatmentDate: string, withdrawalDays: number) => {
    const treatment = new Date(treatmentDate)
    const withdrawalEnd = new Date(treatment)
    withdrawalEnd.setDate(treatment.getDate() + withdrawalDays)
    return withdrawalEnd.toISOString().split("T")[0]
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
      setError("You must be logged in to record a treatment")
      setIsLoading(false)
      return
    }

    try {
      const treatmentDate = formData.get("treatment_date") as string
      const withdrawalDays = Number.parseInt(formData.get("withdrawal_period_days") as string) || 0
      const dosage = Number.parseFloat(formData.get("dosage") as string)

      const treatmentData = {
        user_id: user.id,
        cow_id: formData.get("cow_id") as string,
        medicine_id: formData.get("medicine_id") as string,
        treatment_date: treatmentDate,
        dosage: dosage,
        unit: formData.get("unit") as string,
        reason: formData.get("reason") as string,
        withdrawal_period_days: withdrawalDays,
        withdrawal_end_date: withdrawalDays > 0 ? calculateWithdrawalEndDate(treatmentDate, withdrawalDays) : null,
        administered_by: (formData.get("administered_by") as string) || null,
        notes: (formData.get("notes") as string) || null,
      }

      const { error: treatmentError } = await supabase.from("medicine_treatments").insert(treatmentData)
      if (treatmentError) throw treatmentError

      // Update medicine inventory
      if (selectedMedicine) {
        const newQuantity = selectedMedicine.quantity_remaining - dosage
        const { error: inventoryError } = await supabase
          .from("medicine_inventory")
          .update({
            quantity_remaining: Math.max(0, newQuantity),
            updated_at: new Date().toISOString(),
          })
          .eq("id", selectedMedicine.id)
        if (inventoryError) throw inventoryError
      }

      router.push("/dashboard/medicine")
    } catch (error: any) {
      setError(error.message || "An error occurred while recording the treatment")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-green-200 shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="text-green-700">
            <Link href="/dashboard/medicine">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <CardTitle className="text-green-800">Treatment Record</CardTitle>
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
              <Label htmlFor="medicine_id" className="text-green-700">
                Medicine *
              </Label>
              <Select name="medicine_id" onValueChange={handleMedicineChange} required>
                <SelectTrigger className="border-green-200 focus:border-green-400">
                  <SelectValue placeholder="Select medicine" />
                </SelectTrigger>
                <SelectContent>
                  {medicines.map((medicine) => (
                    <SelectItem key={medicine.id} value={medicine.id}>
                      {medicine.name} ({medicine.quantity_remaining} {medicine.unit} available)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="treatment_date" className="text-green-700">
                Treatment Date *
              </Label>
              <Input
                id="treatment_date"
                name="treatment_date"
                type="date"
                required
                className="border-green-200 focus:border-green-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dosage" className="text-green-700">
                Dosage *
              </Label>
              <Input
                id="dosage"
                name="dosage"
                type="number"
                step="0.01"
                required
                placeholder="e.g., 5.0"
                className="border-green-200 focus:border-green-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit" className="text-green-700">
                Unit *
              </Label>
              <Input
                id="unit"
                name="unit"
                required
                value={selectedMedicine?.unit || ""}
                placeholder="Unit"
                className="border-green-200 focus:border-green-400"
                readOnly
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason" className="text-green-700">
              Reason for Treatment *
            </Label>
            <Input
              id="reason"
              name="reason"
              required
              placeholder="e.g., Mastitis, Lameness, Vaccination"
              className="border-green-200 focus:border-green-400"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="withdrawal_period_days" className="text-green-700">
                Withdrawal Period (Days)
              </Label>
              <Input
                id="withdrawal_period_days"
                name="withdrawal_period_days"
                type="number"
                min="0"
                placeholder="e.g., 7"
                className="border-green-200 focus:border-green-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="administered_by" className="text-green-700">
                Administered By
              </Label>
              <Input
                id="administered_by"
                name="administered_by"
                placeholder="e.g., Dr. Smith, Farm Manager"
                className="border-green-200 focus:border-green-400"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-green-700">
              Notes
            </Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Any additional notes about this treatment..."
              className="border-green-200 focus:border-green-400"
              rows={3}
            />
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading} className="bg-green-600 hover:bg-green-700">
              {isLoading ? "Recording Treatment..." : "Record Treatment"}
            </Button>
            <Button asChild variant="outline" className="border-green-300 text-green-700 bg-transparent">
              <Link href="/dashboard/medicine">Cancel</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
