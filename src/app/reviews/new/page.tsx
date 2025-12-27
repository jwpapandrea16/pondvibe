import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ReviewForm } from '@/components/reviews/ReviewForm'
import { CreateReviewGuard } from '@/components/reviews/CreateReviewGuard'

export default function NewReviewPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <CreateReviewGuard>
            <div className="mb-8">
              <h1 className="text-4xl md:text-5xl font-tanker text-black mb-4">
                Write a Review
              </h1>
              <p className="text-black/60 text-lg">
                Share your authentic thoughts with the Plague community
              </p>
            </div>

            <div className="p-8 rounded-xl bg-plague-darkGray border border-black/10">
              <ReviewForm mode="create" />
            </div>
          </CreateReviewGuard>
        </div>
      </main>

      <Footer />
    </div>
  )
}
