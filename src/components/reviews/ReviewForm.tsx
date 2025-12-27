'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

interface ReviewFormProps {
  initialData?: {
    id?: string
    title: string
    content: string
    rating: number
    category: string
    subject_name: string
    nft_gate_collection?: string
  }
  mode?: 'create' | 'edit'
}

const categories = [
  { name: 'TV Shows', slug: 'tv_show', emoji: '📺' },
  { name: 'Movies', slug: 'movie', emoji: '🎬' },
  { name: 'Books', slug: 'book', emoji: '📚' },
  { name: 'Sports Teams', slug: 'sports_team', emoji: '⚽' },
  { name: 'Travel', slug: 'travel_destination', emoji: '✈️' },
]

export function ReviewForm({ initialData, mode = 'create' }: ReviewFormProps) {
  const { token } = useAuth()
  const router = useRouter()

  const [formData, setFormData] = useState({
    category: initialData?.category || '',
    title: initialData?.title || '',
    subject_name: initialData?.subject_name || '',
    content: initialData?.content || '',
    rating: initialData?.rating || 5.0,
    nft_gate_collection: initialData?.nft_gate_collection || '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.category) newErrors.category = 'Please select a category'
    if (!formData.title.trim()) newErrors.title = 'Title is required'
    if (!formData.subject_name.trim()) newErrors.subject_name = 'Subject name is required'
    if (!formData.content.trim()) newErrors.content = 'Review content is required'
    if (formData.rating < 0 || formData.rating > 10) {
      newErrors.rating = 'Rating must be between 0 and 10'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setIsSubmitting(true)

    try {
      const url = mode === 'edit' ? `/api/reviews/${initialData?.id}` : '/api/reviews'
      const method = mode === 'edit' ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save review')
      }

      // Redirect to the review page
      router.push(`/reviews/${data.id}`)
    } catch (error) {
      console.error('Error saving review:', error)
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to save review' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Category Selection */}
      <div>
        <label className="block text-white font-semibold mb-3">
          Category <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {categories.map((cat) => (
            <button
              key={cat.slug}
              type="button"
              onClick={() => handleChange('category', cat.slug)}
              className={`p-4 rounded-lg border-2 transition-all ${
                formData.category === cat.slug
                  ? 'border-plague-lime bg-plague-lime/10 text-plague-lime'
                  : 'border-white/10 bg-plague-lightGray text-white/60 hover:border-white/30'
              }`}
            >
              <div className="text-3xl mb-2">{cat.emoji}</div>
              <div className="text-sm font-semibold">{cat.name}</div>
            </button>
          ))}
        </div>
        {errors.category && <p className="text-red-500 text-sm mt-2">{errors.category}</p>}
      </div>

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-white font-semibold mb-2">
          Review Title <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="e.g., A Masterpiece of Modern Television"
          className="w-full px-4 py-3 bg-plague-lightGray border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:border-plague-lime focus:outline-none transition-colors"
        />
        {errors.title && <p className="text-red-500 text-sm mt-2">{errors.title}</p>}
      </div>

      {/* Subject Name */}
      <div>
        <label htmlFor="subject_name" className="block text-white font-semibold mb-2">
          What are you reviewing? <span className="text-red-500">*</span>
        </label>
        <input
          id="subject_name"
          type="text"
          value={formData.subject_name}
          onChange={(e) => handleChange('subject_name', e.target.value)}
          placeholder="e.g., Breaking Bad, The Great Gatsby, Lakers"
          className="w-full px-4 py-3 bg-plague-lightGray border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:border-plague-lime focus:outline-none transition-colors"
        />
        {errors.subject_name && <p className="text-red-500 text-sm mt-2">{errors.subject_name}</p>}
      </div>

      {/* Rating */}
      <div>
        <label htmlFor="rating" className="block text-white font-semibold mb-2">
          Rating <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center gap-4">
          <input
            id="rating"
            type="range"
            min="0"
            max="10"
            step="0.1"
            value={formData.rating}
            onChange={(e) => handleChange('rating', parseFloat(e.target.value))}
            className="flex-1 h-2 bg-plague-lightGray rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-plague-lime [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-plague-lime [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
          />
          <div className="flex items-center gap-1 min-w-[80px]">
            <span className="text-3xl font-tanker text-plague-lime">{formData.rating.toFixed(1)}</span>
            <span className="text-white/60 text-lg">/10</span>
          </div>
        </div>
        {errors.rating && <p className="text-red-500 text-sm mt-2">{errors.rating}</p>}
      </div>

      {/* Content */}
      <div>
        <label htmlFor="content" className="block text-white font-semibold mb-2">
          Your Review <span className="text-red-500">*</span>
        </label>
        <textarea
          id="content"
          value={formData.content}
          onChange={(e) => handleChange('content', e.target.value)}
          placeholder="Share your honest thoughts and experiences..."
          rows={10}
          className="w-full px-4 py-3 bg-plague-lightGray border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:border-plague-lime focus:outline-none transition-colors resize-none"
        />
        {errors.content && <p className="text-red-500 text-sm mt-2">{errors.content}</p>}
      </div>

      {/* NFT Gate Collection (Optional) */}
      <div>
        <label htmlFor="nft_gate_collection" className="block text-white font-semibold mb-2">
          NFT Collection Filter (Optional)
        </label>
        <input
          id="nft_gate_collection"
          type="text"
          value={formData.nft_gate_collection}
          onChange={(e) => handleChange('nft_gate_collection', e.target.value)}
          placeholder="e.g., 0x... (contract address)"
          className="w-full px-4 py-3 bg-plague-lightGray border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:border-plague-lime focus:outline-none transition-colors"
        />
        <p className="text-white/40 text-xs mt-2">
          Optionally filter this review to show only to holders of a specific NFT collection
        </p>
      </div>

      {/* Submit Error */}
      {errors.submit && (
        <div className="p-4 bg-red-500/10 border border-red-500 rounded-lg">
          <p className="text-red-500 text-sm">{errors.submit}</p>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-6 py-4 bg-plague-lime text-black font-bold rounded-lg hover:bg-plague-yellow transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isSubmitting ? 'Saving...' : mode === 'edit' ? 'Update Review' : 'Publish Review'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-4 border-2 border-white/10 text-white font-bold rounded-lg hover:border-white/30 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
