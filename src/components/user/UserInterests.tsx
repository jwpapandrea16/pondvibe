'use client'

import { INTEREST_CATEGORIES, InterestCategory } from '@/lib/constants/interests'

interface UserInterestsProps {
  interests: Record<string, string[]>
  isEditing: boolean
  onChange?: (interests: Record<string, string[]>) => void
}

export function UserInterests({ interests, isEditing, onChange }: UserInterestsProps) {
  const toggleInterest = (category: string, subcategory: string) => {
    if (!isEditing || !onChange) return

    const currentCategoryInterests = interests[category] || []
    const newCategoryInterests = currentCategoryInterests.includes(subcategory)
      ? currentCategoryInterests.filter(s => s !== subcategory)
      : [...currentCategoryInterests, subcategory]

    onChange({
      ...interests,
      [category]: newCategoryInterests
    })
  }

  const getTotalCount = () => {
    return Object.values(interests).reduce((sum, arr) => sum + arr.length, 0)
  }

  if (!isEditing && getTotalCount() === 0) {
    return (
      <div className="p-6 rounded-xl bg-plague-lightGray border border-black/10 text-center">
        <p className="text-black/60">No interests selected yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-tanker text-black">
          My Interests {getTotalCount() > 0 && `(${getTotalCount()})`}
        </h3>
        {isEditing && (
          <p className="text-sm text-black/60">Select your favorite genres and topics</p>
        )}
      </div>

      {Object.entries(INTEREST_CATEGORIES).map(([categoryKey, categoryData]) => {
        const categoryInterests = interests[categoryKey] || []

        // In view mode, only show categories with selections
        if (!isEditing && categoryInterests.length === 0) {
          return null
        }

        return (
          <div key={categoryKey} className="space-y-3">
            <h4 className="text-black font-semibold flex items-center gap-2">
              <span>{categoryData.emoji}</span>
              <span>{categoryData.name}</span>
              {categoryInterests.length > 0 && (
                <span className="text-sm text-plague-green">
                  ({categoryInterests.length})
                </span>
              )}
            </h4>
            <div className="flex flex-wrap gap-2">
              {categoryData.subcategories.map(subcategory => {
                const isSelected = categoryInterests.includes(subcategory)

                return (
                  <button
                    key={subcategory}
                    onClick={() => toggleInterest(categoryKey, subcategory)}
                    disabled={!isEditing}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-plague-green bg-plague-green/10 text-plague-green'
                        : isEditing
                        ? 'border-black/10 bg-white text-black/60 hover:border-black/30 cursor-pointer'
                        : 'border-black/10 bg-white text-black/60'
                    } ${!isEditing && !isSelected ? 'hidden' : ''}`}
                  >
                    {subcategory}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
