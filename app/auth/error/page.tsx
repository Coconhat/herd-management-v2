import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>
}) {
  const params = await searchParams

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-green-800 mb-2">🐄 Farm Manager</h1>
            <p className="text-green-600">Calving Management System</p>
          </div>
          <Card className="border-red-200 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-red-700">Authentication Error</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              {params?.error ? (
                <p className="text-sm text-red-600 bg-red-50 p-3 rounded">Error: {params.error}</p>
              ) : (
                <p className="text-sm text-red-600 bg-red-50 p-3 rounded">An authentication error occurred.</p>
              )}
              <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                <Link href="/auth/login">Try Again</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
