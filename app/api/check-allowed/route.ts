export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL!");
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY!");
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const email: string | undefined = body?.email;
    if (!email) {
      return NextResponse.json(
        { allowed: false, error: "missing_email" },
        { status: 400 }
      );
    }

    const normalized = email.toLowerCase().trim();
    const { data, error } = await supabase
      .from("allowed_emails")
      .select("email")
      .eq("email", normalized)
      .limit(1);

    if (error) {
      console.error("Supabase query error:", error);
      return NextResponse.json(
        { allowed: false, error: "db_error", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ allowed: !!(data && data.length) });
  } catch (err: any) {
    console.error("check-allowed error:", err);
    return NextResponse.json(
      { allowed: false, error: err?.message || "unknown_error" },
      { status: 500 }
    );
  }
}
