'use client'

import { useState, useEffect } from 'react'
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
  { name: 'Travel', slug: 'travel_destination', emoji: '✈️' },
]

const subcategories: Record<string, string[]> = {
  tv_show: ['Drama', 'Comedy', 'Thriller', 'Sci-Fi', 'Documentary', 'Reality', 'Animated', 'Other'],
  movie: ['Drama', 'Comedy', 'Action', 'Thriller', 'Sci-Fi', 'Horror', 'Documentary', 'Animated', 'Other'],
  book: ['Biography', 'Fiction', 'Non-Fiction', 'Self-Improvement', 'Mystery', 'Sci-Fi', 'Fantasy', 'Romance', 'History', 'Other'],
  travel_destination: ['City', 'Beach', 'Mountain', 'Country', 'Island', 'National Park', 'Historical Site', 'Other'],
}

export function ReviewForm({ initialData, mode = 'create' }: ReviewFormProps) {
  const { token } = useAuth()
  const router = useRouter()

  const [formData, setFormData] = useState({
    category: initialData?.category || '',
    subcategory: '',
    subject_name: initialData?.subject_name || '',
    content: initialData?.content || '',
    rating: initialData?.rating || 5.0,
    nft_gate_collection: initialData?.nft_gate_collection || '',
  })

  const [previousSubjects, setPreviousSubjects] = useState<string[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch previously reviewed subjects when category changes
  useEffect(() => {
    if (formData.category && mode === 'create') {
      fetchPreviousSubjects(formData.category)
    }
  }, [formData.category])

  const fetchPreviousSubjects = async (category: string) => {
    setIsLoadingSubjects(true)
    try {
      const response = await fetch(`/api/reviews/subjects?category=${category}`)
      if (response.ok) {
        const data = await response.json()
        setPreviousSubjects(data.subjects || [])
      }
    } catch (error) {
      console.error('Error fetching subjects:', error)
    } finally {
      setIsLoadingSubjects(false)
    }
  }

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => {
      // Reset subcategory when category changes
      if (field === 'category') {
        return { ...prev, [field]: value, subcategory: '' }
      }
      return { ...prev, [field]: value }
    })
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleSubjectSelect = (subject: string) => {
    setFormData(prev => ({ ...prev, subject_name: subject }))
    setShowDropdown(false)
    if (errors.subject_name) {
      setErrors(prev => ({ ...prev, subject_name: '' }))
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.category) newErrors.category = 'Please select a category'
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
      // Auto-generate title from category and subject
      const categoryName = categories.find(c => c.slug === formData.category)?.name || 'Review'
      const autoTitle = `${formData.subject_name} - ${categoryName} Review`

      const submitData: any = {
        ...formData,
        title: autoTitle,
      }

      // Include subcategory in metadata if it exists
      if (formData.subcategory) {
        submitData.subject_metadata = {
          ...(typeof formData.nft_gate_collection === 'object' ? formData.nft_gate_collection : {}),
          subcategory: formData.subcategory,
        }
      }

      const url = mode === 'edit' ? `/api/reviews/${initialData?.id}` : '/api/reviews'
      const method = mode === 'edit' ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(submitData),
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
        <label className="block text-black font-semibold mb-3">
          Category <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {categories.map((cat) => (
            <button
              key={cat.slug}
              type="button"
              onClick={() => handleChange('category', cat.slug)}
              className={`p-4 rounded-lg border-2 transition-all ${
                formData.category === cat.slug
                  ? 'border-plague-green bg-plague-green/10 text-plague-green'
                  : 'border-black/10 bg-white text-black/60 hover:border-black/30'
              }`}
            >
              <div className="text-3xl mb-2">{cat.emoji}</div>
              <div className="text-sm font-semibold">{cat.name}</div>
            </button>
          ))}
        </div>
        {errors.category && <p className="text-red-500 text-sm mt-2">{errors.category}</p>}
      </div>

      {/* Subcategory Selection */}
      {formData.category && subcategories[formData.category] && (
        <div>
          <label className="block text-black font-semibold mb-3">
            Subcategory (Optional)
          </label>
          <select
            value={formData.subcategory}
            onChange={(e) => handleChange('subcategory', e.target.value)}
            className="w-full px-4 py-3 bg-white border border-black/20 rounded-lg text-black focus:border-plague-green focus:outline-none transition-colors"
          >
            <option value="">Select a subcategory...</option>
            {subcategories[formData.category].map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Subject Name with Dropdown */}
      <div className="relative">
        <label htmlFor="subject_name" className="block text-black font-semibold mb-2">
          What are you reviewing? <span className="text-red-500">*</span>
        </label>
        <input
          id="subject_name"
          type="text"
          value={formData.subject_name}
          onChange={(e) => handleChange('subject_name', e.target.value)}
          onFocus={() => previousSubjects.length > 0 && setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          placeholder="e.g., Breaking Bad, The Great Gatsby, Paris"
          className="w-full px-4 py-3 bg-white border border-black/20 rounded-lg text-black placeholder:text-black/40 focus:border-plague-green focus:outline-none transition-colors"
        />

        {/* Dropdown with previous subjects */}
        {showDropdown && previousSubjects.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-black/20 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            <div className="p-2 border-b border-black/10 bg-plague-lightGray">
              <p className="text-xs text-black/60 font-semibold">Previously reviewed:</p>
            </div>
            {previousSubjects.map((subject, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSubjectSelect(subject)}
                className="w-full px-4 py-2 text-left hover:bg-plague-green/10 transition-colors text-black"
              >
                {subject}
              </button>
            ))}
          </div>
        )}

        {errors.subject_name && <p className="text-red-500 text-sm mt-2">{errors.subject_name}</p>}
        {formData.category && !isLoadingSubjects && previousSubjects.length > 0 && (
          <p className="text-black/40 text-xs mt-2">
            💡 Select from previously reviewed {categories.find(c => c.slug === formData.category)?.name.toLowerCase()} or type a new one
          </p>
        )}
      </div>

      {/* Rating */}
      <div>
        <label htmlFor="rating" className="block text-black font-semibold mb-2">
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
            className="flex-1 h-2 bg-black/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-plague-green [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-plague-green [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
          />
          <div className="flex items-center gap-1 min-w-[80px]">
            <span className="text-3xl font-tanker text-plague-green">{formData.rating.toFixed(1)}</span>
            <span className="text-black/60 text-lg">/10</span>
          </div>
        </div>
        {errors.rating && <p className="text-red-500 text-sm mt-2">{errors.rating}</p>}
      </div>

      {/* Content */}
      <div>
        <label htmlFor="content" className="block text-black font-semibold mb-2">
          Your Review <span className="text-red-500">*</span>
        </label>
        <textarea
          id="content"
          value={formData.content}
          onChange={(e) => handleChange('content', e.target.value)}
          placeholder="Share your honest thoughts and experiences..."
          rows={10}
          className="w-full px-4 py-3 bg-white border border-black/20 rounded-lg text-black placeholder:text-black/40 focus:border-plague-green focus:outline-none transition-colors resize-none"
        />
        {errors.content && <p className="text-red-500 text-sm mt-2">{errors.content}</p>}
      </div>

      {/* NFT Gate Collection (Optional) */}
      <div>
        <label htmlFor="nft_gate_collection" className="block text-black font-semibold mb-2">
          NFT Collection Filter (Optional)
        </label>
        <input
          id="nft_gate_collection"
          type="text"
          value={formData.nft_gate_collection}
          onChange={(e) => handleChange('nft_gate_collection', e.target.value)}
          placeholder="e.g., 0x... (contract address)"
          className="w-full px-4 py-3 bg-white border border-black/20 rounded-lg text-black placeholder:text-black/40 focus:border-plague-green focus:outline-none transition-colors"
        />
        <p className="text-black/40 text-xs mt-2">
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
          className="flex-1 px-6 py-4 bg-plague-green text-white font-bold rounded-lg hover:bg-plague-green/80 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isSubmitting ? 'Saving...' : mode === 'edit' ? 'Update Review' : 'Publish Review'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-4 border-2 border-black/20 text-black font-bold rounded-lg hover:border-black/40 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
