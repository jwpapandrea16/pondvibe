'use client'

import { useRouter, useSearchParams } from 'next/navigation'

const categories = [
  { name: 'All', slug: '', emoji: '📝' },
  { name: 'TV Shows', slug: 'tv_show', emoji: '📺' },
  { name: 'Movies', slug: 'movie', emoji: '🎬' },
  { name: 'Books', slug: 'book', emoji: '📚' },
  { name: 'Travel', slug: 'travel_destination', emoji: '✈️' },
]

const sortOptions = [
  { name: 'Most Recent', value: 'recent' },
  { name: 'Top Rated', value: 'top_rated' },
  { name: 'Most Liked', value: 'most_liked' },
]

export function ReviewFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentCategory = searchParams.get('category') || ''
  const currentSort = searchParams.get('sortBy') || 'recent'
  const currentNftContract = searchParams.get('nftContract') || ''

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    // Reset to first page when filter changes
    params.delete('offset')

    router.push(`/reviews?${params.toString()}`)
  }

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div>
        <h3 className="text-white font-semibold mb-3">Category</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => updateFilter('category', cat.slug)}
              className={`px-4 py-2 rounded-lg border-2 transition-all ${
                currentCategory === cat.slug
                  ? 'border-plague-lime bg-plague-lime/10 text-plague-lime'
                  : 'border-white/10 bg-plague-lightGray text-white/60 hover:border-white/30'
              }`}
            >
              <span className="mr-2">{cat.emoji}</span>
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Sort Options */}
      <div>
        <h3 className="text-white font-semibold mb-3">Sort By</h3>
        <div className="flex flex-wrap gap-2">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => updateFilter('sortBy', option.value)}
              className={`px-4 py-2 rounded-lg border-2 transition-all ${
                currentSort === option.value
                  ? 'border-plague-lime bg-plague-lime/10 text-plague-lime'
                  : 'border-white/10 bg-plague-lightGray text-white/60 hover:border-white/30'
              }`}
            >
              {option.name}
            </button>
          ))}
        </div>
      </div>

      {/* NFT Collection Filter */}
      <div>
        <h3 className="text-white font-semibold mb-3">NFT Collection</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={currentNftContract}
            onChange={(e) => updateFilter('nftContract', e.target.value)}
            placeholder="Filter by contract address (0x...)"
            className="flex-1 px-4 py-2 bg-plague-lightGray border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:border-plague-lime focus:outline-none transition-colors"
          />
          {currentNftContract && (
            <button
              onClick={() => updateFilter('nftContract', '')}
              className="px-4 py-2 bg-white/5 text-white/60 rounded-lg hover:bg-white/10 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
        <p className="text-white/40 text-xs mt-2">
          View reviews from holders of specific NFT collections
        </p>
      </div>

      {/* Quick Filters for Plague Collections */}
      <div>
        <h3 className="text-white font-semibold mb-3">Quick Filters</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => updateFilter('nftContract', process.env.NEXT_PUBLIC_PLAGUE_NFT_CONTRACT || '')}
            className={`px-4 py-2 rounded-lg border-2 transition-all ${
              currentNftContract === process.env.NEXT_PUBLIC_PLAGUE_NFT_CONTRACT
                ? 'border-plague-lime bg-plague-lime/10 text-plague-lime'
                : 'border-white/10 bg-plague-lightGray text-white/60 hover:border-white/30'
            }`}
          >
            <span className="mr-2">🐸</span>
            Plague NFT
          </button>
          <button
            onClick={() => updateFilter('nftContract', process.env.NEXT_PUBLIC_EXODUS_PLAGUE_CONTRACT || '')}
            className={`px-4 py-2 rounded-lg border-2 transition-all ${
              currentNftContract === process.env.NEXT_PUBLIC_EXODUS_PLAGUE_CONTRACT
                ? 'border-plague-lime bg-plague-lime/10 text-plague-lime'
                : 'border-white/10 bg-plague-lightGray text-white/60 hover:border-white/30'
            }`}
          >
            <span className="mr-2">🐸</span>
            Exodus Plague
          </button>
          {(currentNftContract &&
            currentNftContract !== process.env.NEXT_PUBLIC_PLAGUE_NFT_CONTRACT &&
            currentNftContract !== process.env.NEXT_PUBLIC_EXODUS_PLAGUE_CONTRACT) && (
            <button
              onClick={() => updateFilter('nftContract', '')}
              className="px-4 py-2 rounded-lg border-2 border-white/10 bg-plague-lightGray text-white/60 hover:border-white/30 transition-all"
            >
              Show All
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
