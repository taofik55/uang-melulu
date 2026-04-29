"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Eye, EyeOff, Wallet } from "lucide-react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { ThemeToggle } from "@/components/shared/ThemeToggle"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"

const loginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(1, "Kata sandi tidak boleh kosong"),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !anonKey) {
      console.warn("[Uang Melulu] Supabase belum dikonfigurasi (.env.local)")
      return
    }

    const supabase = createSupabaseBrowserClient()
    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (error) {
          console.error("[Uang Melulu] Gagal cek sesi Supabase:", error.message)
          return
        }

        const host = new URL(url).host
        console.info("[Uang Melulu] Supabase tersambung:", host)
        console.info("[Uang Melulu] Status sesi:", data.session ? "Sudah login" : "Belum login")
      })
      .catch(() => {
        console.error("[Uang Melulu] Gagal menghubungi Supabase")
      })
  }, [])

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (values: LoginForm) => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      toast.error("Supabase belum dikonfigurasi")
      return
    }

    setIsLoading(true)

    try {
      const supabase = createSupabaseBrowserClient()
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      })

      if (error) {
        toast.error("Email atau kata sandi salah")
        return
      }

      toast.success("Berhasil masuk")
      router.replace("/")
      router.refresh()
    } catch {
      toast.error("Terjadi kesalahan. Coba lagi.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-dvh bg-background">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <div className="mx-auto flex min-h-dvh w-full max-w-md items-center px-4 py-10">
        <Card className="w-full bg-card">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto flex items-center gap-2">
              <div className="grid size-9 place-items-center rounded-xl border border-border bg-primary/15 text-primary">
                <Wallet className="size-4" />
              </div>
              <h1 className="text-xl font-semibold">Uang Melulu</h1>
            </div>
            <CardTitle className="text-lg">Masuk ke akunmu</CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="nama@email.com" {...form.register("email")} />
                {form.formState.errors.email ? (
                  <p className="text-xs text-accent-red">{form.formState.errors.email.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Kata sandi</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan kata sandi"
                    className="pr-10"
                    {...form.register("password")}
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                    aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {form.formState.errors.password ? (
                  <p className="text-xs text-accent-red">{form.formState.errors.password.message}</p>
                ) : null}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Memproses..." : "Masuk"}
              </Button>
            </form>

            <p className="mt-4 text-center text-sm text-muted-foreground">
              Belum punya akun?{" "}
              <Link href="/register" className="font-medium text-primary hover:underline">
                Daftar
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
