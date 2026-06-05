// HomePlate — flat geometric food illustrations for meal types.
// Style: filled shapes, bold, multi-colour, geometric.
// Each renders at any size via `size` prop. ViewBox 0 0 48 48.

function FoodIcon({ size = 48, children }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {children}
    </svg>
  )
}

// Breakfast: fried egg
export function FoodBreakfast({ size = 48 }) {
  return (
    <FoodIcon size={size}>
      <g fill="#F5EDD3">
        <circle cx="24" cy="28" r="12.5" />
        <circle cx="13" cy="21" r="7" />
        <circle cx="36" cy="22" r="6" />
        <circle cx="32" cy="33" r="6" />
      </g>
      <circle cx="22" cy="25" r="7" fill="#F4A61E" />
      <circle cx="20" cy="22.5" r="2.5" fill="#F8C84E" />
    </FoodIcon>
  )
}

// Lunch: burger stack
export function FoodLunch({ size = 48 }) {
  return (
    <FoodIcon size={size}>
      <path d="M11 23 a13 10 0 0 1 26 0 Z" fill="#E8A84C" />
      <ellipse cx="19" cy="18" rx="1.8" ry="1.1" fill="#F5EDD3" transform="rotate(-20 19 18)" />
      <ellipse cx="26" cy="15" rx="1.8" ry="1.1" fill="#F5EDD3" transform="rotate(10 26 15)" />
      <ellipse cx="31" cy="19" rx="1.6" ry="1" fill="#F5EDD3" transform="rotate(-10 31 19)" />
      <path d="M9 23 H39 v2 q-4 3 -7.5 0 q-4 3 -7.5 0 q-4 3 -7.5 0 q-4 3 -7.5 0 v-2 Z" fill="#6DAF3C" />
      <rect x="10" y="27" width="28" height="3.5" rx="1.5" fill="#D84030" />
      <rect x="10" y="31.5" width="28" height="4.5" rx="2" fill="#8A5228" />
      <path d="M10 36 H38 a4 4 0 0 1 -4 5 H14 a4 4 0 0 1 -4 -5 Z" fill="#E8A84C" />
    </FoodIcon>
  )
}

// Dinner: bowl of rice / grain
export function FoodDinner({ size = 48 }) {
  return (
    <FoodIcon size={size}>
      <path d="M11 26 a13 9 0 0 1 26 0 Z" fill="#F4C233" />
      <circle cx="19" cy="21.5" r="2.4" fill="#D84030" />
      <circle cx="28" cy="20.5" r="2.4" fill="#5BA63C" />
      <circle cx="23.5" cy="23.5" r="2" fill="#F0913C" />
      <path d="M10 26 H38 a14.5 12.5 0 0 1 -28 0 Z" fill="#3E7D33" />
      <rect x="10" y="25" width="28" height="2.5" rx="1.2" fill="#2E6424" />
    </FoodIcon>
  )
}

// Side: herb sprig / leaves
export function FoodSide({ size = 48 }) {
  return (
    <FoodIcon size={size}>
      <path d="M24 42 V14" stroke="#3E7D33" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <path d="M24 36 C 16 34 10 26 11 18 C 20 20 25 28 24 36 Z" fill="#6DAF3C" />
      <path d="M24 30 C 32 28 38 20 37 12 C 28 14 23 22 24 30 Z" fill="#4E9B3A" />
      <path d="M24 36 C 18 30 14 24 13 19" stroke="#3E7D33" strokeWidth="1.1" fill="none" strokeLinecap="round" />
      <path d="M24 30 C 30 24 34 18 35 13" stroke="#3A7D2E" strokeWidth="1.1" fill="none" strokeLinecap="round" />
      <path d="M24 22 C 20 15 22 8 24 5 C 26 8 28 15 24 22 Z" fill="#7FB23C" />
      <path d="M24 22 C 24 15 24 9 24 5" stroke="#4A9030" strokeWidth="1.1" fill="none" strokeLinecap="round" />
    </FoodIcon>
  )
}

// Snack: apple
export function FoodSnack({ size = 48 }) {
  return (
    <FoodIcon size={size}>
      <path d="M24 13 C 19 10 11 12 10 20 C 9 30 17 40 24 40 C 31 40 39 30 38 20 C 37 12 29 10 24 13 Z" fill="#D84030" />
      <path d="M15 19 c 0 5 2 9 4 12" stroke="#E8705F" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M24 13 V7" stroke="#7A4A22" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <path d="M24 10 C 27 6 33 5 34 8 C 32 12 27 12 24 10 Z" fill="#5BA63C" />
    </FoodIcon>
  )
}

// Dessert: cupcake
export function FoodDessert({ size = 48 }) {
  return (
    <FoodIcon size={size}>
      <path d="M13 24 C 12 14 19 8 24 8 C 29 8 36 14 35 24 Z" fill="#F5EDD3" />
      <path d="M20 22 C 22 16 26 16 28 22" stroke="#E0D4B8" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <rect x="18" y="11" width="4" height="1.4" rx=".7" fill="#F0913C" transform="rotate(-30 18 11)" />
      <rect x="25" y="10" width="3.5" height="1.4" rx=".7" fill="#5BA63C" transform="rotate(20 25 10)" />
      <rect x="29" y="13" width="3.5" height="1.4" rx=".7" fill="#F4C233" transform="rotate(-15 29 13)" />
      <circle cx="24" cy="8.5" r="3.2" fill="#D84030" />
      <path d="M24 5.3 C 24 3 27 2 28 4" stroke="#7A4A22" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <path d="M13 25 H35 L32 39 a2 2 0 0 1 -2 2 H18 a2 2 0 0 1 -2 -2 Z" fill="#F0913C" />
      <g stroke="#D97820" strokeWidth="1.4" strokeLinecap="round" fill="none">
        <path d="M19.5 25.5 L18.5 39" />
        <path d="M24 25.5 V40" />
        <path d="M28.5 25.5 L29.5 39" />
      </g>
    </FoodIcon>
  )
}

// Beverage: cocktail / martini glass
export function FoodBeverage({ size = 48 }) {
  return (
    <FoodIcon size={size}>
      <path d="M9 14 L39 14 L24 34 Z" fill="#F4C233" />
      <path d="M10 14 L19 14 L13 21 Z" fill="rgba(255,255,255,0.28)" />
      <line x1="24" y1="34" x2="24" y2="41" stroke="#3E443A" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="16" y1="41" x2="32" y2="41" stroke="#3E443A" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="35" cy="14" r="5.5" fill="#F0913C" />
      <path d="M35 8.5 V19.5M29.5 14 H40.5M31 10 L39 18M31 18 L39 10" stroke="#D97820" strokeWidth="0.9" strokeLinecap="round" fill="none" />
      <circle cx="33.5" cy="11.5" r="1.4" fill="rgba(255,255,255,0.35)" />
    </FoodIcon>
  )
}

// Category → FoodIcon component map (for convenience)
export const FOOD_ICON_MAP = {
  breakfast: FoodBreakfast,
  lunch:     FoodLunch,
  dinner:    FoodDinner,
  side:      FoodSide,
  snack:     FoodSnack,
  dessert:   FoodDessert,
  beverage:  FoodBeverage,
  other:     FoodDinner,
}
