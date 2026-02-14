"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ArrowLeft, Plus } from "lucide-react"
import Link from "next/link"
export default function ProductsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [products, setProducts] = useState<any[]>([])
  const [newProduct, setNewProduct] = useState({
    product_name: "",
    category: "cleanser",
    notes: ""
  })
  useEffect(() => {
    fetchProducts()
  }, [])
  const fetchProducts = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from("user_skin_products")
      .select("*")
      .eq("user_id", user.id)
      .order("added_at", { ascending: false })
    setProducts(data || [])
  }
  const addProduct = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !newProduct.product_name) return
    await supabase.from("user_skin_products").insert({
      user_id: user.id,
      ...newProduct
    })
    setNewProduct({ product_name: "", category: "cleanser", notes: "" })
    fetchProducts()
  }
  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "paused" : "active"
    await supabase
      .from("user_skin_products")
      .update({ status: newStatus })
      .eq("id", id)
    fetchProducts()
  }
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>
      case "paused":
        return <Badge variant="secondary">Paused</Badge>
      case "finished":
        return <Badge variant="outline">Finished</Badge>
      default:
        return null
    }
  }
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-6">
          <Button asChild variant="ghost" size="icon">
            <Link href="/skincare">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">My Products</h1>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button className="w-full mb-4">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom">
            <SheetHeader>
              <SheetTitle>Add New Product</SheetTitle>
            </SheetHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Product Name</Label>
                <Input
                  value={newProduct.product_name}
                  onChange={(e) => setNewProduct({...newProduct, product_name: e.target.value})}
                  placeholder="e.g., Cetaphil Gentle Cleanser"
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3"
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                >
                  <option value="cleanser">Cleanser</option>
                  <option value="toner">Toner</option>
                  <option value="moisturizer">Moisturizer</option>
                  <option value="spf">SPF</option>
                  <option value="treatment">Treatment</option>
                  <option value="eye_cream">Eye Cream</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Notes (optional)</Label>
                <Input
                  value={newProduct.notes}
                  onChange={(e) => setNewProduct({...newProduct, notes: e.target.value})}
                  placeholder="Any notes about this product"
                />
              </div>
              <Button onClick={addProduct} className="w-full">
                Add Product
              </Button>
            </div>
          </SheetContent>
        </Sheet>
        <div className="space-y-3">
          {products.map((product) => (
            <Card key={product.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{product.product_name}</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {product.category}
                    </p>
                    {product.notes && (
                      <p className="text-xs text-muted-foreground mt-1">{product.notes}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(product.status)}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleStatus(product.id, product.status)}
                    >
                      {product.status === "active" ? "Pause" : "Resume"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {products.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            No products added yet. Add your skincare products to track them.
          </p>
        )}
      </div>
    </div>
  )
}
