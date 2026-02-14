// Default AM/PM skin routines per skin type
export const skinRoutines = {
  normal: {
    am: [
      { step_name: "Cleanser", description: "Gentle cleanse to remove overnight buildup", optional: false },
      { step_name: "Moisturizer", description: "Lightweight moisturizer for hydration", optional: false },
      { step_name: "SPF", description: "Sunscreen SPF 30+ to protect from UV", optional: false },
    ],
    pm: [
      { step_name: "Cleanser", description: "Double cleanse to remove makeup/sunscreen", optional: false },
      { step_name: "Treatment", description: "Serum or active ingredients", optional: true },
      { step_name: "Moisturizer", description: "Richer moisturizer for overnight repair", optional: false },
    ],
  },
  oily: {
    am: [
      { step_name: "Cleanser", description: "Foaming cleanser to control oil", optional: false },
      { step_name: "Toner", description: "Astringent toner to minimize pores", optional: true },
      { step_name: "Moisturizer", description: "Oil-free, gel-based moisturizer", optional: false },
      { step_name: "SPF", description: "Mattifying sunscreen SPF 30+", optional: false },
    ],
    pm: [
      { step_name: "Cleanser", description: "Deep cleansing to remove excess oil", optional: false },
      { step_name: "Treatment", description: "Salicylic acid or niacinamide serum", optional: false },
      { step_name: "Moisturizer", description: "Lightweight, non-comedogenic moisturizer", optional: false },
    ],
  },
  dry: {
    am: [
      { step_name: "Cleanser", description: "Creamy, hydrating cleanser", optional: false },
      { step_name: "Moisturizer", description: "Rich, emollient moisturizer", optional: false },
      { step_name: "SPF", description: "Hydrating sunscreen SPF 30+", optional: false },
    ],
    pm: [
      { step_name: "Cleanser", description: "Gentle, non-stripping cleanser", optional: false },
      { step_name: "Treatment", description: "Hyaluronic acid or ceramide serum", optional: true },
      { step_name: "Moisturizer", description: "Thick night cream or sleeping mask", optional: false },
    ],
  },
  combination: {
    am: [
      { step_name: "Cleanser", description: "Balancing cleanser", optional: false },
      { step_name: "Toner", description: "Gentle exfoliating toner", optional: true },
      { step_name: "Moisturizer", description: "Lightweight moisturizer, focus on dry areas", optional: false },
      { step_name: "SPF", description: "Broad spectrum SPF 30+", optional: false },
    ],
    pm: [
      { step_name: "Cleanser", description: "Gentle cleanse", optional: false },
      { step_name: "Treatment", description: "Targeted treatment for T-zone", optional: true },
      { step_name: "Moisturizer", description: "Balancing moisturizer", optional: false },
    ],
  },
  sensitive: {
    am: [
      { step_name: "Cleanser", description: "Fragrance-free, gentle cleanser", optional: false },
      { step_name: "Moisturizer", description: "Soothing, barrier-repair moisturizer", optional: false },
      { step_name: "SPF", description: "Mineral sunscreen SPF 30+", optional: false },
    ],
    pm: [
      { step_name: "Cleanser", description: "Ultra-gentle cleanser", optional: false },
      { step_name: "Moisturizer", description: "Calming, fragrance-free night cream", optional: false },
    ],
  },
}

export const getRoutineForSkinType = (skinType: string, isAM: boolean) => {
  const type = skinRoutines[skinType as keyof typeof skinRoutines]
  if (!type) return skinRoutines.normal.am
  return isAM ? type.am : type.pm
}
