import { FamilySection } from "@/components/keluarga/FamilySection"

export default function KeluargaPage() {
  return (
    <div className="space-y-4">
      <div>
        <div className="text-lg font-semibold">Keluarga</div>
        <div className="text-sm text-muted-foreground">Ringkas keuangan bersama keluarga</div>
      </div>
      <FamilySection />
    </div>
  )
}

