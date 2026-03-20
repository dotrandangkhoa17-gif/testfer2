"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import type { User } from "@supabase/supabase-js"

export function Navbar() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast.error("Đăng xuất thất bại: " + error.message)
    } else {
      toast.success("Đã đăng xuất!")
      setUser(null)
      router.push("/login")
      router.refresh()
    }
  }

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight">
          <span className="text-2xl">🎓</span>
          <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
            EngMaster
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {loading ? (
            <div className="h-9 w-20 animate-pulse rounded-lg bg-muted" />
          ) : user ? (
            <>
              <Link
                href="/dashboard"
                className="rounded-lg px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
              >
                Dashboard
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Đăng xuất
              </Button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
              >
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2 text-sm font-medium text-white shadow-md transition-all hover:shadow-lg hover:brightness-110"
              >
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
