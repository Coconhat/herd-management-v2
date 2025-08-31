"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function AddMedicineForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    try {
      const { error } = await supabase.from("medicine_inventory").insert({
        user_id: user.id,
        name: formData.get("name") as string,
        type: formData.get("type") as string,
        manufacturer: (formData.get("manufacturer") as string) || null,
        batch_number: (formData.get("batch_number") as string) || null,
        expiry_date: (formData.get("expiry_date") as string) || null,
        quantity_remaining: Number.parseFloat(
          formData.get("quantity_remaining") as string
        ),
        unit: formData.get("unit") as string,
        cost_per_unit: formData.get("cost_per_unit")
          ? Number.parseFloat(formData.get("cost_per_unit") as string)
          : null,
        storage_location: (formData.get("storage_location") as string) || null,
        notes: (formData.get("notes") as string) || null,
      });

      if (error) throw error;

      router.push("/dashboard/medicine");
    } catch (error: any) {
      setError(error.message || "An error occurred while adding the medicine");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-green-200 shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="text-green-700">
            <Link href="/dashboard/medicine">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <CardTitle className="text-green-800">Medicine Information</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-green-700">
                Medicine Name *
              </Label>
              <Input
                id="name"
                name="name"
                required
                placeholder="e.g., Penicillin, Ivermectin"
                className="border-green-200 focus:border-green-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type" className="text-green-700">
                Type *
              </Label>
              <Select name="type" required>
                <SelectTrigger className="border-green-200 focus:border-green-400">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="antibiotic">Antibiotic</SelectItem>
                  <SelectItem value="vaccine">Vaccine</SelectItem>
                  <SelectItem value="vitamin">Vitamin</SelectItem>
                  <SelectItem value="hormone">Hormone</SelectItem>
                  <SelectItem value="dewormer">Dewormer</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="manufacturer" className="text-green-700">
                Manufacturer
              </Label>
              <Input
                id="manufacturer"
                name="manufacturer"
                placeholder="e.g., Zoetis, Merck"
                className="border-green-200 focus:border-green-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="batch_number" className="text-green-700">
                Batch Number
              </Label>
              <Input
                id="batch_number"
                name="batch_number"
                placeholder="e.g., BATCH123"
                className="border-green-200 focus:border-green-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity_remaining" className="text-green-700">
                Quantity *
              </Label>
              <Input
                id="quantity_remaining"
                name="quantity_remaining"
                type="number"
                step="0.01"
                required
                placeholder="e.g., 100"
                className="border-green-200 focus:border-green-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit" className="text-green-700">
                Unit *
              </Label>
              <Select name="unit" required>
                <SelectTrigger className="border-green-200 focus:border-green-400">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ml">ml</SelectItem>
                  <SelectItem value="tablets">Tablets</SelectItem>
                  <SelectItem value="doses">Doses</SelectItem>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="g">g</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiry_date" className="text-green-700">
                Expiry Date
              </Label>
              <Input
                id="expiry_date"
                name="expiry_date"
                type="date"
                className="border-green-200 focus:border-green-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost_per_unit" className="text-green-700">
                Cost per Unit
              </Label>
              <Input
                id="cost_per_unit"
                name="cost_per_unit"
                type="number"
                step="0.01"
                placeholder="e.g., 2.50"
                className="border-green-200 focus:border-green-400"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="storage_location" className="text-green-700">
              Storage Location
            </Label>
            <Input
              id="storage_location"
              name="storage_location"
              placeholder="e.g., Medicine Cabinet A, Refrigerator"
              className="border-green-200 focus:border-green-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-green-700">
              Notes
            </Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Any additional notes about this medicine..."
              className="border-green-200 focus:border-green-400"
              rows={3}
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </p>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? "Adding Medicine..." : "Add Medicine"}
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-green-300 text-green-700 bg-transparent"
            >
              <Link href="/dashboard/medicine">Cancel</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
