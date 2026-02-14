import { Card, CardContent } from "@/components/ui/card"

interface FocusCardProps {
  goal?: string
}

export function FocusCard({ goal }: FocusCardProps) {
  const getMotivationalText = () => {
    switch (goal) {
      case "lose_fat":
        return "Consistency is key. Every healthy choice brings you closer to your goal."
      case "build_muscle":
        return "Progressive overload today, strength tomorrow. Keep pushing!"
      case "body_recomp":
        return "Patience pays off. Trust the process and stay consistent."
      case "athletic":
        return "Train like an athlete. Speed, power, endurance - build them all."
      case "bulk":
        return "Fuel your gains. Eat well, train hard, grow strong."
      case "lean_toned":
        return "Sculpt your physique. Every rep brings definition."
      case "maintain":
        return "Maintenance is success. Keep up the great habits you've built."
      default:
        return "Small steps every day lead to big changes over time."
    }
  }

  return (
    <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
      <CardContent className="py-4">
        <p className="text-sm font-medium text-center">
          {getMotivationalText()}
        </p>
      </CardContent>
    </Card>
  )
}
