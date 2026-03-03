import type { Product } from "../types";

export const ALL_PRODUCTS: Product[] = [
  // Drinks
  { id: "cola", name: "Cola", basePrice: 2.0, tags: ["Drink", "Sweet"] },
  { id: "water", name: "Water", basePrice: 1.0, tags: ["Drink"] },
  { id: "energy_drink", name: "Energy Drink", basePrice: 3.5, tags: ["Drink", "Caffeine"] },
  { id: "iced_tea", name: "Iced Tea", basePrice: 2.5, tags: ["Drink", "Sweet"] },
  { id: "black_coffee", name: "Black Coffee", basePrice: 2.0, tags: ["Drink", "Caffeine"] },

  // Snacks
  { id: "chips", name: "Chips", basePrice: 1.5, tags: ["Snack", "Salty"] },
  { id: "pretzels", name: "Pretzels", basePrice: 1.5, tags: ["Snack", "Salty"] },
  { id: "candy_bar", name: "Candy Bar", basePrice: 1.0, tags: ["Snack", "Sweet"] },
  { id: "cookies", name: "Cookies", basePrice: 2.0, tags: ["Snack", "Sweet"] },
  { id: "trail_mix", name: "Trail Mix", basePrice: 2.5, tags: ["Snack", "Salty", "Sweet"] },

  // Caffeine items
  { id: "espresso_shot", name: "Espresso Shot", basePrice: 4.0, tags: ["Caffeine", "Drink"] },
  { id: "caffeine_gum", name: "Caffeine Gum", basePrice: 1.5, tags: ["Caffeine", "Snack"] },

  // Specialty
  { id: "jerky", name: "Beef Jerky", basePrice: 3.0, tags: ["Snack", "Salty"] },
  { id: "chocolate", name: "Dark Chocolate", basePrice: 2.5, tags: ["Snack", "Sweet", "Caffeine"] },
  { id: "popcorn", name: "Popcorn", basePrice: 1.5, tags: ["Snack", "Salty"] },
];
