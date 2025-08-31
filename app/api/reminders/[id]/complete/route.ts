import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }

    const { error } = await supabase
      .from("reminders")
      .update({
        completed: true,
        completed_date: new Date().toISOString(),
      })
      .eq("id", params.id)
      .eq("user_id", user.id)

    if (error) throw error

    return NextResponse.redirect(new URL("/dashboard/reminders", request.url))
  } catch (error) {
    console.error("Error completing reminder:", error)
    return NextResponse.redirect(new URL("/dashboard/reminders?error=failed", request.url))
  }
}
