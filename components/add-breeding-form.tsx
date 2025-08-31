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

interface Cow {
  id: string;
  tag_number: string;
  name: string | null;
}

interface Bull {
  id: string;
  name: string;
}

export function AddBreedingForm({
  cows,
  bulls,
}: {
  cows: Cow[];
  bulls: Bull[];
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [breedingType, setBreedingType] = useState<string>("natural");
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
      const breedingData = {
        user_id: user.id,
        cow_id: formData.get("cow_id") as string,
        breeding_date: formData.get("breeding_date") as string,
        breeding_type: formData.get("breeding_type") as string,
        notes: (formData.get("notes") as string) || null,
        bull_id:
          breedingType === "natural"
            ? (formData.get("bull_id") as string) || null
            : null,
        semen_batch:
          breedingType === "artificial_insemination"
            ? (formData.get("semen_batch") as string) || null
            : null,
        technician_name:
          breedingType === "artificial_insemination"
            ? (formData.get("technician_name") as string) || null
            : null,
      };

      const { error } = await supabase
        .from("breeding_records")
        .insert(breedingData);

      if (error) throw error;

      router.push("/dashboard/breeding");
    } catch (error: any) {
      setError(
        error.message || "An error occurred while adding the breeding record"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-green-200 shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="text-green-700">
            <Link href="/dashboard/breeding">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <CardTitle className="text-green-800">Breeding Record</CardTitle>
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
              <Label htmlFor="breeding_date" className="text-green-700">
                Breeding Date *
              </Label>
              <Input
                id="breeding_date"
                name="breeding_date"
                type="date"
                required
                className="border-green-200 focus:border-green-400"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="breeding_type" className="text-green-700">
              Breeding Type *
            </Label>
            <Select
              name="breeding_type"
              value={breedingType}
              onValueChange={setBreedingType}
              required
            >
              <SelectTrigger className="border-green-200 focus:border-green-400">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="natural">Natural Breeding</SelectItem>
                <SelectItem value="artificial_insemination">
                  Artificial Insemination
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {breedingType === "natural" && (
            <div className="space-y-2">
              <Label htmlFor="bull_id" className="text-green-700">
                Bull
              </Label>
              <Select name="bull_id">
                <SelectTrigger className="border-green-200 focus:border-green-400">
                  <SelectValue placeholder="Select a bull" />
                </SelectTrigger>
                <SelectContent>
                  {bulls.map((bull) => (
                    <SelectItem key={bull.id} value={bull.id}>
                      {bull.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {breedingType === "artificial_insemination" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="semen_batch" className="text-green-700">
                  Semen Batch
                </Label>
                <Input
                  id="semen_batch"
                  name="semen_batch"
                  placeholder="e.g., BATCH001"
                  className="border-green-200 focus:border-green-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="technician_name" className="text-green-700">
                  Technician Name
                </Label>
                <Input
                  id="technician_name"
                  name="technician_name"
                  placeholder="e.g., Dr. Smith"
                  className="border-green-200 focus:border-green-400"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-green-700">
              Notes
            </Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Any additional notes about this breeding..."
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
              {isLoading ? "Adding Record..." : "Add Breeding Record"}
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-green-300 text-green-700 bg-transparent"
            >
              <Link href="/dashboard/breeding">Cancel</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
