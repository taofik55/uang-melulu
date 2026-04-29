import { ThemeToggle } from "@/components/shared/ThemeToggle"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function PengaturanPage() {
  return (
    <div className="space-y-4">
      <div>
        <div className="text-lg font-semibold">Pengaturan</div>
        <div className="text-sm text-muted-foreground">Atur profil dan preferensi tampilan</div>
      </div>

      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-base">Profil</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Profil demo. Setelah Supabase aktif, data profil ditampilkan di sini.
        </CardContent>
      </Card>

      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-base">Tampilan</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">Mode tema</div>
            <div className="text-sm text-muted-foreground">Mode gelap aktif secara default</div>
          </div>
          <ThemeToggle />
        </CardContent>
      </Card>

      <Separator />

      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-base">Zona Berbahaya</CardTitle>
        </CardHeader>
        <CardContent>
          <button
            type="button"
            className="inline-flex items-center rounded-md border border-border bg-muted px-3 py-2 text-sm text-muted-foreground cursor-not-allowed"
            aria-disabled="true"
          >
            Hapus akun (segera hadir)
          </button>
        </CardContent>
      </Card>
    </div>
  )
}

