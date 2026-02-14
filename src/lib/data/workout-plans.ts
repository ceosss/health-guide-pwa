// Workout plans for different fitness levels and equipment
export const workoutPlans = {
  beginner: {
    none: {
      0: "push", // Sunday - Push
      1: "legs", // Monday - Legs
      2: "rest",
      3: "push", // Wednesday - Push
      4: "legs", // Thursday - Legs
      5: "rest",
      6: "rest",
    },
    home_gym: {
      0: "push",
      1: "pull",
      2: "legs",
      3: "rest",
      4: "push",
      5: "pull",
      6: "rest",
    },
    gym: {
      0: "push",
      1: "pull",
      2: "legs",
      3: "rest",
      4: "push",
      5: "pull",
      6: "rest",
    },
  },
  intermediate: {
    none: {
      0: "push",
      1: "pull",
      2: "legs",
      3: "rest",
      4: "push",
      5: "pull",
      6: "rest",
    },
    home_gym: {
      0: "push",
      1: "pull",
      2: "legs",
      3: "rest",
      4: "push",
      5: "pull",
      6: "rest",
    },
    gym: {
      0: "push",
      1: "pull",
      2: "legs",
      3: "rest",
      4: "push",
      5: "pull",
      6: "rest",
    },
  },
  advanced: {
    home_gym: {
      0: "push",
      1: "pull",
      2: "legs",
      3: "push",
      4: "pull",
      5: "legs",
      6: "rest",
    },
    gym: {
      0: "push",
      1: "pull",
      2: "legs",
      3: "push",
      4: "pull",
      5: "legs",
      6: "rest",
    },
  },
}

export const getWorkoutForDay = (
  fitnessLevel: string,
  equipment: string,
  dayOfWeek: number
): string => {
  const level = workoutPlans[fitnessLevel as keyof typeof workoutPlans]
  if (!level) return "rest"
  
  const equip = level[equipment as keyof typeof level]
  if (!equip) {
    // Fall back to none for beginner
    if (fitnessLevel === "beginner") {
      return workoutPlans.beginner.none[dayOfWeek as keyof typeof workoutPlans.beginner.none] || "rest"
    }
    return "rest"
  }
  
  return equip[dayOfWeek as keyof typeof equip] || "rest"
}
