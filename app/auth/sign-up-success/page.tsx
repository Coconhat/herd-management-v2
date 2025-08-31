import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Page() {
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
              <CardTitle className="text-2xl text-green-800">Account Created Successfully!</CardTitle>
              <CardDescription className="text-green-600">
                Please check your email to verify your account
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-4">
                <p className="text-sm text-green-700">
                  We've sent a verification email to your inbox. Please click the link in the email to activate your
                  account before signing in.
                </p>
                <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                  <Link href="/auth/login">Return to Sign In</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
