// app/api/check-allowed/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ allowed: false }, { status: 400 });

    const { data, error } = await supabase
      .from("allowed_emails")
      .select("email")
      .eq("email", email.toLowerCase().trim())
      .limit(1);

    if (error) throw error;
    return NextResponse.json({ allowed: !!(data && data.length) });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ allowed: false }, { status: 500 });
  }
}
