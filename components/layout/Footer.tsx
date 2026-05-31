import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-bg-border mt-24 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <div className="font-mono text-lg font-bold mb-2">
              <span className="text-text-primary">TAO</span>
              <span className="text-accent-amber">*</span>
              <span className="text-text-primary">NERDS</span>
            </div>
            <p className="text-sm text-text-muted max-w-xs">
              Subnet intelligence for the Bittensor ecosystem. Community-powered. Founder-verified.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm font-mono text-text-muted">
            <Link href="/" className="hover:text-accent-green transition-colors">Intelligence</Link>
            <Link href="/signal" className="hover:text-accent-green transition-colors">Signal</Link>
            <Link href="/amas" className="hover:text-accent-green transition-colors">AMAs</Link>
            <Link href="/founders" className="hover:text-accent-green transition-colors">Founders</Link>
            <Link href="/vote" className="hover:text-accent-green transition-colors">Vote</Link>
            <Link href="/learn" className="hover:text-accent-green transition-colors">Learn</Link>
          </div>

          <div className="flex flex-col gap-2 text-xs font-mono text-text-muted">
            <a
              href="https://x.com/taonerds"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent-green transition-colors"
            >
              ↗ Follow on X
            </a>
            <span>Content is educational and opinion-based.</span>
            <span>Not financial advice.</span>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-bg-border flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono text-text-muted">
          <span>© {new Date().getFullYear()} TAO NERDS — The Nerds</span>
          <span className="flex items-center gap-1">
            <span className="live-dot" />
            Bittensor Network
          </span>
        </div>
      </div>
    </footer>
  )
}
