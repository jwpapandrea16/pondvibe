import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { FadeIn } from '@/components/animations/FadeIn'
import { StaggerContainer, StaggerItem } from '@/components/animations/StaggerContainer'

const categories = [
  { name: 'TV Shows', slug: 'tv_show', emoji: '📺', description: 'Series & streaming content' },
  { name: 'Movies', slug: 'movie', emoji: '🎬', description: 'Films & cinema' },
  { name: 'Books', slug: 'book', emoji: '📚', description: 'Literature & reading' },
  { name: 'Sports Teams', slug: 'sports_team', emoji: '⚽', description: 'Teams & athletics' },
  { name: 'Travel', slug: 'travel_destination', emoji: '✈️', description: 'Destinations & experiences' },
]

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-24 md:py-32 px-4">
          <div className="absolute inset-0 bg-gradient-to-b from-plague-darkGray to-black" />

          <div className="container relative mx-auto max-w-6xl">
            <div className="text-center space-y-8">
              <FadeIn delay={0.1}>
                <h1 className="text-5xl md:text-7xl font-tanker text-white glow-lime">
                  POND VIBE
                </h1>
              </FadeIn>

              <FadeIn delay={0.2}>
                <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto">
                  Verified Reviews from the{' '}
                  <span className="text-plague-lime font-semibold">Plague Community</span>
                </p>
              </FadeIn>

              <FadeIn delay={0.3}>
                <p className="text-lg text-white/60 max-w-2xl mx-auto">
                  Share and discover authentic reviews of TV shows, movies, books, sports teams, and travel destinations.
                  Powered by NFT verification.
                </p>
              </FadeIn>

              <FadeIn delay={0.4}>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
                  <Link
                    href="/reviews"
                    className="px-8 py-4 bg-plague-lime text-black font-bold rounded-lg hover:bg-plague-yellow transition-all hover:scale-105 text-lg"
                  >
                    Browse Reviews
                  </Link>
                  <Link
                    href="/reviews/new"
                    className="px-8 py-4 border-2 border-plague-lime text-plague-lime font-bold rounded-lg hover:bg-plague-lime/10 transition-colors text-lg"
                  >
                    Write a Review
                  </Link>
                </div>
              </FadeIn>

              <FadeIn delay={0.5}>
                <div className="pt-8 flex items-center justify-center gap-2 text-sm text-white/40">
                  <span>🐸</span>
                  <span>Powered by Plague & Exodus Plague NFTs</span>
                  <span>🐸</span>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16 px-4 bg-plague-darkGray">
          <div className="container mx-auto max-w-6xl">
            <FadeIn delay={0.2}>
              <h2 className="text-3xl md:text-4xl font-tanker text-white text-center mb-12">
                Browse by Category
              </h2>
            </FadeIn>

            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <StaggerItem key={category.slug}>
                  <Link
                    href={`/reviews?category=${category.slug}`}
                    className="group p-6 rounded-xl bg-plague-lightGray border border-white/10 hover:border-plague-lime transition-all hover:scale-105 block"
                  >
                    <div className="text-4xl mb-3">{category.emoji}</div>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-plague-lime transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-white/60 text-sm">{category.description}</p>
                  </Link>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 px-4 bg-black">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl md:text-4xl font-tanker text-white text-center mb-12">
              How It Works
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-plague-lime/20 border-2 border-plague-lime flex items-center justify-center">
                  <span className="text-2xl">1</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Connect Wallet</h3>
                <p className="text-white/60">
                  Connect your Ethereum wallet to verify your Plague NFT ownership
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-plague-lime/20 border-2 border-plague-lime flex items-center justify-center">
                  <span className="text-2xl">2</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Write Reviews</h3>
                <p className="text-white/60">
                  Share your honest opinions and rate your favorite content
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-plague-lime/20 border-2 border-plague-lime flex items-center justify-center">
                  <span className="text-2xl">3</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Connect with Community</h3>
                <p className="text-white/60">
                  Follow other Plague holders and discover curated recommendations
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
