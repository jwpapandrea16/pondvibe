export const INTEREST_CATEGORIES = {
  tv_show: {
    name: 'TV Shows',
    emoji: '📺',
    subcategories: ['Drama', 'Comedy', 'Thriller', 'Sci-Fi', 'Documentary', 'Reality', 'Animated', 'Other']
  },
  movie: {
    name: 'Movies',
    emoji: '🎬',
    subcategories: ['Drama', 'Comedy', 'Action', 'Thriller', 'Sci-Fi', 'Horror', 'Documentary', 'Animated', 'Other']
  },
  book: {
    name: 'Books',
    emoji: '📚',
    subcategories: ['Biography', 'Fiction', 'Non-Fiction', 'Self-Improvement', 'Mystery', 'Sci-Fi', 'Fantasy', 'Romance', 'History', 'Other']
  },
  travel_destination: {
    name: 'Travel',
    emoji: '✈️',
    subcategories: ['City', 'Beach', 'Mountain', 'Country', 'Island', 'National Park', 'Historical Site', 'Other']
  }
} as const

export type InterestCategory = keyof typeof INTEREST_CATEGORIES
