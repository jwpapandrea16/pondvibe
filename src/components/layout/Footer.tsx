import Link from 'next/link'

export function Footer() {
  return (
    <footer className="w-full border-t border-black/10 bg-plague-darkGray">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-tanker text-plague-green">
              POND VIBE
            </span>
            <span className="text-black/60 text-sm">
              Verified Reviews from the Plague Community
            </span>
          </div>

          <div className="flex gap-6 text-sm text-black/60">
            <Link href="/reviews" className="hover:text-plague-green transition-colors">
              Reviews
            </Link>
            <a
              href="https://opensea.io/collection/the-plague"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-plague-green transition-colors"
            >
              The Plague NFT
            </a>
            <a
              href="https://exodus.plaguebrands.io"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-plague-green transition-colors"
            >
              Exodus Plague
            </a>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-black/40">
          © {new Date().getFullYear()} Pond Vibe. Powered by Ethereum.
        </div>
      </div>
    </footer>
  )
}
