"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, Home } from "lucide-react"

const pathNameMap: Record<string, string> = {
  dashboard: "Dashboard",
  cows: "Cows",
  bulls: "Bulls",
  breeding: "Breeding",
  medicine: "Medicine",
  milking: "Milking",
  reminders: "Reminders",
  reports: "Reports",
  add: "Add",
  edit: "Edit",
  treatments: "Treatments",
  pregnancies: "Pregnancies",
}

export default function Breadcrumbs() {
  const pathname = usePathname()
  const pathSegments = pathname.split("/").filter(Boolean)

  if (pathSegments.length <= 1) return null

  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = "/" + pathSegments.slice(0, index + 1).join("/")
    const isLast = index === pathSegments.length - 1
    const name = pathNameMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)

    return {
      name,
      href,
      isLast,
    }
  })

  return (
    <nav className="flex mb-6" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2 text-sm">
        <li>
          <Link href="/dashboard" className="text-green-600 hover:text-green-800 flex items-center">
            <Home className="w-4 h-4" />
          </Link>
        </li>
        {breadcrumbs.slice(1).map((breadcrumb) => (
          <li key={breadcrumb.href} className="flex items-center">
            <ChevronRight className="w-4 h-4 text-green-400 mx-2" />
            {breadcrumb.isLast ? (
              <span className="text-green-800 font-medium">{breadcrumb.name}</span>
            ) : (
              <Link href={breadcrumb.href} className="text-green-600 hover:text-green-800">
                {breadcrumb.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
