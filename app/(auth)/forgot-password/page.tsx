"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Key } from "lucide-react";
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

const forgotPasswordSchema = z.object({
  email: z.string().email("Format email tidak valid"),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const form = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: ForgotPasswordForm) => {
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
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      setIsSent(true);
      toast.success("Link reset kata sandi telah dikirim ke email anda.");
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
            <CardTitle className="text-lg">Lupa Kata Sandi</CardTitle>
          </CardHeader>

          <CardContent>
            {isSent ? (
              <div className="space-y-4 text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Key className="size-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium text-foreground">Email Terkirim</h3>
                  <p className="text-sm text-muted-foreground">
                    Kami telah mengirimkan link untuk mengatur ulang kata sandi ke email Anda. Silakan periksa kotak masuk atau folder spam Anda.
                  </p>
                </div>
                <Link
                  href="/login"
                  className="inline-flex w-full justify-center items-center gap-2 text-sm font-medium text-primary hover:underline"
                >
                  <ArrowLeft className="size-4" /> Kembali ke masuk
                </Link>
              </div>
            ) : (
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  Masukkan email Anda dan kami akan mengirimkan link untuk mengatur ulang kata sandi.
                </p>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@email.com"
                    {...form.register("email")}
                  />
                  {form.formState.errors.email ? (
                    <p className="text-xs text-accent-red">
                      {form.formState.errors.email.message}
                    </p>
                  ) : null}
                </div>

                <Button type="submit" className="w-full animate-in fade-in-50 duration-200" disabled={isLoading}>
                  {isLoading ? "Mengirim..." : "Kirim Link Reset"}
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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
