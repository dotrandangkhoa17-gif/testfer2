"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import type { Resource } from "@/lib/types"

export default function EditResourcePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [isLoading, setIsLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [title, setTitle] = useState("")
  const [link, setLink] = useState("")
  const [category, setCategory] = useState("")
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  useEffect(() => {
    const fetchResource = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }

      const { data, error } = await supabase
        .from("resources")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single()

      if (error || !data) {
        toast.error("Không tìm thấy tài nguyên hoặc bạn không có quyền sửa.")
        router.push("/dashboard")
        return
      }

      const resource = data as Resource
      setTitle(resource.title)
      setLink(resource.link)
      setCategory(resource.category || "")
      setCurrentImageUrl(resource.image_url)
      if (resource.image_url) setPreview(resource.image_url)
      setFetching(false)
    }

    fetchResource()
  }, [id, router])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !link.trim()) {
      toast.error("Vui lòng nhập Title và Link!")
      return
    }

    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error("Bạn cần đăng nhập!")
        router.push("/login")
        return
      }

      let image_url = currentImageUrl

      // Upload new image if selected
      if (imageFile) {
        // Delete old image
        if (currentImageUrl) {
          const oldPath = currentImageUrl.split("/resource-images/")[1]
          if (oldPath) {
            await supabase.storage.from("resource-images").remove([oldPath])
          }
        }

        const fileExt = imageFile.name.split(".").pop()
        const fileName = `${user.id}/${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from("resource-images")
          .upload(fileName, imageFile)

        if (uploadError) {
          toast.error("Upload ảnh thất bại: " + uploadError.message)
          setIsLoading(false)
          return
        }

        const { data: publicUrl } = supabase.storage
          .from("resource-images")
          .getPublicUrl(fileName)

        image_url = publicUrl.publicUrl
      }

      // Update resource
      const { error } = await supabase
        .from("resources")
        .update({
          title: title.trim(),
          link: link.trim(),
          category: category.trim() || null,
          image_url,
        })
        .eq("id", id)
        .eq("user_id", user.id)

      if (error) {
        toast.error("Cập nhật thất bại: " + error.message)
      } else {
        toast.success("Cập nhật thành công!")
        router.push("/dashboard")
      }
    } catch {
      toast.error("Đã xảy ra lỗi. Vui lòng thử lại.")
    } finally {
      setIsLoading(false)
    }
  }

  if (fetching) {
    return (
      <>
        <Navbar />
        <div className="flex h-[60vh] items-center justify-center">
          <div className="text-muted-foreground">Đang tải...</div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Chỉnh sửa tài nguyên</CardTitle>
            <CardDescription>Cập nhật thông tin tài nguyên bên dưới.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Tiêu đề *</Label>
                <Input
                  id="title"
                  placeholder="VD: React Documentation"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              {/* Link */}
              <div className="space-y-2">
                <Label htmlFor="link">Link / URL *</Label>
                <Input
                  id="link"
                  type="url"
                  placeholder="https://example.com"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  required
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  placeholder="VD: Next.js, AI, UI/UX..."
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label htmlFor="image">Hình ảnh</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="cursor-pointer"
                />
                {preview && (
                  <div className="mt-2 relative h-40 w-full overflow-hidden rounded-lg border bg-muted">
                    <img
                      src={preview}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/dashboard")}
                >
                  Hủy
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
