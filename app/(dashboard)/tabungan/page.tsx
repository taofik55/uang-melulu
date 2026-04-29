import { AddGoalModal } from "@/components/tabungan/AddGoalModal"
import { GoalCard } from "@/components/tabungan/GoalCard"

export default function TabunganPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-semibold">Tabungan</div>
          <div className="text-sm text-muted-foreground">Target tercapai pelan-pelan</div>
        </div>
        <AddGoalModal />
      </div>
      <GoalCard />
    </div>
  )
}

