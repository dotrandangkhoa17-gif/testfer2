"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { supabase } from "@/lib/supabase"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import type { Resource } from "@/lib/types"

export default function HomePage() {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchResources = async () => {
      const { data, error } = await supabase
        .from("resources")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching resources:", error.message)
      } else {
        setResources(data ?? [])
      }
      setLoading(false)
    }

    fetchResources()
  }, [])

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* ═══════════ HERO SECTION ═══════════ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/4 top-0 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute right-1/4 top-20 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />
        </div>

        <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 sm:py-24 lg:px-8">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
            </span>
            Nền tảng chia sẻ tài nguyên học tập
          </div>

          <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Khám phá tài nguyên{" "}
            <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
              học tập chất lượng
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Tổng hợp tài nguyên từ cộng đồng — chia sẻ, quản lý và khám phá
            những nguồn học tập hữu ích nhất.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:brightness-110 sm:w-auto"
            >
              🚀 Bắt đầu chia sẻ
            </Link>
            <Link
              href="#resources"
              className="w-full rounded-xl border border-border bg-background px-8 py-3.5 text-base font-semibold text-foreground transition-colors hover:bg-accent sm:w-auto"
            >
              Xem tài nguyên
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════ RESOURCES ═══════════ */}
      <section id="resources" className="border-t bg-muted/40 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              📚 Tất cả tài nguyên
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Danh sách tài nguyên được chia sẻ bởi tất cả thành viên
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="text-muted-foreground">Đang tải...</div>
            </div>
          ) : resources.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed p-16 text-center">
              <span className="text-6xl mb-4">📭</span>
              <h3 className="text-xl font-semibold text-foreground">
                Chưa có tài nguyên nào
              </h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-md">
                Hãy đăng nhập và thêm tài nguyên đầu tiên!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {resources.map((resource) => (
                <Card key={resource.id} className="flex flex-col overflow-hidden transition-shadow hover:shadow-lg">
                  {/* Thumbnail */}
                  <div className="relative aspect-video w-full overflow-hidden bg-muted">
                    {resource.image_url ? (
                      <Image
                        src={resource.image_url}
                        alt={resource.title}
                        fill
                        className="object-cover transition-transform hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground text-4xl">
                        📦
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-lg font-semibold leading-tight line-clamp-2">
                        {resource.title}
                      </h3>
                      {resource.category && (
                        <Badge variant="secondary" className="shrink-0">
                          {resource.category}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  {resource.description && (
                    <CardContent className="pb-4">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {resource.description}
                      </p>
                    </CardContent>
                  )}

                  {/* Link */}
                  <CardFooter className="mt-auto pt-0">
                    <Button asChild variant="outline" className="w-full">
                      <Link href={resource.link} target="_blank" rel="noopener noreferrer">
                        Truy cập →
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="border-t bg-muted/40">
        <div className="mx-auto max-w-6xl px-4 py-8 text-center text-sm text-muted-foreground sm:px-6 lg:px-8">
          © 2026 EngMaster. FER202 Practical Exam.
        </div>
      </footer>
    </main>
  )
}
