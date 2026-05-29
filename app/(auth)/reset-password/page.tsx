"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import Image from "next/image";

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Kata sandi minimal 8 karakter"),
    confirmPassword: z.string().min(1, "Konfirmasi kata sandi wajib diisi"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Konfirmasi kata sandi tidak cocok",
    path: ["confirmPassword"],
  });

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: ResetPasswordForm) => {
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      toast.error("Supabase belum dikonfigurasi");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.updateUser({
        password: values.password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Kata sandi berhasil diperbarui!");
      
      // Sign out to ensure they log in with the new password
      await supabase.auth.signOut();
      router.replace("/login");
    } catch {
      toast.error("Terjadi kesalahan. Coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-dvh bg-background">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <div className="mx-auto flex min-h-dvh w-full max-w-md items-center px-4 py-10">
        <Card className="w-full bg-card">
          <CardHeader className="space-y-4 text-center items-center flex">
            <Image
              src="/uang-melulu.png"
              alt="Uang Melulu"
              width={160}
              height={40}
              priority
              className="h-auto w-1/2 py-4"
            />
            <CardTitle className="text-lg">Atur Ulang Kata Sandi</CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Silakan masukkan kata sandi baru Anda di bawah ini.
              </p>

              <div className="space-y-2">
                <Label htmlFor="password">Kata sandi baru</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimal 8 karakter"
                    className="pr-10"
                    {...form.register("password")}
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                    aria-label={
                      showPassword
                        ? "Sembunyikan kata sandi"
                        : "Tampilkan kata sandi"
                    }
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
                {form.formState.errors.password ? (
                  <p className="text-xs text-accent-red">
                    {form.formState.errors.password.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Konfirmasi kata sandi</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Ulangi kata sandi baru"
                    className="pr-10"
                    {...form.register("confirmPassword")}
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                    aria-label={
                      showConfirmPassword
                        ? "Sembunyikan kata sandi"
                        : "Tampilkan kata sandi"
                    }
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
                {form.formState.errors.confirmPassword ? (
                  <p className="text-xs text-accent-red">
                    {form.formState.errors.confirmPassword.message}
                  </p>
                ) : null}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Menyimpan..." : "Simpan Kata Sandi"}
              </Button>

              <p className="mt-4 text-center text-sm text-muted-foreground">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 font-medium text-primary hover:underline"
                >
                  <ArrowLeft className="size-4" /> Kembali ke masuk
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
