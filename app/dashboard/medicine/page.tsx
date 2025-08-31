import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Plus, Eye, Edit, AlertTriangle, Package } from "lucide-react"

export default async function MedicinePage() {
  const supabase = await createClient()

  const { data: user, error } = await supabase.auth.getUser()
  if (error || !user?.user) {
    redirect("/auth/login")
  }

  const { data: medicines } = await supabase
    .from("medicine_inventory")
    .select("*")
    .eq("user_id", user.user.id)
    .order("name")

  const { data: recentTreatments } = await supabase
    .from("medicine_treatments")
    .select(`
      *,
      cows (tag_number, name),
      medicine_inventory (name, type)
    `)
    .eq("user_id", user.user.id)
    .order("treatment_date", { ascending: false })
    .limit(5)

  const getTypeColor = (type: string) => {
    switch (type) {
      case "antibiotic":
        return "bg-red-100 text-red-800 border-red-200"
      case "vaccine":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "vitamin":
        return "bg-green-100 text-green-800 border-green-200"
      case "hormone":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "dewormer":
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const isExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate)
    const now = new Date()
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0
  }

  const isExpired = (expiryDate: string) => {
    const expiry = new Date(expiryDate)
    const now = new Date()
    return expiry < now
  }

  const lowStockMedicines = medicines?.filter((med) => med.quantity_remaining <= 10) || []
  const expiringSoonMedicines = medicines?.filter((med) => med.expiry_date && isExpiringSoon(med.expiry_date)) || []
  const expiredMedicines = medicines?.filter((med) => med.expiry_date && isExpired(med.expiry_date)) || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-green-800 mb-2">💊 Medicine & Treatment</h1>
            <p className="text-green-600">Manage medicine inventory and track treatments</p>
          </div>
          <div className="flex gap-2">
            <Button asChild className="bg-green-600 hover:bg-green-700">
              <Link href="/dashboard/medicine/add">
                <Plus className="w-4 h-4 mr-2" />
                Add Medicine
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-green-300 text-green-700 hover:bg-green-100 bg-transparent"
            >
              <Link href="/dashboard/treatments/add">Record Treatment</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-green-300 text-green-700 hover:bg-green-100 bg-transparent"
            >
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        </div>

        {/* Alerts */}
        {(lowStockMedicines.length > 0 || expiringSoonMedicines.length > 0 || expiredMedicines.length > 0) && (
          <div className="mb-6 space-y-3">
            {expiredMedicines.length > 0 && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-red-800">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="font-semibold">Expired Medicines: {expiredMedicines.length}</span>
                  </div>
                </CardContent>
              </Card>
            )}
            {expiringSoonMedicines.length > 0 && (
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-orange-800">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="font-semibold">Expiring Soon: {expiringSoonMedicines.length}</span>
                  </div>
                </CardContent>
              </Card>
            )}
            {lowStockMedicines.length > 0 && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <Package className="w-5 h-5" />
                    <span className="font-semibold">Low Stock: {lowStockMedicines.length}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Medicine Inventory */}
          <div>
            <h2 className="text-2xl font-bold text-green-800 mb-4">Medicine Inventory</h2>
            {!medicines || medicines.length === 0 ? (
              <Card className="border-green-200 shadow-lg">
                <CardContent className="text-center py-12">
                  <Package className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-green-800 mb-2">No Medicines</h3>
                  <p className="text-green-600 mb-4">Start building your medicine inventory.</p>
                  <Button asChild className="bg-green-600 hover:bg-green-700">
                    <Link href="/dashboard/medicine/add">
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Medicine
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {medicines.map((medicine) => (
                  <Card key={medicine.id} className="border-green-200 shadow-lg">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-green-800">{medicine.name}</h3>
                          <p className="text-sm text-green-600">{medicine.manufacturer}</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={getTypeColor(medicine.type)}>{medicine.type}</Badge>
                          {medicine.expiry_date && isExpired(medicine.expiry_date) && (
                            <Badge className="bg-red-100 text-red-800 border-red-200">Expired</Badge>
                          )}
                          {medicine.expiry_date && isExpiringSoon(medicine.expiry_date) && (
                            <Badge className="bg-orange-100 text-orange-800 border-orange-200">Expiring Soon</Badge>
                          )}
                          {medicine.quantity_remaining <= 10 && (
                            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Low Stock</Badge>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-green-700">
                        <div>
                          <span className="text-green-600">Stock:</span> {medicine.quantity_remaining} {medicine.unit}
                        </div>
                        {medicine.expiry_date && (
                          <div>
                            <span className="text-green-600">Expires:</span>{" "}
                            {new Date(medicine.expiry_date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button
                          asChild
                          size="sm"
                          variant="outline"
                          className="border-green-300 text-green-700 bg-transparent"
                        >
                          <Link href={`/dashboard/medicine/${medicine.id}`}>
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Link>
                        </Button>
                        <Button
                          asChild
                          size="sm"
                          variant="outline"
                          className="border-green-300 text-green-700 bg-transparent"
                        >
                          <Link href={`/dashboard/medicine/${medicine.id}/edit`}>
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Recent Treatments */}
          <div>
            <h2 className="text-2xl font-bold text-green-800 mb-4">Recent Treatments</h2>
            {!recentTreatments || recentTreatments.length === 0 ? (
              <Card className="border-green-200 shadow-lg">
                <CardContent className="text-center py-12">
                  <div className="text-6xl mb-4">💉</div>
                  <h3 className="text-xl font-semibold text-green-800 mb-2">No Treatments</h3>
                  <p className="text-green-600 mb-4">Treatment records will appear here.</p>
                  <Button asChild className="bg-green-600 hover:bg-green-700">
                    <Link href="/dashboard/treatments/add">
                      <Plus className="w-4 h-4 mr-2" />
                      Record Treatment
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {recentTreatments.map((treatment) => (
                  <Card key={treatment.id} className="border-green-200 shadow-lg">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-green-800">
                            {treatment.cows?.name || `Cow #${treatment.cows?.tag_number}`}
                          </h3>
                          <p className="text-sm text-green-600">
                            {new Date(treatment.treatment_date).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className={getTypeColor(treatment.medicine_inventory?.type || "other")}>
                          {treatment.medicine_inventory?.type}
                        </Badge>
                      </div>
                      <div className="text-sm text-green-700">
                        <p>
                          <span className="text-green-600">Medicine:</span> {treatment.medicine_inventory?.name}
                        </p>
                        <p>
                          <span className="text-green-600">Dosage:</span> {treatment.dosage} {treatment.unit}
                        </p>
                        <p>
                          <span className="text-green-600">Reason:</span> {treatment.reason}
                        </p>
                        {treatment.withdrawal_end_date && (
                          <p>
                            <span className="text-green-600">Withdrawal until:</span>{" "}
                            {new Date(treatment.withdrawal_end_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <Button asChild variant="outline" className="w-full border-green-300 text-green-700 bg-transparent">
                  <Link href="/dashboard/treatments">View All Treatments</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
