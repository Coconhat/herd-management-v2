"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Home, Cog as Cow, Users, Heart, Pill, Droplets, Bell, BarChart3, Menu, LogOut, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface DashboardNavProps {
  user: any
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Cows", href: "/dashboard/cows", icon: Cow },
  { name: "Bulls", href: "/dashboard/bulls", icon: Users },
  { name: "Breeding", href: "/dashboard/breeding", icon: Heart },
  { name: "Medicine", href: "/dashboard/medicine", icon: Pill },
  { name: "Milking", href: "/dashboard/milking", icon: Droplets },
  { name: "Reminders", href: "/dashboard/reminders", icon: Bell },
  { name: "Reports", href: "/dashboard/reports", icon: BarChart3, disabled: true },
]

export default function DashboardNav({ user }: DashboardNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createBrowserClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const NavItems = () => (
    <>
      {navigation.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
        const Icon = item.icon

        return (
          <Link
            key={item.name}
            href={item.disabled ? "#" : item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              isActive
                ? "bg-green-600 text-white shadow-sm"
                : item.disabled
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-green-700 hover:bg-green-100 hover:text-green-800",
            )}
            onClick={() => setMobileMenuOpen(false)}
          >
            <Icon className="w-5 h-5" />
            {item.name}
            {item.disabled && <span className="ml-auto text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">Soon</span>}
          </Link>
        )
      })}
    </>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white border-r border-green-200 px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center border-b border-green-100">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <Cow className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-green-800">Farm Manager</span>
            </Link>
          </div>

          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  <NavItems />
                </ul>
              </li>

              <li className="mt-auto">
                <div className="border-t border-green-100 pt-4">
                  <div className="flex items-center gap-3 px-3 py-2 text-sm text-green-700 mb-3">
                    <User className="w-5 h-5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{user.email}</p>
                    </div>
                  </div>
                  <Button
                    onClick={handleSignOut}
                    variant="outline"
                    className="w-full border-green-300 text-green-700 hover:bg-green-100 bg-transparent"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-white px-4 py-4 shadow-sm sm:px-6 lg:hidden border-b border-green-200">
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="border-green-300 bg-transparent">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
              <div className="flex h-16 shrink-0 items-center border-b border-green-100">
                <Link href="/dashboard" className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                    <Cow className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold text-green-800">Farm Manager</span>
                </Link>
              </div>

              <nav className="flex flex-1 flex-col">
                <ul role="list" className="flex flex-1 flex-col gap-y-7">
                  <li>
                    <ul role="list" className="-mx-2 space-y-1">
                      <NavItems />
                    </ul>
                  </li>

                  <li className="mt-auto">
                    <div className="border-t border-green-100 pt-4">
                      <div className="flex items-center gap-3 px-3 py-2 text-sm text-green-700 mb-3">
                        <User className="w-5 h-5" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{user.email}</p>
                        </div>
                      </div>
                      <Button
                        onClick={handleSignOut}
                        variant="outline"
                        className="w-full border-green-300 text-green-700 hover:bg-green-100 bg-transparent"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  </li>
                </ul>
              </nav>
            </div>
          </SheetContent>
        </Sheet>

        <div className="flex-1 text-sm font-semibold leading-6 text-green-800">Farm Manager</div>
      </div>
    </>
  )
}
