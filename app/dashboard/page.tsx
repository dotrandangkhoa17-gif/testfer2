"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/navbar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { Resource } from "@/lib/types"

export default function DashboardPage() {
  const router = useRouter()
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchResources = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }

      const { data, error } = await supabase
        .from("resources")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        toast.error("Lỗi tải dữ liệu: " + error.message)
      } else {
        setResources(data ?? [])
      }
      setLoading(false)
    }

    fetchResources()
  }, [router])

  const handleDelete = async (id: string, imageUrl: string | null) => {
    // Delete image from storage if exists
    if (imageUrl) {
      const path = imageUrl.split("/resource-images/")[1]
      if (path) {
        await supabase.storage.from("resource-images").remove([path])
      }
    }

    const { error } = await supabase.from("resources").delete().eq("id", id)
    if (error) {
      toast.error("Xóa thất bại: " + error.message)
    } else {
      toast.success("Đã xóa tài nguyên!")
      setResources((prev) => prev.filter((r) => r.id !== id))
    }
  }

  if (loading) {
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
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Quản lý tài nguyên của bạn</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/create">+ Thêm tài nguyên</Link>
          </Button>
        </div>

        {/* Resource List */}
        {resources.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed p-16 text-center">
            <span className="text-5xl mb-4">📭</span>
            <h3 className="text-xl font-semibold">Bạn chưa có tài nguyên nào</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Nhấn &quot;Thêm tài nguyên&quot; để bắt đầu.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {resources.map((resource) => (
              <Card key={resource.id} className="flex flex-col sm:flex-row overflow-hidden">
                {/* Thumbnail */}
                <div className="relative h-40 w-full sm:h-auto sm:w-48 shrink-0 bg-muted">
                  {resource.image_url ? (
                    <Image
                      src={resource.image_url}
                      alt={resource.title}
                      fill
                      className="object-cover"
                      sizes="192px"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-3xl text-muted-foreground">
                      📦
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-4 sm:p-6">
                  <CardHeader className="p-0 pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg">{resource.title}</CardTitle>
                      {resource.category && (
                        <Badge variant="secondary">{resource.category}</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 flex-1">
                    <a
                      href={resource.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline break-all"
                    >
                      {resource.link}
                    </a>
                  </CardContent>

                  {/* Actions */}
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/edit/${resource.id}`}>✏️ Sửa</Link>
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">🗑️ Xóa</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                          <AlertDialogDescription>
                            Bạn có chắc muốn xóa &quot;{resource.title}&quot;? Hành động này không thể hoàn tác.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Hủy</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(resource.id, resource.image_url)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Xóa
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
